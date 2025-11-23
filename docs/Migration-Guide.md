# Migration Guide: Authentication Handler (v1.3.1+)

## Overview

Starting from version **1.3.1**, Cocobase has introduced a new authentication architecture with a dedicated `AuthHandler` class. This improves code organization, maintainability, and provides better TypeScript support.

**Good news:** Most existing code continues to work! The old authentication methods are deprecated but still functional.

## ⚠️ Breaking Change: Google OAuth

> **IMPORTANT:** The Google OAuth implementation has changed in v1.3.1+. The old redirect-based flow (`loginWithGoogle()` returning a URL) is **no longer supported** and has been replaced with Google's ID token verification method.

**What changed:**
- ❌ **Removed:** `loginWithGoogle()` - redirect flow
- ❌ **Removed:** `completeGoogleLogin(token)` - callback handler
- ✅ **New:** `loginWithGoogle(idToken, platform)` - ID token verification

**Migration required:** If you're using Google OAuth, you must update your implementation to use Google Identity Services. See [Example 6: Google OAuth](#example-6-google-oauth) below.

## What Changed?

### New Authentication Architecture

All authentication methods are now accessible via the `db.auth.*` namespace:

```typescript
// ❌ Old way (deprecated but still works)
await db.login("user@example.com", "password");
const user = db.user;
const token = db.getToken();

// ✅ New way (recommended)
await db.auth.login("user@example.com", "password");
const user = db.auth.getUser();
const token = db.auth.getToken();
```

## Benefits of Migrating

- 🏗️ **Better Code Organization**: Clean separation of authentication logic
- 📚 **Improved Documentation**: Comprehensive JSDoc comments with examples
- 🔄 **Better State Management**: Enhanced token and user synchronization
- 🛡️ **Enhanced Error Handling**: More descriptive error messages
- 📊 **Future-Proof**: New features will be added to `db.auth.*`

## Complete Migration Reference

### Authentication Methods

| Old Method (Deprecated) | New Method (Recommended) |
|------------------------|--------------------------|
| `db.login(email, password)` | `db.auth.login(email, password)` |
| `db.register(email, password, data?)` | `db.auth.register(email, password, data?)` |
| `db.registerWithFiles(...)` | `db.auth.registerWithFiles(...)` |
| `db.loginWithGoogle()` | `db.auth.loginWithGoogle()` |
| `db.completeGoogleLogin(token)` | `db.auth.completeGoogleLogin(token)` |
| `db.logout()` | `db.auth.logout()` |
| `db.initAuth()` | `db.auth.initAuth()` |

### User Management Methods

| Old Method (Deprecated) | New Method (Recommended) |
|------------------------|--------------------------|
| `db.getCurrentUser()` | `db.auth.getCurrentUser()` |
| `db.updateUser(data?, email?, password?)` | `db.auth.updateUser(data?, email?, password?)` |
| `db.updateUserWithFiles(...)` | `db.auth.updateUserWithFiles(...)` |
| `db.listUsers(query?)` | `db.auth.listUsers(query?)` |
| `db.getUserById(userId)` | `db.auth.getUserById(userId)` |

### State & Utility Methods

| Old Method (Deprecated) | New Method (Recommended) |
|------------------------|--------------------------|
| `db.user` | `db.auth.getUser()` |
| `db.getToken()` | `db.auth.getToken()` |
| `db.setToken(token)` | `db.auth.setToken(token)` |
| `db.isAuthenticated()` | `db.auth.isAuthenticated()` |
| `db.hasRole(role)` | `db.auth.hasRole(role)` |

## Step-by-Step Migration Examples

### Example 1: Basic Login Flow

**Before (v1.2.0 and earlier):**
```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// Login
await db.login('user@example.com', 'password123');

// Check authentication
if (db.isAuthenticated()) {
  console.log('Logged in as:', db.user.email);
  console.log('Token:', db.getToken());
}

// Logout
db.logout();
```

**After (v1.3.1+):**
```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',        // Get from cocobase.buzz
  projectId: 'your-project-id'   // Get from cocobase.buzz
});

// Login
await db.auth.login('user@example.com', 'password123');

// Check authentication
if (db.auth.isAuthenticated()) {
  console.log('Logged in as:', db.auth.getUser().email);
  console.log('Token:', db.auth.getToken());
}

// Logout
db.auth.logout();
```

### Example 2: User Registration

**Before:**
```typescript
// Register new user
await db.register('newuser@example.com', 'password123', {
  username: 'johndoe',
  fullName: 'John Doe'
});

// User is automatically logged in
console.log('Registered user:', db.user);
```

**After:**
```typescript
// Register new user
await db.auth.register('newuser@example.com', 'password123', {
  username: 'johndoe',
  fullName: 'John Doe'
});

// User is automatically logged in
console.log('Registered user:', db.auth.getUser());
```

### Example 3: File Uploads with Registration

**Before:**
```typescript
await db.registerWithFiles(
  'user@example.com',
  'password123',
  { username: 'johndoe' },
  { avatar: avatarFile, cover_photo: coverFile }
);

console.log('User avatar:', db.user.avatar);
```

**After:**
```typescript
await db.auth.registerWithFiles(
  'user@example.com',
  'password123',
  { username: 'johndoe' },
  { avatar: avatarFile, cover_photo: coverFile }
);

console.log('User avatar:', db.auth.getUser().avatar);
```

### Example 4: Session Restoration

**Before:**
```typescript
// On app load
await db.initAuth();

if (db.isAuthenticated()) {
  console.log('Welcome back,', db.user.email);
}
```

**After:**
```typescript
// On app load
await db.auth.initAuth();

if (db.auth.isAuthenticated()) {
  console.log('Welcome back,', db.auth.getUser().email);
}
```

### Example 5: User Profile Updates

**Before:**
```typescript
// Update user profile
await db.updateUser(
  { bio: 'Software developer' },
  undefined,
  undefined
);

// Update with files
await db.updateUserWithFiles(
  { bio: 'Updated bio' },
  undefined,
  undefined,
  { avatar: newAvatarFile }
);
```

**After:**
```typescript
// Update user profile
await db.auth.updateUser(
  { bio: 'Software developer' },
  undefined,
  undefined
);

// Update with files
await db.auth.updateUserWithFiles(
  { bio: 'Updated bio' },
  undefined,
  undefined,
  { avatar: newAvatarFile }
);
```

### Example 6: Google OAuth

> **⚠️ BREAKING CHANGE:** Google OAuth implementation has changed in v1.3.1+. The old redirect-based flow is replaced with Google's ID token verification.

**Before (Old redirect flow - NO LONGER SUPPORTED):**
```typescript
// Initiate Google login
const { url } = await db.loginWithGoogle();
window.location.href = url;

// After redirect
const token = new URLSearchParams(window.location.search).get('token');
if (token) {
  await db.completeGoogleLogin(token);
  console.log('Logged in:', db.user);
}
```

**After (New ID token flow):**
```typescript
// Load Google Sign-In script
<script src="https://accounts.google.com/gsi/client" async defer></script>

// Initialize Google Sign-In
google.accounts.id.initialize({
  client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  callback: handleGoogleSignIn
});

// Render button
google.accounts.id.renderButton(
  document.getElementById('google-signin-button'),
  { theme: 'outline', size: 'large' }
);

// Handle sign-in
async function handleGoogleSignIn(response) {
  const user = await db.auth.loginWithGoogle(response.credential, 'web');
  console.log('Logged in:', user.email);
}
```

See the [Google OAuth Documentation](Authentication.md#google-oauth) for complete implementation examples.

### Example 7: Role-Based Access Control

**Before:**
```typescript
if (db.hasRole('admin')) {
  console.log('User is an admin');
  // Show admin features
}
```

**After:**
```typescript
if (db.auth.hasRole('admin')) {
  console.log('User is an admin');
  // Show admin features
}
```

### Example 8: List Users (Admin Feature)

**Before:**
```typescript
const users = await db.listUsers({
  filters: { status: 'active' },
  limit: 10,
  sort: 'created_at',
  order: 'desc'
});
```

**After:**
```typescript
const users = await db.auth.listUsers({
  filters: { status: 'active' },
  limit: 10,
  sort: 'created_at',
  order: 'desc'
});
```

## Framework-Specific Migration

### React / Next.js

**Before:**
```typescript
// lib/cocobase.ts
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
  projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID!
});

// components/Profile.tsx
export function Profile() {
  const [user, setUser] = useState(db.user);

  useEffect(() => {
    if (db.isAuthenticated()) {
      setUser(db.user);
    }
  }, []);

  return <div>{user?.email}</div>;
}
```

**After:**
```typescript
// lib/cocobase.ts
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
  projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID!
});

// components/Profile.tsx
export function Profile() {
  const [user, setUser] = useState(db.auth.getUser());

  useEffect(() => {
    if (db.auth.isAuthenticated()) {
      setUser(db.auth.getUser());
    }
  }, []);

  return <div>{user?.email}</div>;
}
```

### Vue / Nuxt

**Before:**
```vue
<script setup>
import { db } from '@/lib/cocobase';

const user = ref(db.user);

onMounted(async () => {
  await db.initAuth();
  if (db.isAuthenticated()) {
    user.value = db.user;
  }
});
</script>
```

**After:**
```vue
<script setup>
import { db } from '@/lib/cocobase';

const user = ref(db.auth.getUser());

onMounted(async () => {
  await db.auth.initAuth();
  if (db.auth.isAuthenticated()) {
    user.value = db.auth.getUser();
  }
});
</script>
```

## Migration Checklist

Use this checklist to ensure a complete migration:

- [ ] Replace all `db.login()` with `db.auth.login()`
- [ ] Replace all `db.register()` with `db.auth.register()`
- [ ] Replace all `db.user` with `db.auth.getUser()`
- [ ] Replace all `db.getToken()` with `db.auth.getToken()`
- [ ] Replace all `db.isAuthenticated()` with `db.auth.isAuthenticated()`
- [ ] Replace all `db.logout()` with `db.auth.logout()`
- [ ] Replace all `db.initAuth()` with `db.auth.initAuth()`
- [ ] Replace all file upload methods (`registerWithFiles`, `updateUserWithFiles`)
- [ ] Replace all user management methods (`getCurrentUser`, `updateUser`, `listUsers`)
- [ ] Replace all utility methods (`hasRole`, `setToken`)
- [ ] Update TypeScript types if using custom type guards
- [ ] Test authentication flow end-to-end
- [ ] Test file uploads if used
- [ ] Test role-based access if used

## Automated Migration (Find & Replace)

You can use these regex patterns for automated migration:

```regex
# Login
db\.login\( → db.auth.login(

# Register
db\.register\( → db.auth.register(

# User property
db\.user([^a-zA-Z]) → db.auth.getUser()$1

# Get token
db\.getToken\( → db.auth.getToken(

# Is authenticated
db\.isAuthenticated\( → db.auth.isAuthenticated(

# Logout
db\.logout\( → db.auth.logout(

# Init auth
db\.initAuth\( → db.auth.initAuth(
```

**⚠️ Warning:** Always review automated changes before committing!

## Timeline and Deprecation Schedule

- **v1.3.1 (Current)**: Old methods deprecated but fully functional with warnings
- **v2.0.0 (Future)**: Old methods will be removed (estimated Q2 2026)

You have plenty of time to migrate, but we recommend doing it sooner to:
- Get access to new features
- Improve code maintainability
- Benefit from better error messages

## Need Help?

If you encounter issues during migration:

- 📖 [Authentication Guide](./guides/authentication.md)
- 💬 [Discord Community](https://discord.gg/cocobase)
- 🐛 [Report Issues](https://github.com/lordace-coder/coco_base_js/issues)
- 📧 [Email Support](mailto:hello@cocobase.buzz)

## What's NOT Changing?

These methods remain exactly the same:

✅ All document operations (`createDocument`, `updateDocument`, `deleteDocument`, `listDocuments`, etc.)
✅ File uploads for collections (`createDocumentWithFiles`, `updateDocumentWithFiles`)
✅ Batch operations (`createDocuments`, `updateDocuments`, `deleteDocuments`)
✅ Query and filtering
✅ Real-time features (`watchCollection`)
✅ Cloud functions (`db.functions.*`)
✅ Aggregations and counting

Only authentication methods have moved to the `db.auth.*` namespace!

# Authentication Guide

Complete guide to using Cocobase authentication features.

> 💡 **New in v1.3.1:** All authentication methods are now accessible via the `db.auth.*` namespace. See the [Migration Guide](Migration-Guide.md) for upgrade instructions.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication Callbacks](#authentication-callbacks)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [Session Management](#session-management)
- [User Profile Management](#user-profile-management)
- [Google OAuth](#google-oauth)
- [File Uploads](#file-uploads)
- [Role-Based Access Control](#role-based-access-control)
- [User Management (Admin)](#user-management-admin)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

Before using authentication, ensure you have:
- A Cocobase account at [cocobase.buzz](https://cocobase.buzz)
- Your **API Key** and **Project ID** from the dashboard
- The Cocobase SDK installed: `npm install cocobase`

### Initialize Cocobase

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',        // From cocobase.buzz
  projectId: 'your-project-id'   // From cocobase.buzz
});
```

## Authentication Callbacks

**New Feature:** Cocobase now supports authentication callbacks, making it easy to integrate with any JavaScript framework (React, Vue, Svelte, Angular, etc.).

### Quick Example

```typescript
// Register callbacks to handle auth state changes
db.auth.onAuthEvent({
  onLogin: (user, token) => {
    // Update your app's state when user logs in
    console.log('User logged in:', user.email);
  },
  onLogout: () => {
    // Update your app's state when user logs out
    console.log('User logged out');
  },
  onUserUpdate: (user) => {
    // Update your app's state when user data changes
    console.log('User updated:', user);
  }
});
```

### Framework Integration

The callback system works seamlessly with popular frameworks:

**React:**
```typescript
const [user, setUser] = useState(null);

useEffect(() => {
  db.auth.onAuthEvent({
    onLogin: (user) => setUser(user),
    onLogout: () => setUser(null)
  });
}, []);
```

**Vue:**
```typescript
const user = ref(null);

db.auth.onAuthEvent({
  onLogin: (newUser) => user.value = newUser,
  onLogout: () => user.value = null
});
```

**Svelte:**
```typescript
import { writable } from 'svelte/store';
const user = writable(null);

db.auth.onAuthEvent({
  onLogin: (newUser) => user.set(newUser),
  onLogout: () => user.set(null)
});
```

### Available Callbacks

- `onLogin` - Triggered when user logs in (email/password or OAuth)
- `onRegister` - Triggered when new user registers
- `onLogout` - Triggered when user logs out
- `onUserUpdate` - Triggered when user data is updated
- `onTokenChange` - Triggered when auth token changes
- `onAuthStateChange` - Triggered when auth state is initialized

📚 **See the complete [Authentication Callbacks Guide](./examples/AuthCallbacks.md)** for detailed examples with React, Vue, Svelte, Angular, and more.

## User Registration

### Basic Registration

Register a new user with email and password:

```typescript
await db.auth.register(
  'user@example.com',
  'securePassword123'
);

// User is automatically logged in after registration
console.log('Registered user:', db.auth.getUser());
```

### Registration with Additional Data

Add custom user data during registration:

```typescript
await db.auth.register(
  'user@example.com',
  'securePassword123',
  {
    username: 'johndoe',
    fullName: 'John Doe',
    age: 30,
    bio: 'Software developer'
  }
);
```

### Registration with File Uploads

Upload profile pictures or other files during registration:

```typescript
// Single file (avatar)
await db.auth.registerWithFiles(
  'user@example.com',
  'password123',
  { username: 'johndoe', fullName: 'John Doe' },
  { avatar: avatarFile }
);

// Multiple files
await db.auth.registerWithFiles(
  'user@example.com',
  'password123',
  { username: 'johndoe' },
  {
    avatar: avatarFile,
    cover_photo: coverPhotoFile,
    documents: [doc1, doc2, doc3] // Array of files
  }
);

console.log('Avatar URL:', db.auth.getUser().avatar);
```

## User Login

### Email/Password Login

```typescript
await db.auth.login('user@example.com', 'password123');

if (db.auth.isAuthenticated()) {
  console.log('Logged in as:', db.auth.getUser().email);
}
```

### Login with Error Handling

```typescript
try {
  await db.auth.login('user@example.com', 'password123');
  console.log('Login successful!');
} catch (error) {
  console.error('Login failed:', error.message);
  // Handle invalid credentials
}
```

## Session Management

### Restore Session on App Load

Always call `initAuth()` when your application loads to restore the user's session:

```typescript
// In your app initialization (e.g., App.tsx, main.ts)
await db.auth.initAuth();

if (db.auth.isAuthenticated()) {
  console.log('Welcome back,', db.auth.getUser().email);
} else {
  console.log('Please log in');
}
```

### Check Authentication Status

```typescript
if (db.auth.isAuthenticated()) {
  // User is logged in
  console.log('User:', db.auth.getUser());
} else {
  // User is not logged in
  // Redirect to login page
}
```

### Get Current User

```typescript
const user = db.auth.getUser();

if (user) {
  console.log('Email:', user.email);
  console.log('Data:', user.data);
  console.log('Roles:', user.roles);
}
```

### Get Authentication Token

```typescript
const token = db.auth.getToken();

// Use token for custom API calls or debugging
console.log('JWT Token:', token);
```

### Logout

```typescript
db.auth.logout();
console.log('User logged out');

// After logout:
console.log(db.auth.isAuthenticated()); // false
console.log(db.auth.getUser()); // undefined
```

## User Profile Management

### Get Current User Details

```typescript
const user = await db.auth.getCurrentUser();
console.log('User profile:', user);
```

### Update User Profile

```typescript
// Update custom data
await db.auth.updateUser({
  bio: 'Updated bio',
  location: 'San Francisco',
  website: 'https://example.com'
});

// Update email
await db.auth.updateUser(
  null,
  'newemail@example.com',
  null
);

// Update password
await db.auth.updateUser(
  null,
  null,
  'newPassword123'
);

// Update everything
await db.auth.updateUser(
  { bio: 'New bio' },
  'newemail@example.com',
  'newPassword123'
);
```

### Update User with File Uploads

```typescript
// Update only avatar
await db.auth.updateUserWithFiles(
  undefined,
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Update bio and avatar
await db.auth.updateUserWithFiles(
  { bio: 'Updated bio' },
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Update everything including files
await db.auth.updateUserWithFiles(
  { bio: 'New bio', location: 'NYC' },
  'newemail@example.com',
  'newPassword123',
  {
    avatar: newAvatar,
    cover_photo: newCover
  }
);
```

## Google OAuth

Cocobase supports Google Sign-In using Google's ID token verification. This provides a secure, token-based authentication flow.

### Prerequisites

1. **Enable Google Sign-In** in your Cocobase project settings at [cocobase.buzz](https://cocobase.buzz)
2. **Configure Google Client ID** in your project settings
3. **Get your Google Client ID** from [Google Cloud Console](https://console.cloud.google.com/)

### Web Implementation

#### Step 1: Add Google Sign-In Script

Add the Google Identity Services library to your HTML:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### Step 2: Initialize Google Sign-In

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',        // From cocobase.buzz
  projectId: 'your-project-id'   // From cocobase.buzz
});

// Initialize Google Sign-In
google.accounts.id.initialize({
  client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  callback: handleGoogleSignIn
});

// Render the Google Sign-In button
google.accounts.id.renderButton(
  document.getElementById('google-signin-button'),
  { theme: 'outline', size: 'large' }
);

// Handle Google Sign-In callback
async function handleGoogleSignIn(response) {
  try {
    const user = await db.auth.loginWithGoogle(response.credential, 'web');
    console.log('Logged in with Google:', user.email);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    alert('Login failed. Please try again.');
  }
}
```

#### Step 3: Add Button HTML

```html
<div id="google-signin-button"></div>
```

### React Implementation

```typescript
import { useEffect } from 'react';
import { db } from './lib/cocobase';

function LoginPage() {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
        callback: handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { theme: 'outline', size: 'large' }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleGoogleSignIn(response: any) {
    try {
      const user = await db.auth.loginWithGoogle(response.credential, 'web');
      console.log('Logged in:', user.email);
      // Update app state, redirect, etc.
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <div id="google-signin-button"></div>
    </div>
  );
}
```

### Vue Implementation

```vue
<template>
  <div>
    <h1>Login</h1>
    <div id="google-signin-button"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { db } from '@/lib/cocobase';

onMounted(() => {
  // Load Google Sign-In script
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' }
    );
  };
});

async function handleGoogleSignIn(response) {
  try {
    const user = await db.auth.loginWithGoogle(response.credential, 'web');
    console.log('Logged in:', user.email);
    // Navigate to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
}
</script>
```

### Mobile Implementation (React Native)

For mobile apps, use the `@react-native-google-signin/google-signin` package:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { db } from './lib/cocobase';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional
});

async function handleGoogleLogin() {
  try {
    // Sign in with Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Get the ID token
    const { idToken } = await GoogleSignin.getTokens();

    // Authenticate with Cocobase
    const user = await db.auth.loginWithGoogle(idToken, 'mobile');
    console.log('Logged in:', user.email);

    // Navigate to home screen
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
}
```

### Error Handling

The Google Sign-In method can throw several errors:

```typescript
async function handleGoogleSignIn(credential: string) {
  try {
    const user = await db.auth.loginWithGoogle(credential, 'web');
    console.log('Success:', user.email);
  } catch (error) {
    const errorMessage = error.message;

    if (errorMessage.includes('Google Sign-In integration is not enabled')) {
      console.error('Enable Google Sign-In in your Cocobase project settings');
    } else if (errorMessage.includes('GOOGLE_CLIENT_ID is not configured')) {
      console.error('Configure your Google Client ID in project settings');
    } else if (errorMessage.includes('Invalid Google ID token')) {
      console.error('The Google token is invalid or expired');
    } else if (errorMessage.includes('already registered with password')) {
      console.error('This email is already registered. Please use email/password login');
    } else if (errorMessage.includes('already registered with Apple')) {
      console.error('This email is already registered. Please use Apple Sign-In');
    } else {
      console.error('Login failed:', errorMessage);
    }
  }
}
```

### One-Tap Sign-In (Optional)

Enable Google One-Tap for a better user experience:

```typescript
// Display One-Tap prompt
google.accounts.id.prompt((notification) => {
  if (notification.isNotDisplayed()) {
    console.log('One-Tap was not displayed');
  } else if (notification.isSkippedMoment()) {
    console.log('One-Tap was skipped');
  }
});
```

### Custom Button (Without Google UI)

If you want a custom button instead of Google's default:

```html
<button onclick="handleCustomGoogleLogin()">
  Sign in with Google
</button>
```

```typescript
async function handleCustomGoogleLogin() {
  // Request ID token using Google's programmatic flow
  google.accounts.id.prompt();
}
```

## File Uploads

### Supported File Fields

You can upload files to any field during registration or profile updates:

```typescript
await db.auth.registerWithFiles(
  'user@example.com',
  'password',
  { username: 'johndoe' },
  {
    // Single files
    avatar: avatarFile,
    cover_photo: coverFile,
    resume: resumeFile,

    // Multiple files (creates an array)
    portfolio: [img1, img2, img3],
    certificates: [cert1, cert2]
  }
);
```

### File URLs

After uploading, files are automatically stored and URLs are returned:

```typescript
const user = db.auth.getUser();
console.log('Avatar URL:', user.avatar);
console.log('Cover Photo URL:', user.cover_photo);
console.log('Portfolio:', user.portfolio); // Array of URLs
```

### Update Files

```typescript
// Replace avatar
await db.auth.updateUserWithFiles(
  undefined,
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Add more portfolio images
await db.auth.updateUserWithFiles(
  undefined,
  undefined,
  undefined,
  { portfolio: [newImg1, newImg2] }
);
```

## Role-Based Access Control

### Check User Roles

```typescript
const user = db.auth.getUser();
console.log('User roles:', user.roles);

// Check for specific role
if (db.auth.hasRole('admin')) {
  console.log('User is an admin');
  // Show admin features
}

if (db.auth.hasRole('moderator')) {
  console.log('User is a moderator');
}
```

### Protect Routes Based on Roles

```typescript
function requireRole(role: string) {
  if (!db.auth.isAuthenticated()) {
    throw new Error('Not authenticated');
  }

  if (!db.auth.hasRole(role)) {
    throw new Error(`Required role: ${role}`);
  }
}

// Usage
try {
  requireRole('admin');
  // Show admin dashboard
} catch (error) {
  // Redirect to unauthorized page
}
```

## User Management (Admin)

### List All Users

```typescript
// Get all users
const users = await db.auth.listUsers();
console.log('Total users:', users.length);

// With filtering
const activeUsers = await db.auth.listUsers({
  filters: { status: 'active' },
  limit: 10,
  sort: 'created_at',
  order: 'desc'
});

// Search by email or name
const searchResults = await db.auth.listUsers({
  filters: { email_contains: 'example.com' }
});
```

### Get User by ID

```typescript
const user = await db.auth.getUserById('user-123');
console.log('User:', user.email);
console.log('Data:', user.data);
console.log('Roles:', user.roles);
```

### User Query Examples

```typescript
// Get premium users
const premiumUsers = await db.auth.listUsers({
  filters: { subscription: 'premium' }
});

// Get users registered in the last 7 days
const newUsers = await db.auth.listUsers({
  filters: { created_at_gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
});

// Get users with pagination
const page1 = await db.auth.listUsers({ limit: 20, offset: 0 });
const page2 = await db.auth.listUsers({ limit: 20, offset: 20 });
```

## Best Practices

### 1. Always Use Environment Variables

```typescript
// ❌ Don't hardcode credentials
const db = new Cocobase({
  apiKey: 'cb_1234567890',
  projectId: 'proj_abc123'
});

// ✅ Use environment variables
const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY!,
  projectId: process.env.COCOBASE_PROJECT_ID!
});
```

### 2. Initialize Auth on App Load

```typescript
// App.tsx or main.ts
async function initializeApp() {
  await db.auth.initAuth();

  if (db.auth.isAuthenticated()) {
    // Load user dashboard
  } else {
    // Show login page
  }
}

initializeApp();
```

### 3. Handle Errors Properly

```typescript
try {
  await db.auth.login(email, password);
  // Success
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid credentials');
  } else if (error.message.includes('429')) {
    console.error('Too many login attempts');
  } else {
    console.error('Login failed:', error.message);
  }
}
```

### 4. Protect Sensitive Routes

```typescript
// Middleware example
function requireAuth() {
  if (!db.auth.isAuthenticated()) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }
}

// Usage
function DashboardPage() {
  requireAuth();
  const user = db.auth.getUser();
  return <div>Welcome, {user.email}</div>;
}
```

### 5. Clean Up Sessions

```typescript
// On logout
function handleLogout() {
  db.auth.logout();
  // Clear any app state
  // Redirect to login
  window.location.href = '/login';
}
```

### 6. Validate User Input

```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// Before registration
if (!validateEmail(email)) {
  throw new Error('Invalid email address');
}

if (!validatePassword(password)) {
  throw new Error('Password must be at least 8 characters');
}

await db.auth.register(email, password);
```

## Framework Integration Examples

### React

```typescript
import { useState, useEffect } from 'react';
import { db } from './lib/cocobase';

function App() {
  const [user, setUser] = useState(db.auth.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await db.auth.initAuth();
      setUser(db.auth.getUser());
      setLoading(false);
    }
    init();
  }, []);

  async function handleLogin(email: string, password: string) {
    await db.auth.login(email, password);
    setUser(db.auth.getUser());
  }

  function handleLogout() {
    db.auth.logout();
    setUser(undefined);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/lib/cocobase';

const user = ref(db.auth.getUser());
const loading = ref(true);

onMounted(async () => {
  await db.auth.initAuth();
  user.value = db.auth.getUser();
  loading.value = false;
});

async function handleLogin(email, password) {
  await db.auth.login(email, password);
  user.value = db.auth.getUser();
}

function handleLogout() {
  db.auth.logout();
  user.value = null;
}
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="user">
      <p>Welcome, {{ user.email }}</p>
      <button @click="handleLogout">Logout</button>
    </div>
    <LoginForm v-else @login="handleLogin" />
  </div>
</template>
```

## Common Patterns

### Protected Route Component

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      await db.auth.initAuth();
      if (!db.auth.isAuthenticated()) {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}

// Usage
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

### Auth Context (React)

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(db.auth.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await db.auth.initAuth();
      setUser(db.auth.getUser());
      setLoading(false);
    }
    init();
  }, []);

  const login = async (email, password) => {
    await db.auth.login(email, password);
    setUser(db.auth.getUser());
  };

  const logout = () => {
    db.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Troubleshooting

### Session Not Persisting

If users are logged out after page refresh:

```typescript
// Make sure to call initAuth() on app load
await db.auth.initAuth();
```

### "Not authenticated" Errors

```typescript
// Check if user is authenticated before making requests
if (!db.auth.isAuthenticated()) {
  // Redirect to login
  window.location.href = '/login';
  return;
}

// Make authenticated request
const user = await db.auth.getCurrentUser();
```

### File Upload Issues

```typescript
// Make sure files are actual File objects
const file = event.target.files[0];
console.log(file instanceof File); // Should be true

await db.auth.updateUserWithFiles(
  undefined,
  undefined,
  undefined,
  { avatar: file }
);
```

## Need Help?

- 📖 [Migration Guide](Migration-Guide.md) - Upgrade from deprecated methods
- 📖 [File Upload Guide](FileUploads.md) - Detailed file upload documentation
- 💬 [Discord Community](https://discord.gg/cocobase)
- 🐛 [Report Issues](https://github.com/lordace-coder/coco_base_js/issues)
- 📧 [Email Support](mailto:hello@cocobase.buzz)

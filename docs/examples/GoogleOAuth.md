# Google OAuth Implementation Examples

Complete examples for implementing Google Sign-In with Cocobase across different platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vanilla JavaScript / HTML](#vanilla-javascript--html)
- [React](#react)
- [Next.js](#nextjs)
- [Vue 3](#vue-3)
- [Nuxt 3](#nuxt-3)
- [React Native](#react-native)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Prerequisites

### 1. Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen
6. Create a **Web application** client ID
7. Add authorized JavaScript origins (e.g., `http://localhost:3000`)
8. Copy your Client ID

### 2. Configure Cocobase Project

1. Go to [cocobase.buzz](https://cocobase.buzz)
2. Navigate to your project settings
3. Enable **Google Sign-In**
4. Paste your Google Client ID
5. Save settings

## Vanilla JavaScript / HTML

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cocobase Google Sign-In</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <h1>Login with Google</h1>

  <!-- Google Sign-In Button -->
  <div id="google-signin-button"></div>

  <!-- User Info (hidden by default) -->
  <div id="user-info" style="display: none;">
    <h2>Welcome, <span id="user-name"></span>!</h2>
    <p>Email: <span id="user-email"></span></p>
    <img id="user-avatar" src="" alt="Avatar" width="100" />
    <button onclick="handleLogout()">Logout</button>
  </div>

  <script type="module">
    import { Cocobase } from 'https://cdn.jsdelivr.net/npm/cocobase/+esm';

    const db = new Cocobase({
      apiKey: 'YOUR_API_KEY',
      projectId: 'YOUR_PROJECT_ID'
    });

    // Initialize on page load
    window.addEventListener('load', async () => {
      // Restore session
      await db.auth.initAuth();

      if (db.auth.isAuthenticated()) {
        displayUserInfo(db.auth.getUser());
      } else {
        initializeGoogleSignIn();
      }
    });

    function initializeGoogleSignIn() {
      google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: handleGoogleSignIn
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );

      // Optional: Show One-Tap prompt
      google.accounts.id.prompt();
    }

    async function handleGoogleSignIn(response) {
      try {
        const user = await db.auth.loginWithGoogle(response.credential, 'web');
        displayUserInfo(user);
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed: ' + error.message);
      }
    }

    function displayUserInfo(user) {
      document.getElementById('google-signin-button').style.display = 'none';
      document.getElementById('user-info').style.display = 'block';
      document.getElementById('user-name').textContent = user.data.name || user.email;
      document.getElementById('user-email').textContent = user.email;

      if (user.data.picture) {
        document.getElementById('user-avatar').src = user.data.picture;
      }
    }

    window.handleLogout = function() {
      db.auth.logout();
      window.location.reload();
    };
  </script>
</body>
</html>
```

## React

### Complete Login Component

```typescript
// src/components/GoogleLogin.tsx
import { useEffect, useState } from 'react';
import { db } from '../lib/cocobase';
import { AppUser } from 'cocobase';

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleLogin() {
  const [user, setUser] = useState<AppUser | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      // Restore session
      await db.auth.initAuth();
      setUser(db.auth.getUser());

      if (!db.auth.isAuthenticated()) {
        // Load Google Sign-In script
        loadGoogleScript();
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }

  function initializeGoogleSignIn() {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
      callback: handleGoogleSignIn,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      }
    );

    // Optional: Show One-Tap
    window.google.accounts.id.prompt();
  }

  async function handleGoogleSignIn(response: any) {
    setLoading(true);
    setError(null);

    try {
      const user = await db.auth.loginWithGoogle(response.credential, 'web');
      setUser(user);
    } catch (err: any) {
      setError(err.message);
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    db.auth.logout();
    setUser(undefined);
    // Reinitialize Google Sign-In
    setTimeout(() => loadGoogleScript(), 100);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div className="user-profile">
        <h2>Welcome, {user.data.name || user.email}!</h2>
        <p>Email: {user.email}</p>
        {user.data.picture && (
          <img src={user.data.picture} alt="Avatar" width="100" />
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <div id="google-signin-button"></div>
    </div>
  );
}
```

### Cocobase Instance Setup

```typescript
// src/lib/cocobase.ts
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.REACT_APP_COCOBASE_API_KEY!,
  projectId: process.env.REACT_APP_COCOBASE_PROJECT_ID!,
});
```

### Environment Variables

```env
# .env.local
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_COCOBASE_API_KEY=your-api-key
REACT_APP_COCOBASE_PROJECT_ID=your-project-id
```

## Next.js

### App Router (app/)

```typescript
// app/components/GoogleLogin.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';

export function GoogleLogin() {
  const [user, setUser] = useState(db.auth.getUser());

  useEffect(() => {
    // Initialize auth
    db.auth.initAuth().then(() => {
      setUser(db.auth.getUser());

      if (!db.auth.isAuthenticated()) {
        loadGoogleScript();
      }
    });
  }, []);

  function loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { theme: 'outline', size: 'large' }
      );
    };
    document.body.appendChild(script);
  }

  async function handleGoogleSignIn(response: any) {
    try {
      const user = await db.auth.loginWithGoogle(response.credential, 'web');
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  function handleLogout() {
    db.auth.logout();
    setUser(undefined);
    window.location.reload();
  }

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return <div id="google-signin-button"></div>;
}
```

```typescript
// app/page.tsx
import { GoogleLogin } from './components/GoogleLogin';

export default function Home() {
  return (
    <main>
      <h1>Login with Google</h1>
      <GoogleLogin />
    </main>
  );
}
```

## Vue 3

```vue
<!-- src/components/GoogleLogin.vue -->
<template>
  <div>
    <div v-if="user" class="user-profile">
      <h2>Welcome, {{ user.data.name || user.email }}!</h2>
      <p>Email: {{ user.email }}</p>
      <img v-if="user.data.picture" :src="user.data.picture" alt="Avatar" width="100" />
      <button @click="handleLogout">Logout</button>
    </div>

    <div v-else class="login-container">
      <h1>Login</h1>
      <div v-if="error" class="error">{{ error }}</div>
      <div id="google-signin-button"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/lib/cocobase';
import type { AppUser } from 'cocobase';

const user = ref<AppUser | undefined>();
const error = ref<string | null>(null);

onMounted(async () => {
  // Restore session
  await db.auth.initAuth();
  user.value = db.auth.getUser();

  if (!db.auth.isAuthenticated()) {
    loadGoogleScript();
  }
});

function loadGoogleScript() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      { theme: 'outline', size: 'large' }
    );

    // Optional: One-Tap
    window.google.accounts.id.prompt();
  };

  document.body.appendChild(script);
}

async function handleGoogleSignIn(response: any) {
  try {
    const userData = await db.auth.loginWithGoogle(response.credential, 'web');
    user.value = userData;
    error.value = null;
  } catch (err: any) {
    error.value = err.message;
    console.error('Login failed:', err);
  }
}

function handleLogout() {
  db.auth.logout();
  user.value = undefined;
  window.location.reload();
}
</script>

<style scoped>
.error {
  color: red;
  margin: 10px 0;
}
</style>
```

## Nuxt 3

```typescript
// composables/useAuth.ts
import { ref } from 'vue';
import { db } from '~/lib/cocobase';
import type { AppUser } from 'cocobase';

export const useAuth = () => {
  const user = ref<AppUser | undefined>();

  const initAuth = async () => {
    await db.auth.initAuth();
    user.value = db.auth.getUser();
  };

  const loginWithGoogle = async (credential: string) => {
    const userData = await db.auth.loginWithGoogle(credential, 'web');
    user.value = userData;
    return userData;
  };

  const logout = () => {
    db.auth.logout();
    user.value = undefined;
  };

  return {
    user,
    initAuth,
    loginWithGoogle,
    logout,
    isAuthenticated: () => db.auth.isAuthenticated(),
  };
};
```

```vue
<!-- pages/login.vue -->
<template>
  <div>
    <div v-if="user">
      <h2>Welcome, {{ user.email }}</h2>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else id="google-signin-button"></div>
  </div>
</template>

<script setup lang="ts">
const { user, initAuth, loginWithGoogle, logout } = useAuth();

onMounted(async () => {
  await initAuth();

  if (!user.value) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: useRuntimeConfig().public.googleClientId,
        callback: handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { theme: 'outline', size: 'large' }
      );
    };
    document.body.appendChild(script);
  }
});

async function handleGoogleSignIn(response: any) {
  try {
    await loginWithGoogle(response.credential);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

function handleLogout() {
  logout();
  navigateTo('/login');
}
</script>
```

## React Native

### Install Dependencies

```bash
npm install @react-native-google-signin/google-signin
```

### iOS Configuration

Add to `ios/Podfile`:

```ruby
pod 'GoogleSignIn'
```

Run:

```bash
cd ios && pod install
```

### Android Configuration

Add to `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

### Implementation

```typescript
// src/screens/LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { db } from '../lib/cocobase';
import type { AppUser } from 'cocobase';

export function LoginScreen() {
  const [user, setUser] = useState<AppUser | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      offlineAccess: true,
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    });

    // Restore session
    db.auth.initAuth().then(() => {
      setUser(db.auth.getUser());
    });
  }, []);

  async function handleGoogleLogin() {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Get ID token
      const { idToken } = await GoogleSignin.getTokens();

      // Authenticate with Cocobase
      const user = await db.auth.loginWithGoogle(idToken, 'mobile');
      setUser(user);
      setError(null);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services not available');
      } else {
        setError(error.message);
      }
    }
  }

  async function handleLogout() {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      db.auth.logout();
      setUser(undefined);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.email}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Google</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign in with Google" onPress={handleGoogleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
```

## Error Handling

```typescript
async function handleGoogleSignIn(credential: string) {
  try {
    const user = await db.auth.loginWithGoogle(credential, 'web');
    // Success
  } catch (error: any) {
    const message = error.message;

    // Check for specific errors
    if (message.includes('Google Sign-In integration is not enabled')) {
      alert('Please enable Google Sign-In in your Cocobase project settings');
    } else if (message.includes('GOOGLE_CLIENT_ID is not configured')) {
      alert('Please configure your Google Client ID in project settings');
    } else if (message.includes('Invalid Google ID token')) {
      alert('Google authentication failed. Please try again.');
    } else if (message.includes('already registered with password')) {
      alert('This email is already registered. Please use email/password login.');
    } else if (message.includes('already registered with Apple')) {
      alert('This email is already registered with Apple. Please use Apple Sign-In.');
    } else {
      alert('Login failed: ' + message);
    }
  }
}
```

## Testing

### Test Account Setup

1. Use a real Google account for testing
2. Ensure the account has access to your OAuth consent screen
3. Test on both development and production environments

### Common Issues

**Issue:** "Origin not whitelisted"
**Solution:** Add your origin (e.g., `http://localhost:3000`) to authorized JavaScript origins in Google Cloud Console

**Issue:** "Invalid ID token"
**Solution:** Check that your Google Client ID matches in both Google Cloud Console and Cocobase settings

**Issue:** "This email is already registered"
**Solution:** User must use the original authentication method (email/password or Apple)

## Best Practices

1. **Always handle errors** - Show user-friendly error messages
2. **Use One-Tap** - Improve UX with Google One-Tap on web
3. **Store minimal data** - Google provides name, email, and picture - store what you need
4. **Test across platforms** - Ensure consistent behavior on web, iOS, and Android
5. **Secure your Client ID** - Never commit it to version control (use environment variables)

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Cocobase Authentication Guide](../Authentication.md)
- [Migration Guide](../Migration-Guide.md)

# Authentication Callbacks

Authentication callbacks allow you to respond to authentication events in a framework-agnostic way. This makes it easy to integrate Cocobase with React, Vue, Svelte, Angular, or any other JavaScript framework.

## Overview

The Cocobase SDK provides callback hooks for all authentication events:

- `onLogin` - Called when a user logs in (email/password or Google)
- `onRegister` - Called when a new user registers
- `onLogout` - Called when a user logs out
- `onUserUpdate` - Called when user data is updated
- `onTokenChange` - Called when the authentication token changes
- `onAuthStateChange` - Called when authentication state is initialized/restored

## Basic Usage

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// Register callbacks
db.auth.onAuthEvent({
  onLogin: (user, token) => {
    console.log('User logged in:', user.email);
    console.log('Token:', token);
  },
  onLogout: () => {
    console.log('User logged out');
  },
  onUserUpdate: (user) => {
    console.log('User updated:', user);
  },
  onTokenChange: (token) => {
    console.log('Token changed:', token);
  },
  onAuthStateChange: (user, token) => {
    console.log('Auth state changed:', { user, token });
  }
});
```

## Framework Examples

### React

#### Using useState

```typescript
import React, { useState, useEffect } from 'react';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Register auth callbacks
    db.auth.onAuthEvent({
      onLogin: (user, token) => {
        setUser(user);
        setIsAuthenticated(true);
      },
      onRegister: (user, token) => {
        setUser(user);
        setIsAuthenticated(true);
      },
      onLogout: () => {
        setUser(null);
        setIsAuthenticated(false);
      },
      onUserUpdate: (user) => {
        setUser(user);
      },
      onAuthStateChange: (user, token) => {
        setUser(user);
        setIsAuthenticated(!!token);
      }
    });

    // Initialize auth (restore session)
    db.auth.initAuth();

    // Cleanup
    return () => {
      db.auth.clearAuthCallbacks();
    };
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await db.auth.login(email, password);
      // onLogin callback will be triggered automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    db.auth.logout();
    // onLogout callback will be triggered automatically
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user?.email}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
}
```

#### Using React Context

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.onAuthEvent({
      onLogin: (user) => {
        setUser(user);
        setLoading(false);
      },
      onRegister: (user) => {
        setUser(user);
        setLoading(false);
      },
      onLogout: () => {
        setUser(null);
      },
      onUserUpdate: (user) => {
        setUser(user);
      },
      onAuthStateChange: (user) => {
        setUser(user);
        setLoading(false);
      }
    });

    db.auth.initAuth();

    return () => db.auth.clearAuthCallbacks();
  }, []);

  const login = (email, password) => db.auth.login(email, password);
  const register = (email, password, data) => db.auth.register(email, password, data);
  const logout = () => db.auth.logout();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Vue 3

#### Using Composition API

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

export function useAuth() {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const loading = ref(true);

  const setupCallbacks = () => {
    db.auth.onAuthEvent({
      onLogin: (newUser, token) => {
        user.value = newUser;
        isAuthenticated.value = true;
        loading.value = false;
      },
      onRegister: (newUser, token) => {
        user.value = newUser;
        isAuthenticated.value = true;
        loading.value = false;
      },
      onLogout: () => {
        user.value = null;
        isAuthenticated.value = false;
      },
      onUserUpdate: (updatedUser) => {
        user.value = updatedUser;
      },
      onAuthStateChange: (newUser, token) => {
        user.value = newUser;
        isAuthenticated.value = !!token;
        loading.value = false;
      }
    });
  };

  const login = async (email, password) => {
    await db.auth.login(email, password);
  };

  const logout = () => {
    db.auth.logout();
  };

  onMounted(() => {
    setupCallbacks();
    db.auth.initAuth();
  });

  onUnmounted(() => {
    db.auth.clearAuthCallbacks();
  });

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
}
```

#### Using Vuex/Pinia

```typescript
// store/auth.js
import { defineStore } from 'pinia';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  }),

  actions: {
    setupCallbacks() {
      db.auth.onAuthEvent({
        onLogin: (user, token) => {
          this.user = user;
          this.token = token;
          this.isAuthenticated = true;
          this.loading = false;
        },
        onRegister: (user, token) => {
          this.user = user;
          this.token = token;
          this.isAuthenticated = true;
          this.loading = false;
        },
        onLogout: () => {
          this.user = null;
          this.token = null;
          this.isAuthenticated = false;
        },
        onUserUpdate: (user) => {
          this.user = user;
        },
        onTokenChange: (token) => {
          this.token = token;
        },
        onAuthStateChange: (user, token) => {
          this.user = user;
          this.token = token;
          this.isAuthenticated = !!token;
          this.loading = false;
        }
      });
    },

    async initialize() {
      this.setupCallbacks();
      await db.auth.initAuth();
    },

    async login(email, password) {
      await db.auth.login(email, password);
    },

    async register(email, password, data) {
      await db.auth.register(email, password, data);
    },

    logout() {
      db.auth.logout();
    }
  }
});
```

### Svelte

```typescript
// stores/auth.js
import { writable } from 'svelte/store';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

export const user = writable(null);
export const isAuthenticated = writable(false);
export const loading = writable(true);

// Setup callbacks
db.auth.onAuthEvent({
  onLogin: (newUser, token) => {
    user.set(newUser);
    isAuthenticated.set(true);
    loading.set(false);
  },
  onRegister: (newUser, token) => {
    user.set(newUser);
    isAuthenticated.set(true);
    loading.set(false);
  },
  onLogout: () => {
    user.set(null);
    isAuthenticated.set(false);
  },
  onUserUpdate: (updatedUser) => {
    user.set(updatedUser);
  },
  onAuthStateChange: (newUser, token) => {
    user.set(newUser);
    isAuthenticated.set(!!token);
    loading.set(false);
  }
});

export const authActions = {
  initialize: () => db.auth.initAuth(),
  login: (email, password) => db.auth.login(email, password),
  register: (email, password, data) => db.auth.register(email, password, data),
  logout: () => db.auth.logout()
};
```

```svelte
<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated, authActions } from './stores/auth';

  onMount(() => {
    authActions.initialize();
  });

  async function handleLogin(email, password) {
    try {
      await authActions.login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
</script>

{#if $isAuthenticated}
  <div>
    <h1>Welcome, {$user?.email}</h1>
    <button on:click={authActions.logout}>Logout</button>
  </div>
{:else}
  <LoginForm on:submit={handleLogin} />
{/if}
```

### Angular

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cocobase } from 'cocobase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private db = new Cocobase({
    apiKey: 'your-api-key',
    projectId: 'your-project-id'
  });

  private userSubject = new BehaviorSubject(null);
  private isAuthenticatedSubject = new BehaviorSubject(false);
  private loadingSubject = new BehaviorSubject(true);

  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.setupCallbacks();
    this.initialize();
  }

  private setupCallbacks() {
    this.db.auth.onAuthEvent({
      onLogin: (user, token) => {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.loadingSubject.next(false);
      },
      onRegister: (user, token) => {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.loadingSubject.next(false);
      },
      onLogout: () => {
        this.userSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      },
      onUserUpdate: (user) => {
        this.userSubject.next(user);
      },
      onAuthStateChange: (user, token) => {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(!!token);
        this.loadingSubject.next(false);
      }
    });
  }

  async initialize() {
    await this.db.auth.initAuth();
  }

  async login(email: string, password: string) {
    await this.db.auth.login(email, password);
  }

  async register(email: string, password: string, data?: any) {
    await this.db.auth.register(email, password, data);
  }

  logout() {
    this.db.auth.logout();
  }
}
```

## Advanced Usage

### Persisting to Custom Storage

```typescript
db.auth.onAuthEvent({
  onLogin: (user, token) => {
    // Save to custom storage (e.g., IndexedDB, AsyncStorage, etc.)
    customStorage.setItem('user', JSON.stringify(user));
    customStorage.setItem('token', token);
  },
  onLogout: () => {
    customStorage.removeItem('user');
    customStorage.removeItem('token');
  }
});
```

### Analytics and Tracking

```typescript
db.auth.onAuthEvent({
  onLogin: (user) => {
    // Track login event
    analytics.track('User Logged In', {
      userId: user.id,
      email: user.email
    });
  },
  onRegister: (user) => {
    // Track registration event
    analytics.track('User Registered', {
      userId: user.id,
      email: user.email
    });
  },
  onLogout: () => {
    analytics.track('User Logged Out');
  }
});
```

### Redirecting After Auth Events

```typescript
import { useRouter } from 'next/router'; // Next.js example

const router = useRouter();

db.auth.onAuthEvent({
  onLogin: (user) => {
    router.push('/dashboard');
  },
  onLogout: () => {
    router.push('/login');
  }
});
```

## Cleaning Up Callbacks

It's good practice to clean up callbacks when components unmount:

```typescript
// React
useEffect(() => {
  db.auth.onAuthEvent({ /* callbacks */ });

  return () => {
    db.auth.clearAuthCallbacks();
  };
}, []);

// Vue
onUnmounted(() => {
  db.auth.clearAuthCallbacks();
});

// Svelte
onDestroy(() => {
  db.auth.clearAuthCallbacks();
});
```

## Notes

- All callbacks are optional - only register the ones you need
- Callbacks are triggered automatically after successful auth operations
- The `onAuthStateChange` callback is useful for initializing your app's auth state
- Use `clearAuthCallbacks()` to remove all registered callbacks
- You can call `onAuthEvent()` multiple times - new callbacks will be merged with existing ones

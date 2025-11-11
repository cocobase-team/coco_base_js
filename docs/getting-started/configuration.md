---
sidebar_position: 3
---

# Configuration

Learn how to configure the Cocobase SDK for your needs.

## Basic Configuration

The minimal configuration requires an API key:

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key'
});
```

## Full Configuration

Here are all available configuration options:

```typescript
const db = new Cocobase({
  // Required: Your Cocobase API key
  apiKey: 'your-api-key',

  // Required for cloud functions: Your project ID
  projectId: 'your-project-id',

  // Optional: Custom base URL (defaults to https://api.cocobase.buzz)
  baseURL: 'https://api.cocobase.buzz'
});
```

## Configuration Options

### apiKey

- **Type:** `string`
- **Required:** Yes (for most operations)
- **Description:** Your Cocobase API key for authentication

```typescript
const db = new Cocobase({
  apiKey: 'cb_1234567890abcdef'
});
```

:::tip Where to find your API key
1. Log in to [Cocobase Dashboard](https://cocobase.buzz/dashboard)
2. Select your project
3. Go to Settings → API Keys
4. Copy your API key
:::

### projectId

- **Type:** `string`
- **Required:** Yes (for cloud functions)
- **Description:** Your Cocobase project identifier

```typescript
const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'proj_abc123'
});

// Now you can use cloud functions
await db.functions.execute('myFunction');
```

### baseURL

- **Type:** `string`
- **Required:** No
- **Default:** `https://api.cocobase.buzz`
- **Description:** Custom API endpoint (for self-hosted instances)

```typescript
const db = new Cocobase({
  apiKey: 'your-api-key',
  baseURL: 'https://your-custom-domain.com'
});
```

## Environment-Specific Configuration

### Development Environment

```typescript title="config/dev.ts"
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.DEV_COCOBASE_API_KEY!,
  projectId: process.env.DEV_COCOBASE_PROJECT_ID!
});
```

### Production Environment

```typescript title="config/prod.ts"
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.PROD_COCOBASE_API_KEY!,
  projectId: process.env.PROD_COCOBASE_PROJECT_ID!
});
```

### Dynamic Configuration

```typescript title="config/cocobase.ts"
import { Cocobase } from 'cocobase';

const isDevelopment = process.env.NODE_ENV === 'development';

export const db = new Cocobase({
  apiKey: isDevelopment
    ? process.env.DEV_API_KEY!
    : process.env.PROD_API_KEY!,
  projectId: isDevelopment
    ? process.env.DEV_PROJECT_ID!
    : process.env.PROD_PROJECT_ID!
});
```

## Framework Integrations

### React / Next.js

Create a singleton instance:

```typescript title="lib/cocobase.ts"
import { Cocobase } from 'cocobase';

if (!process.env.NEXT_PUBLIC_COCOBASE_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_COCOBASE_API_KEY');
}

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID
});
```

Use in components:

```tsx title="components/Posts.tsx"
import { db } from '@/lib/cocobase';
import { useEffect, useState } from 'react';

export function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    db.listDocuments('posts').then(setPosts);
  }, []);

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.data.title}</div>
      ))}
    </div>
  );
}
```

### Vue / Nuxt

```typescript title="plugins/cocobase.ts"
import { Cocobase } from 'cocobase';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const db = new Cocobase({
    apiKey: config.public.cocobaseApiKey,
    projectId: config.public.cocobaseProjectId
  });

  return {
    provide: {
      cocobase: db
    }
  };
});
```

Use in components:

```vue title="pages/index.vue"
<script setup>
const { $cocobase } = useNuxtApp();
const posts = ref([]);

onMounted(async () => {
  posts.value = await $cocobase.listDocuments('posts');
});
</script>

<template>
  <div>
    <div v-for="post in posts" :key="post.id">
      {{ post.data.title }}
    </div>
  </div>
</template>
```

### React Native

```typescript title="services/cocobase.ts"
import { Cocobase } from 'cocobase';
import { COCOBASE_API_KEY, COCOBASE_PROJECT_ID } from '@env';

export const db = new Cocobase({
  apiKey: COCOBASE_API_KEY,
  projectId: COCOBASE_PROJECT_ID
});
```

## Environment Variables

### .env file structure

```env title=".env"
# Cocobase Configuration
COCOBASE_API_KEY=your_api_key_here
COCOBASE_PROJECT_ID=your_project_id_here

# Optional: Custom base URL
COCOBASE_BASE_URL=https://api.cocobase.buzz
```

### Loading environment variables

#### Node.js

```bash
npm install dotenv
```

```typescript
import 'dotenv/config';
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY!,
  projectId: process.env.COCOBASE_PROJECT_ID!
});
```

#### Next.js

Next.js automatically loads `.env.local`:

```env title=".env.local"
NEXT_PUBLIC_COCOBASE_API_KEY=your_key
NEXT_PUBLIC_COCOBASE_PROJECT_ID=your_project_id
```

#### Vite / Vue

```env title=".env"
VITE_COCOBASE_API_KEY=your_key
VITE_COCOBASE_PROJECT_ID=your_project_id
```

## Security Best Practices

### ✅ DO

- Store API keys in environment variables
- Use different keys for development and production
- Add `.env` to `.gitignore`
- Rotate keys regularly
- Use project-specific keys

```bash title=".gitignore"
.env
.env.local
.env.*.local
```

### ❌ DON'T

- Hardcode API keys in source code
- Commit API keys to version control
- Share API keys publicly
- Use production keys in development
- Expose API keys in client-side code (use server-side proxies)

## Multiple Instances

You can create multiple Cocobase instances:

```typescript
import { Cocobase } from 'cocobase';

// Main database
const mainDb = new Cocobase({
  apiKey: process.env.MAIN_API_KEY!,
  projectId: process.env.MAIN_PROJECT_ID!
});

// Analytics database
const analyticsDb = new Cocobase({
  apiKey: process.env.ANALYTICS_API_KEY!,
  projectId: process.env.ANALYTICS_PROJECT_ID!
});

// Use different instances
await mainDb.createDocument('users', { name: 'John' });
await analyticsDb.createDocument('events', { type: 'signup' });
```

## TypeScript Configuration

### Strict Type Checking

```typescript
import { Cocobase, type CocobaseConfig } from 'cocobase';

const config: CocobaseConfig = {
  apiKey: process.env.COCOBASE_API_KEY!,
  projectId: process.env.COCOBASE_PROJECT_ID!
};

const db = new Cocobase(config);
```

### Custom Type Definitions

```typescript
import { Cocobase, type Document } from 'cocobase';

interface User {
  name: string;
  email: string;
  age: number;
}

const db = new Cocobase({ apiKey: 'key' });

// Typed documents
const user: Document<User> = await db.getDocument<User>('users', 'user-id');
```

## Troubleshooting

### API Key Issues

```typescript
// Check if API key is set
if (!process.env.COCOBASE_API_KEY) {
  throw new Error('COCOBASE_API_KEY is not set');
}

// Validate API key format
const apiKey = process.env.COCOBASE_API_KEY;
if (!apiKey.startsWith('cb_')) {
  console.warn('API key format looks incorrect');
}
```

### Connection Issues

```typescript
try {
  const db = new Cocobase({
    apiKey: process.env.COCOBASE_API_KEY!
  });

  // Test connection
  await db.listDocuments('test', { limit: 1 });
  console.log('✓ Connected to Cocobase');
} catch (error) {
  console.error('✗ Connection failed:', error.message);
}
```

## Next Steps

- [Learn Core Concepts](../core-concepts/collections)
- [CRUD Operations Guide](../guides/crud-operations)
- [Authentication Setup](../guides/authentication)

---
sidebar_position: 1
---

# Installation

Learn how to install the Cocobase JavaScript/TypeScript SDK in your project.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 14.0 or higher
- **npm** or **yarn** package manager
- A **Cocobase account** (sign up at [cocobase.buzz](https://cocobase.buzz))

## Create a Cocobase Project

Before installing the SDK, you need to get your credentials:

1. **Visit** [cocobase.buzz](https://cocobase.buzz) and sign up for a free account
2. **Create a new project** in the dashboard
3. **Copy your credentials** from the project dashboard:
   - **API Key** - Used to authenticate all your API requests
   - **Project ID** - Uniquely identifies your project

> 💡 **Important:** After creating your project on [cocobase.buzz](https://cocobase.buzz), you'll see your **API Key** and **Project ID** prominently displayed in your project's dashboard. You'll need both of these to initialize the SDK. Keep them secure and never commit them to version control!

## Install the SDK

Choose your preferred package manager:

### Using npm

```bash
npm install cocobase
```

### Using yarn

```bash
yarn add cocobase
```

### Using pnpm

```bash
pnpm add cocobase
```

## Verify Installation

Create a test file to verify the installation:

```typescript title="test.ts"
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key-here',        // From cocobase.buzz dashboard
  projectId: 'your-project-id-here'   // From cocobase.buzz dashboard
});

console.log('Cocobase initialized successfully!');
```

> 💡 Replace `'your-api-key-here'` and `'your-project-id-here'` with the actual credentials from your [cocobase.buzz](https://cocobase.buzz) project dashboard.

Run the file:

```bash
npx tsx test.ts
# or
node test.js
```

## TypeScript Configuration

If you're using TypeScript, ensure your `tsconfig.json` includes:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Framework-Specific Setup

### React / Next.js

```bash
npm install cocobase
```

```typescript title="lib/cocobase.ts"
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
  projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID!
});
```

```env title=".env.local"
# Get these from cocobase.buzz after creating your project
NEXT_PUBLIC_COCOBASE_API_KEY=your_api_key
NEXT_PUBLIC_COCOBASE_PROJECT_ID=your_project_id
```

### Vue / Nuxt

```bash
npm install cocobase
```

```typescript title="plugins/cocobase.ts"
import { Cocobase } from 'cocobase';

export const db = new Cocobase({
  apiKey: import.meta.env.VITE_COCOBASE_API_KEY,
  projectId: import.meta.env.VITE_COCOBASE_PROJECT_ID
});
```

### React Native

```bash
npm install cocobase
```

The SDK works seamlessly in React Native without any additional configuration!

## Environment Variables

It's recommended to store your credentials in environment variables:

### Node.js

```env title=".env"
# Get these from your project dashboard at cocobase.buzz
COCOBASE_API_KEY=your_api_key
COCOBASE_PROJECT_ID=your_project_id
```

Load with:

```bash
npm install dotenv
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY,
  projectId: process.env.COCOBASE_PROJECT_ID
});
```

## Next Steps

Now that you have Cocobase installed:

1. **[Quickstart Guide](quickstart)** - Build your first app
2. **[Configuration](configuration)** - Learn about configuration options
3. **[Core Concepts](../core-concepts/collections)** - Understand the basics

## Troubleshooting

### Module not found error

If you see `Cannot find module 'cocobase'`:

1. Check that the package is in `node_modules`
2. Clear your `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript errors

If you see TypeScript errors:

1. Ensure TypeScript version is 4.5 or higher
2. Check your `tsconfig.json` configuration
3. Try `npm install @types/node`

### Network errors

If you see connection errors:

1. Verify your API key is correct
2. Check your internet connection
3. Ensure you're not behind a restrictive firewall

## Need Help?

- Check the [FAQ](../advanced/troubleshooting)
- Join our [Discord](https://discord.gg/cocobase)
- Open an [issue on GitHub](https://github.com/lordace-coder/coco_base_js/issues)

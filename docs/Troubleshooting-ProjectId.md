# CloudFunction ProjectId Issue - Troubleshooting Guide

## 🐛 Problem

URL showing as `https://cloud.cocobase.buzz/functions//func/update_password` (double slash) instead of `https://cloud.cocobase.buzz/functions/{projectId}/func/update_password`

## ✅ Solution Applied

The SDK has been updated with two key fixes:

### 1. Dynamic Token Access

CloudFunction now gets the token dynamically instead of storing a stale copy:

```typescript
// OLD: Token captured at construction time
this.functions = new CloudFunction(this.projectId, this.token);

// NEW: Token accessed dynamically via getter
this.functions = new CloudFunction(this.projectId, () => this.token);
```

### 2. ProjectId Validation

Added validation to catch missing or empty projectId early:

```typescript
constructor(config: CocobaseConfig) {
  // ...
  if (!this.projectId || this.projectId.trim() === '') {
    throw new Error('Cocobase requires a valid projectId.');
  }
}
```

## 🔍 How to Fix in Your React Project

### Check Your Cocobase Initialization

Make sure you're passing `projectId` when initializing:

```typescript
// ❌ WRONG - Missing projectId
const db = new Cocobase({
  apiKey: "your-api-key",
});

// ✅ CORRECT - With projectId
const db = new Cocobase({
  apiKey: "your-api-key",
  projectId: "77956f8d-12a4-4933-bd97-e414df9c693b",
});
```

### Common React Patterns

#### 1. Using Environment Variables

```typescript
// .env.local
REACT_APP_COCOBASE_API_KEY = your - api - key;
REACT_APP_COCOBASE_PROJECT_ID = your - project - id;
```

```typescript
// App.tsx or db config file
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: process.env.REACT_APP_COCOBASE_API_KEY!,
  projectId: process.env.REACT_APP_COCOBASE_PROJECT_ID!,
});

export default db;
```

#### 2. Using a Config File

```typescript
// src/config/cocobase.ts
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: "your-api-key",
  projectId: "your-project-id",
});
```

```typescript
// In your components
import { db } from "./config/cocobase";

function MyComponent() {
  const handleUpdatePassword = async () => {
    const result = await db.functions.execute("update_password", {
      payload: { newPassword: "xxx" },
      method: "POST",
    });
  };
}
```

#### 3. Using Context/Provider Pattern

```typescript
// src/context/CocobaseContext.tsx
import React, { createContext, useContext } from "react";
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: process.env.REACT_APP_COCOBASE_API_KEY!,
  projectId: process.env.REACT_APP_COCOBASE_PROJECT_ID!,
});

const CocobaseContext = createContext(db);

export const CocobaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <CocobaseContext.Provider value={db}>{children}</CocobaseContext.Provider>
  );
};

export const useCocobase = () => useContext(CocobaseContext);
```

```typescript
// In your components
import { useCocobase } from "./context/CocobaseContext";

function MyComponent() {
  const db = useCocobase();

  const handleUpdatePassword = async () => {
    const result = await db.functions.execute("update_password", {
      payload: { newPassword: "xxx" },
      method: "POST",
    });
  };
}
```

## 🧪 Testing Your Fix

### 1. Check Initialization

```typescript
const db = new Cocobase({
  apiKey: "your-api-key",
  projectId: "your-project-id",
});

console.log("ProjectId:", db.projectId); // Should not be undefined or empty
```

### 2. Test Cloud Function Call

```typescript
try {
  const result = await db.functions.execute("update_password", {
    payload: { newPassword: "test123" },
    method: "POST",
  });
  console.log("Success:", result);
} catch (error) {
  console.error("Error:", error);
  // If you see "Invalid projectId" error, check your initialization
}
```

### 3. Check Network Tab

Open your browser DevTools > Network tab and look for the request URL:

- ❌ Bad: `https://cloud.cocobase.buzz/functions//func/...` (double slash)
- ✅ Good: `https://cloud.cocobase.buzz/functions/{projectId}/func/...`

## 🎯 Updated SDK Benefits

After updating to the latest version:

1. **Early Error Detection**: Get clear error messages if projectId is missing
2. **Dynamic Token**: Token updates automatically when user logs in
3. **Better Validation**: Prevents runtime errors from missing configuration

## 📦 Update Your Package

Make sure you're using the latest version:

```bash
npm update cocobase
# or
yarn upgrade cocobase
# or
pnpm update cocobase
```

## 💡 Debug Tips

If you're still seeing the issue:

1. **Check your build**: Ensure you're using the rebuilt SDK

   ```bash
   npm run build
   ```

2. **Clear cache**: Sometimes bundlers cache old versions

   ```bash
   # For Create React App
   rm -rf node_modules/.cache

   # For Next.js
   rm -rf .next

   # For Vite
   rm -rf node_modules/.vite
   ```

3. **Verify projectId**: Add a console.log right after initialization

   ```typescript
   const db = new Cocobase({ apiKey: "...", projectId: "..." });
   console.log("DB ProjectId:", db.projectId);
   ```

4. **Check for multiple instances**: Make sure you're not creating multiple Cocobase instances with different configs

## 🚨 Common Mistakes

### 1. Missing projectId in Config

```typescript
// ❌ WRONG
const db = new Cocobase({
  apiKey: "xxx",
  // Missing projectId!
});
```

### 2. Empty String projectId

```typescript
// ❌ WRONG
const db = new Cocobase({
  apiKey: "xxx",
  projectId: "", // Empty string!
});
```

### 3. Undefined Environment Variable

```typescript
// ❌ WRONG - Environment variable not set
const db = new Cocobase({
  apiKey: process.env.REACT_APP_API_KEY!,
  projectId: process.env.REACT_APP_PROJECT_ID!, // undefined if not set in .env
});
```

### 4. Using Old Instance

```typescript
// ❌ WRONG - Creating instance before projectId is available
let db: Cocobase;

// Later...
function initDb(projectId: string) {
  db = new Cocobase({ apiKey: "xxx", projectId });
}

// ✅ CORRECT - Create instance when projectId is available
const getDb = (projectId: string) => {
  return new Cocobase({ apiKey: "xxx", projectId });
};
```

## ✅ Checklist

Before calling cloud functions, verify:

- [ ] Cocobase initialized with valid `projectId`
- [ ] `projectId` is not empty, undefined, or null
- [ ] Using latest SDK version
- [ ] Build cache cleared if needed
- [ ] Network request shows correct URL (no double slashes)

---

**Need Help?**
If you're still experiencing issues, check:

1. Console for error messages
2. Network tab for actual request URL
3. Confirm projectId in your Cocobase dashboard

**Version**: 1.1.1+  
**Date**: November 4, 2025

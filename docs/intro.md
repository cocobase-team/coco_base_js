---
sidebar_position: 1
slug: /
---

# Welcome to Cocobase

Welcome to the Cocobase JavaScript/TypeScript SDK documentation! Cocobase is a modern Backend-as-a-Service (BaaS) platform that eliminates the complexity of backend development.

## What is Cocobase?

Cocobase is a powerful backend platform that provides:

- 📦 **NoSQL Database** - Store and query JSON documents with ease
- 🔐 **Authentication** - Built-in user management and OAuth
- 📤 **File Storage** - Upload and manage files effortlessly
- ⚡ **Real-time Updates** - WebSocket-based live data synchronization
- ☁️ **Cloud Functions** - Run server-side code without managing infrastructure
- 🔍 **Advanced Querying** - Powerful filtering, sorting, and aggregation

## Why Choose Cocobase?

### Lightning Fast Setup

Go from idea to MVP in minutes, not weeks:

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// You're ready to build!
await db.createDocument('users', { name: 'John Doe' });
```

### TypeScript-First

Full TypeScript support with excellent type inference:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

const user = await db.createDocument<User>('users', {
  name: 'Jane',
  email: 'jane@example.com',
  age: 28
});

// user.data is fully typed!
console.log(user.data.name); // TypeScript knows this is a string
```

### Beginner-Friendly

- Clear, intuitive API
- Excellent error messages
- Comprehensive documentation
- Rich code examples

## Quick Example

Here's a complete example of creating a simple blog post system:

```typescript
import { Cocobase } from 'cocobase';

// Initialize
const db = new Cocobase({ apiKey: 'your-key' });

// Create a post
const post = await db.createDocument('posts', {
  title: 'My First Post',
  content: 'Hello, Cocobase!',
  published: true,
  tags: ['tutorial', 'getting-started']
});

// Query posts
const publishedPosts = await db.listDocuments('posts', {
  filters: { published: true },
  sort: 'created_at',
  order: 'desc',
  limit: 10
});

// Update a post
await db.updateDocument('posts', post.id, {
  content: 'Updated content!'
});

// Delete a post
await db.deleteDocument('posts', post.id);
```

## Next Steps

Ready to get started? Here's what to do next:

1. **[Installation](getting-started/installation)** - Install the SDK in your project
2. **[Quickstart](getting-started/quickstart)** - Build your first app in 5 minutes
3. **[Core Concepts](core-concepts/collections)** - Understand the fundamentals
4. **[Guides](guides/crud-operations)** - Learn specific features in depth

## Need Help?

- 📖 Browse the [API Reference](api/overview)
- 💬 Join our [Discord Community](https://discord.gg/cocobase)
- 🐛 Report issues on [GitHub](https://github.com/lordace-coder/coco_base_js/issues)
- 📧 Email us at hello@cocobase.buzz

---

Let's build something amazing together! 🚀

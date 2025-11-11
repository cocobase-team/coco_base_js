---
sidebar_position: 1
---

# CRUD Operations

Master the four fundamental database operations: **Create**, **Read**, **Update**, and **Delete**.

## Overview

CRUD operations are the building blocks of any application. With Cocobase, they're simple and intuitive.

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key'
});
```

## Create Documents

### Basic Creation

Create a single document:

```typescript
const user = await db.createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true
});

console.log('Created user:', user.id);
```

### With TypeScript Types

Define your data structure:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  active: boolean;
  createdBy?: string;
}

const user = await db.createDocument<User>('users', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 28,
  active: true
});

// TypeScript knows the structure
console.log(user.data.name); // ✓ Type-safe
```

### Batch Creation

Create multiple documents at once:

```typescript
const users = await db.createDocuments('users', [
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob', email: 'bob@example.com', age: 32 },
  { name: 'Charlie', email: 'charlie@example.com', age: 28 }
]);

console.log(`Created ${users.length} users`);
```

## Read Documents

### Get Single Document

Retrieve a document by ID:

```typescript
const user = await db.getDocument('users', 'user-123');
console.log(user.data);
```

### List All Documents

Get all documents from a collection:

```typescript
const allUsers = await db.listDocuments('users');
console.log(`Total users: ${allUsers.length}`);
```

### With Filters

Filter documents by criteria:

```typescript
// Get active users
const activeUsers = await db.listDocuments('users', {
  filters: { active: true }
});

// Get users older than 25
const olderUsers = await db.listDocuments('users', {
  filters: { age_gte: 25 }
});

// Multiple filters (AND logic)
const specificUsers = await db.listDocuments('users', {
  filters: {
    active: true,
    age_gte: 25,
    age_lte: 40
  }
});
```

### With Sorting

Sort results:

```typescript
// Sort by age, ascending
const users = await db.listDocuments('users', {
  sort: 'age',
  order: 'asc'
});

// Sort by creation date, descending (newest first)
const recentUsers = await db.listDocuments('users', {
  sort: 'created_at',
  order: 'desc'
});
```

### With Pagination

Handle large datasets:

```typescript
// Get first page (10 users)
const page1 = await db.listDocuments('users', {
  limit: 10,
  offset: 0
});

// Get second page
const page2 = await db.listDocuments('users', {
  limit: 10,
  offset: 10
});

// Get page number dynamically
function getPage(pageNumber: number, pageSize: number = 10) {
  return db.listDocuments('users', {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });
}

const page3 = await getPage(3); // Users 21-30
```

### Combined Query

Combine filters, sorting, and pagination:

```typescript
const result = await db.listDocuments('users', {
  filters: {
    active: true,
    age_gte: 18
  },
  sort: 'created_at',
  order: 'desc',
  limit: 20,
  offset: 0
});
```

## Update Documents

### Basic Update

Update specific fields:

```typescript
await db.updateDocument('users', 'user-123', {
  age: 31,
  active: false
});
```

:::tip Partial Updates
You only need to provide the fields you want to update. Other fields remain unchanged.
:::

### With Type Safety

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

// TypeScript ensures only valid fields
await db.updateDocument<User>('users', 'user-123', {
  age: 31  // ✓ Valid
  // invalidField: 'test'  // ✗ TypeScript error
});
```

### Batch Update

Update multiple documents:

```typescript
await db.updateDocuments('users', {
  'user-1': { age: 31 },
  'user-2': { age: 29 },
  'user-3': { active: false }
});
```

### Conditional Update

Update only if conditions are met:

```typescript
// Get user first
const user = await db.getDocument('users', 'user-123');

// Update only if condition is met
if (user.data.age < 30) {
  await db.updateDocument('users', 'user-123', {
    category: 'young-adult'
  });
}
```

## Delete Documents

### Delete Single Document

```typescript
await db.deleteDocument('users', 'user-123');
console.log('User deleted');
```

### Delete with Confirmation

```typescript
const userId = 'user-123';

// Get user details first
const user = await db.getDocument('users', userId);
console.log(`Deleting user: ${user.data.name}`);

// Confirm and delete
const confirmed = confirm(`Delete ${user.data.name}?`);
if (confirmed) {
  await db.deleteDocument('users', userId);
}
```

### Batch Delete

Delete multiple documents:

```typescript
const idsToDelete = ['user-1', 'user-2', 'user-3'];

const result = await db.deleteDocuments('users', idsToDelete);
console.log(`Deleted ${result.count} documents`);
```

### Conditional Delete

Delete documents matching criteria:

```typescript
// Get inactive users
const inactiveUsers = await db.listDocuments('users', {
  filters: { active: false }
});

// Extract IDs
const idsToDelete = inactiveUsers.map(user => user.id);

// Delete them
if (idsToDelete.length > 0) {
  await db.deleteDocuments('users', idsToDelete);
  console.log(`Deleted ${idsToDelete.length} inactive users`);
}
```

## Complete Example

Here's a complete CRUD example for a blog application:

```typescript
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-key' });

interface BlogPost {
  title: string;
  content: string;
  author: string;
  published: boolean;
  tags: string[];
}

async function blogExample() {
  // CREATE: New blog post
  const post = await db.createDocument<BlogPost>('posts', {
    title: 'Getting Started with Cocobase',
    content: 'Cocobase is amazing...',
    author: 'John Doe',
    published: false,
    tags: ['tutorial', 'beginner']
  });
  console.log('✓ Post created:', post.id);

  // READ: Get the post
  const fetchedPost = await db.getDocument<BlogPost>('posts', post.id);
  console.log('✓ Post fetched:', fetchedPost.data.title);

  // READ: List all published posts
  const publishedPosts = await db.listDocuments<BlogPost>('posts', {
    filters: { published: true },
    sort: 'created_at',
    order: 'desc',
    limit: 10
  });
  console.log(`✓ Found ${publishedPosts.length} published posts`);

  // UPDATE: Publish the post
  await db.updateDocument<BlogPost>('posts', post.id, {
    published: true
  });
  console.log('✓ Post published');

  // UPDATE: Add more tags
  const currentPost = await db.getDocument<BlogPost>('posts', post.id);
  await db.updateDocument<BlogPost>('posts', post.id, {
    tags: [...currentPost.data.tags, 'featured']
  });
  console.log('✓ Tags updated');

  // DELETE: Remove the post
  await db.deleteDocument('posts', post.id);
  console.log('✓ Post deleted');
}

blogExample().catch(console.error);
```

## Best Practices

### 1. Use TypeScript Types

```typescript
// ✓ Good: Type-safe
interface User {
  name: string;
  email: string;
}

const user = await db.createDocument<User>('users', {
  name: 'John',
  email: 'john@example.com'
});

// ✗ Bad: No type safety
const user = await db.createDocument('users', {
  name: 'John',
  email: 'john@example.com'
});
```

### 2. Handle Errors

```typescript
// ✓ Good: Error handling
try {
  const user = await db.getDocument('users', userId);
  console.log(user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
  // Handle error appropriately
}

// ✗ Bad: No error handling
const user = await db.getDocument('users', userId);
```

### 3. Use Batch Operations

```typescript
// ✓ Good: Single batch operation
await db.createDocuments('users', [user1, user2, user3]);

// ✗ Bad: Multiple individual operations
await db.createDocument('users', user1);
await db.createDocument('users', user2);
await db.createDocument('users', user3);
```

### 4. Validate Before Delete

```typescript
// ✓ Good: Confirm before deletion
const user = await db.getDocument('users', userId);
if (confirm(`Delete ${user.data.name}?`)) {
  await db.deleteDocument('users', userId);
}

// ✗ Bad: Delete without confirmation
await db.deleteDocument('users', userId);
```

## Common Patterns

### Soft Delete

Instead of deleting, mark as deleted:

```typescript
// Instead of: await db.deleteDocument('users', userId);

// Use soft delete:
await db.updateDocument('users', userId, {
  deleted: true,
  deletedAt: new Date().toISOString()
});

// Query non-deleted items:
const activeUsers = await db.listDocuments('users', {
  filters: { deleted: false }
});
```

### Timestamps

Add custom timestamps:

```typescript
const now = new Date().toISOString();

const post = await db.createDocument('posts', {
  title: 'My Post',
  content: '...',
  createdAt: now,
  updatedAt: now
});

// On update:
await db.updateDocument('posts', post.id, {
  content: 'Updated content',
  updatedAt: new Date().toISOString()
});
```

### Counting Documents

```typescript
const count = await db.countDocuments('users', {
  filters: { active: true }
});
console.log(`Active users: ${count.count}`);
```

## Next Steps

- [Advanced Queries](./querying-filtering) - Master complex filtering
- [Relationships](./relationships) - Work with related data
- [File Uploads](./file-uploads) - Handle files in documents
- [Batch Operations](./batch-operations) - Optimize performance

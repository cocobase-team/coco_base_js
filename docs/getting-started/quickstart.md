---
sidebar_position: 2
---

# Quickstart Guide

Build your first Cocobase app in 5 minutes! This guide will walk you through creating a simple task manager application.

## Step 1: Initialize Cocobase

First, create a new file and initialize the Cocobase client:

```typescript title="app.ts"
import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: 'your-api-key',        // Get from cocobase.buzz
  projectId: 'your-project-id'   // Get from cocobase.buzz
});
```

:::tip Where to get your credentials
1. Go to [cocobase.buzz](https://cocobase.buzz) and sign up
2. Create a new project
3. Your **API Key** and **Project ID** will be displayed in your project dashboard
4. Copy and paste them into your code (or better yet, use environment variables!)
:::

## Step 2: Create Your First Document

Let's create a task:

```typescript
// Create a task
const task = await db.createDocument('tasks', {
  title: 'Learn Cocobase',
  completed: false,
  priority: 'high',
  dueDate: '2025-12-31'
});

console.log('Task created!', task);
```

**Output:**
```json
{
  "id": "task-abc123",
  "collection_id": "coll-xyz789",
  "created_at": "2025-11-11T10:00:00Z",
  "data": {
    "title": "Learn Cocobase",
    "completed": false,
    "priority": "high",
    "dueDate": "2025-12-31"
  },
  "collection": {
    "id": "coll-xyz789",
    "name": "tasks",
    "created_at": "2025-11-11T09:00:00Z"
  }
}
```

:::info
Notice how Cocobase automatically:
- Generates a unique ID
- Adds timestamps
- Creates the collection if it doesn't exist
:::

## Step 3: Query Documents

Retrieve all tasks:

```typescript
// Get all tasks
const allTasks = await db.listDocuments('tasks');
console.log('All tasks:', allTasks);

// Get high priority tasks
const highPriorityTasks = await db.listDocuments('tasks', {
  filters: { priority: 'high' },
  sort: 'created_at',
  order: 'desc'
});

// Get incomplete tasks
const incompleteTasks = await db.listDocuments('tasks', {
  filters: { completed: false }
});
```

## Step 4: Update a Document

Mark a task as completed:

```typescript
// Update the task
await db.updateDocument('tasks', task.id, {
  completed: true
});

console.log('Task marked as complete!');
```

:::tip
You only need to provide the fields you want to update. Other fields remain unchanged.
:::

## Step 5: Delete a Document

Remove a task:

```typescript
// Delete the task
await db.deleteDocument('tasks', task.id);
console.log('Task deleted!');
```

## Complete Example

Here's the complete task manager:

```typescript title="task-manager.ts"
import { Cocobase } from 'cocobase';

// Initialize with credentials from cocobase.buzz
const db = new Cocobase({
  apiKey: 'your-api-key',        // From cocobase.buzz dashboard
  projectId: 'your-project-id'   // From cocobase.buzz dashboard
});

interface Task {
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

async function main() {
  // Create tasks
  const task1 = await db.createDocument<Task>('tasks', {
    title: 'Learn Cocobase',
    completed: false,
    priority: 'high',
    dueDate: '2025-12-31'
  });

  const task2 = await db.createDocument<Task>('tasks', {
    title: 'Build an app',
    completed: false,
    priority: 'medium'
  });

  console.log('Tasks created!');

  // List all tasks
  const allTasks = await db.listDocuments<Task>('tasks');
  console.log(`Total tasks: ${allTasks.length}`);

  // Filter high priority tasks
  const highPriority = await db.listDocuments<Task>('tasks', {
    filters: { priority: 'high' }
  });
  console.log('High priority tasks:', highPriority);

  // Update a task
  await db.updateDocument<Task>('tasks', task1.id, {
    completed: true
  });
  console.log('Task marked complete!');

  // Get specific task
  const updatedTask = await db.getDocument<Task>('tasks', task1.id);
  console.log('Updated task:', updatedTask.data);

  // Delete a task
  await db.deleteDocument('tasks', task2.id);
  console.log('Task deleted!');
}

main().catch(console.error);
```

## Run Your App

```bash
npx tsx task-manager.ts
```

## What You've Learned

Congratulations! You've learned how to:

- ✅ Initialize Cocobase
- ✅ Create documents
- ✅ Query with filters
- ✅ Update documents
- ✅ Delete documents
- ✅ Use TypeScript types

## Next Steps

Now that you understand the basics, explore more features:

### 🔐 Add Authentication
Learn how to add user registration and login:
- [Authentication Guide](../guides/authentication)

### 📤 Upload Files
Add file upload capabilities:
- [File Upload Guide](../guides/file-uploads)

### ⚡ Real-time Updates
Get live data updates:
- [Real-time Guide](../guides/realtime)

### 🔍 Advanced Queries
Master complex filtering:
- [Query & Filtering Guide](../guides/querying-filtering)

### ☁️ Cloud Functions
Run server-side code:
- [Cloud Functions Guide](../guides/cloud-functions)

## Common Patterns

### Error Handling

```typescript
try {
  const task = await db.createDocument('tasks', {
    title: 'New Task'
  });
  console.log('Success!', task);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Pagination

```typescript
// Get first page
const page1 = await db.listDocuments('tasks', {
  limit: 10,
  offset: 0
});

// Get second page
const page2 = await db.listDocuments('tasks', {
  limit: 10,
  offset: 10
});
```

### Counting Documents

```typescript
const count = await db.countDocuments('tasks', {
  filters: { completed: false }
});
console.log(`Incomplete tasks: ${count.count}`);
```

## Tips for Beginners

:::tip Best Practices
1. **Use TypeScript** - Get better autocomplete and catch errors early
2. **Handle Errors** - Always wrap API calls in try-catch blocks
3. **Use Environment Variables** - Never hardcode API keys
4. **Create Interfaces** - Define types for your document data
:::

:::warning Common Mistakes
- Forgetting to await async calls
- Not handling errors
- Hardcoding API keys in code
- Not using TypeScript types
:::

## Need Help?

- 📖 [Read the full documentation](../core-concepts/collections)
- 💬 [Join our Discord](https://discord.gg/cocobase)
- 🐛 [Report issues](https://github.com/lordace-coder/coco_base_js/issues)

Ready to build something amazing? Let's go! 🚀

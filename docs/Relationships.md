# Relationships & Population Guide

Complete guide for working with relationships between documents in COCOBASE.

## 📖 Table of Contents

1. [Setting Up Relationships](#setting-up-relationships)
2. [Basic Population](#basic-population)
3. [Multiple Populations](#multiple-populations)
4. [Nested Populations](#nested-populations)
5. [Filtering by Relationship Fields](#filtering-by-relationship-fields)
6. [Field Selection with Relationships](#field-selection-with-relationships)
7. [Real-World Examples](#real-world-examples)
8. [Best Practices](#best-practices)

---

## Setting Up Relationships

Documents can reference other documents using foreign keys. By convention, use `{collection_name}_id` format:

### Example Document Structure

**Posts Collection:**

```json
{
  "id": "post-1",
  "title": "My First Post",
  "content": "Hello World",
  "author_id": "user-123",
  "category_id": "cat-456",
  "created_at": "2025-11-01T10:00:00Z"
}
```

**Users Collection:**

```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

**Categories Collection:**

```json
{
  "id": "cat-456",
  "name": "Technology",
  "slug": "technology"
}
```

### TypeScript Usage

```typescript
import { buildFilterQuery } from "cocobase";

// Create a post with relationships
const post = await db.createDocument("posts", {
  title: "My First Post",
  content: "Hello World",
  author_id: "user-123",
  category_id: "cat-456",
});
```

---

## Basic Population

Use the `populate` parameter to automatically fetch related documents. The populated data is added alongside the foreign key.

### Single Population

```typescript
// Populate author relationship
const queryString = buildFilterQuery({
  populate: "author",
});

// Use with API
const posts = await fetch(
  `${baseUrl}/collections/posts/documents?${queryString}`
);
```

**Response:**

```json
[
  {
    "id": "post-1",
    "title": "My First Post",
    "content": "Hello World",
    "author_id": "user-123",
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
]
```

### Key Points

- Original foreign key (`author_id`) is preserved
- Populated data is added as a new field (`author`)
- Population happens server-side for efficiency

---

## Multiple Populations

Populate multiple relationships at once by passing an array:

```typescript
// Populate both author and category
const queryString = buildFilterQuery({
  populate: ["author", "category"],
});
```

**Response:**

```json
[
  {
    "id": "post-1",
    "title": "My First Post",
    "content": "Hello World",
    "author_id": "user-123",
    "category_id": "cat-456",
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "category": {
      "id": "cat-456",
      "name": "Technology",
      "slug": "technology"
    }
  }
]
```

### Alternative Syntax

You can also pass a single string with comma separation:

```typescript
buildFilterQuery({
  populate: "author,category",
});
```

---

## Nested Populations

Populate relationships within relationships using dot notation:

```typescript
// Comments -> Post -> Author
const queryString = buildFilterQuery({
  populate: "post.author",
});
```

**Document Structure:**

```typescript
// Comments collection
{
  id: 'comment-1',
  text: 'Great post!',
  post_id: 'post-1',
  user_id: 'user-456'
}
```

**Response:**

```json
[
  {
    "id": "comment-1",
    "text": "Great post!",
    "post_id": "post-1",
    "user_id": "user-456",
    "post": {
      "id": "post-1",
      "title": "My First Post",
      "author_id": "user-123",
      "author": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
      }
    }
  }
]
```

### Multiple Nested Populations

```typescript
buildFilterQuery({
  populate: ["post.author", "post.category", "user"],
});
```

This populates:

1. The comment's post
2. The post's author
3. The post's category
4. The comment's user

---

## Filtering by Relationship Fields

Query documents based on related document data using dot notation in filters:

### Filter by Related Field

```typescript
// Find posts by admin authors
const queryString = buildFilterQuery({
  filters: {
    "author.role": "admin",
  },
  populate: "author",
});
```

**SQL Equivalent:**

```sql
SELECT posts.* FROM posts
JOIN users ON posts.author_id = users.id
WHERE users.role = 'admin'
```

### Using Operators on Relationships

All query operators work on relationship fields:

```typescript
// Find posts by authors with email containing 'john'
buildFilterQuery({
  filters: {
    "author.email_contains": "john",
  },
  populate: "author",
});

// Find posts by authors older than 18
buildFilterQuery({
  filters: {
    "author.age_gte": 18,
  },
  populate: "author",
});

// Find posts NOT in archived categories
buildFilterQuery({
  filters: {
    "category.name_ne": "archived",
  },
  populate: "category",
});
```

### Complex Relationship Queries

```typescript
// Find posts by admin authors OR verified authors in Technology category
buildFilterQuery({
  filters: {
    "[or]author.role": "admin",
    "[or]author.isVerified": true,
    "category.name": "Technology",
    status: "published",
  },
  populate: ["author", "category"],
  sort: "created_at",
  order: "desc",
});
```

---

## Field Selection with Relationships

Combine field selection with population to control response size:

### Select Specific Fields

```typescript
// Only return title, content, and author name/email
buildFilterQuery({
  select: ["title", "content", "author.name", "author.email"],
  populate: "author",
});
```

**Response:**

```json
[
  {
    "title": "My First Post",
    "content": "Hello World",
    "author": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Select from Multiple Relations

```typescript
buildFilterQuery({
  select: [
    "title",
    "content",
    "author.name",
    "author.email",
    "category.name",
    "category.slug",
  ],
  populate: ["author", "category"],
});
```

### Exclude Sensitive Data

```typescript
// Get user posts without exposing email
buildFilterQuery({
  select: ["title", "content", "author.name", "author.avatar"],
  populate: "author",
  filters: {
    status: "published",
  },
});
```

---

## Real-World Examples

### Blog System

```typescript
// Get published posts with author and category info
const blogQuery = buildFilterQuery({
  filters: {
    status: "published",
    "category.slug_ne": "draft",
  },
  populate: ["author", "category"],
  select: [
    "title",
    "excerpt",
    "slug",
    "created_at",
    "author.name",
    "author.avatar",
    "category.name",
    "category.slug",
  ],
  sort: "created_at",
  order: "desc",
  limit: 20,
});

const response = await fetch(
  `${baseUrl}/collections/posts/documents?${blogQuery}`
);
```

### Social Media Feed

```typescript
// Get posts from friends with comments
const feedQuery = buildFilterQuery({
  filters: {
    "author.id_in": friendIds.join(","),
    visibility: "public",
    "author.isBlocked": false,
  },
  populate: ["author", "comments.user"],
  select: [
    "content",
    "image",
    "created_at",
    "likes",
    "author.name",
    "author.avatar",
    "comments.text",
    "comments.user.name",
  ],
  sort: "created_at",
  order: "desc",
  limit: 50,
});
```

### E-commerce Orders

```typescript
// Get user orders with product and customer details
const ordersQuery = buildFilterQuery({
  filters: {
    "customer.id": userId,
    "[or]status": "pending",
    "[or]status": "processing",
    "product.inStock": true,
  },
  populate: ["customer", "product", "product.category"],
  select: [
    "orderNumber",
    "quantity",
    "total",
    "status",
    "customer.name",
    "customer.email",
    "product.name",
    "product.price",
    "product.image",
    "product.category.name",
  ],
  sort: "created_at",
  order: "desc",
});
```

### Content Management System

```typescript
// Get articles with author, editor, and tags
const cmsQuery = buildFilterQuery({
  filters: {
    "[or:status]status": "draft",
    "[or:status]status": "review",
    "author.department": "editorial",
    "editor.role": "senior-editor",
  },
  populate: ["author", "editor", "tags"],
  select: [
    "title",
    "slug",
    "status",
    "lastModified",
    "author.name",
    "author.email",
    "editor.name",
    "tags.name",
  ],
  sort: "lastModified",
  order: "desc",
  limit: 100,
});
```

### Project Management

```typescript
// Get tasks assigned to team with project details
const tasksQuery = buildFilterQuery({
  filters: {
    "assignee.team_id": teamId,
    "[or:priority]priority": "high",
    "[or:priority]isOverdue": true,
    "project.status_ne": "archived",
    status_notin: "completed,cancelled",
  },
  populate: ["assignee", "project", "project.owner"],
  select: [
    "title",
    "description",
    "dueDate",
    "priority",
    "assignee.name",
    "assignee.avatar",
    "project.name",
    "project.owner.name",
  ],
  sort: "dueDate",
  order: "asc",
});
```

### Healthcare Records

```typescript
// Get patient appointments with doctor and clinic info
const appointmentsQuery = buildFilterQuery({
  filters: {
    "patient.id": patientId,
    "doctor.specialty": "cardiology",
    "clinic.location_contains": "New York",
    date_gte: new Date().toISOString(),
    status_ne: "cancelled",
  },
  populate: ["patient", "doctor", "clinic"],
  select: [
    "date",
    "time",
    "type",
    "status",
    "doctor.name",
    "doctor.specialty",
    "clinic.name",
    "clinic.address",
  ],
  sort: "date",
  order: "asc",
});
```

---

## Best Practices

### ✅ DO's

1. **Use Consistent Naming Convention**

   ```typescript
   // Good: {collection}_id format
   author_id: "user-123";
   category_id: "cat-456";

   // Bad: Inconsistent naming
   authorId: "user-123";
   cat_id: "cat-456";
   ```

2. **Select Only Needed Fields**

   ```typescript
   // Good: Minimize data transfer
   buildFilterQuery({
     select: ["title", "author.name"],
     populate: "author",
   });

   // Bad: Fetching unnecessary data
   buildFilterQuery({
     populate: "author", // Gets all author fields
   });
   ```

3. **Filter Before Populating**

   ```typescript
   // Good: Filter reduces result set first
   buildFilterQuery({
     filters: { status: "published" },
     populate: "author",
   });
   ```

4. **Use Relationship Filtering**

   ```typescript
   // Good: Filter by relationship in one query
   buildFilterQuery({
     filters: { "author.role": "admin" },
     populate: "author",
   });

   // Bad: Fetch all, filter client-side
   const posts = await fetchAll();
   posts.filter((p) => p.author.role === "admin");
   ```

5. **Limit Nested Populations**

   ```typescript
   // Good: 1-2 levels deep
   populate: "post.author";

   // Avoid: Very deep nesting
   populate: "comment.post.author.team.company";
   ```

### ❌ DON'Ts

1. **Don't Over-Populate**

   ```typescript
   // Bad: Populating unnecessary relationships
   buildFilterQuery({
     populate: ["author", "category", "tags", "comments", "likes"],
   });

   // Good: Only what you need
   buildFilterQuery({
     populate: ["author", "category"],
   });
   ```

2. **Don't Skip Indexes on Foreign Keys**

   ```typescript
   // Ensure foreign key fields are indexed server-side
   // author_id, category_id should be indexed
   ```

3. **Don't Use Population for Aggregations**

   ```typescript
   // Bad: Populating thousands of comments
   populate: "comments"; // If post has 10k comments

   // Good: Use separate query with pagination
   buildFilterQuery({
     filters: { post_id: "post-1" },
     limit: 50,
     offset: 0,
   });
   ```

4. **Don't Mix Select and Exclude**
   ```typescript
   // Just use select for what you want
   select: ["title", "content", "author.name"];
   ```

---

## Performance Tips

### 1. Index Foreign Keys

Ensure all `*_id` fields are indexed on the server:

```json
{
  "author_id": "user-123", // Should be indexed
  "category_id": "cat-456" // Should be indexed
}
```

### 2. Use Pagination with Relationships

```typescript
buildFilterQuery({
  filters: { "author.role": "admin" },
  populate: "author",
  limit: 50,
  offset: 0,
});
```

### 3. Select Specific Fields

```typescript
// Instead of fetching entire documents
buildFilterQuery({
  select: ["title", "author.name", "author.avatar"],
  populate: "author",
});
```

### 4. Cache Frequently Used Relationships

```typescript
// Cache author data client-side if querying same authors repeatedly
const authorCache = new Map();
```

### 5. Batch Related Queries

```typescript
// Instead of N+1 queries, use populate
// Bad: N+1 pattern
for (const post of posts) {
  post.author = await fetchUser(post.author_id);
}

// Good: Single query with populate
const posts = await fetchPosts({ populate: "author" });
```

---

## TypeScript Support

Full type safety with relationships:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  author?: User; // Populated
  category?: Category; // Populated
}

// Type-safe query building
const query = buildFilterQuery({
  filters: {
    "author.role": "admin",
    "category.slug": "technology",
    status: "published",
  },
  populate: ["author", "category"],
  select: ["title", "author.name", "category.name"],
  sort: "created_at",
  order: "desc",
});
```

---

## Summary

COCOBASE relationships provide:

- ✅ **Simple foreign key convention**: `{collection}_id`
- ✅ **Automatic population**: Fetch related data with `populate`
- ✅ **Nested relationships**: Support for multi-level populations
- ✅ **Relationship filtering**: Query on related document fields
- ✅ **Field selection**: Control response size with `select`
- ✅ **Full operator support**: All query operators work on relationships
- ✅ **Type-safe**: Full TypeScript support

Build powerful relational queries with ease! 🚀

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025

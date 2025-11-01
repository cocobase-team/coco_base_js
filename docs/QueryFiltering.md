# Advanced Query Filtering - JavaScript/TypeScript SDK

Complete guide for using advanced query filtering in the COCOBASE JavaScript/TypeScript SDK.

## 🚀 Quick Start

```typescript
import { buildFilterQuery } from "coco_base_js";

// Simple query
const query = buildFilterQuery({
  filters: { status: "active", age_gte: 18 },
  limit: 50,
  offset: 0,
});
// Returns: "status=active&age_gte=18&limit=50&offset=0"
```

## 📖 Table of Contents

1. [Basic Operators](#basic-operators)
2. [Simple AND Conditions](#simple-and-conditions)
3. [Multi-Field OR](#multi-field-or)
4. [Simple OR Conditions](#simple-or-conditions)
5. [Mixed AND + OR](#mixed-and--or)
6. [Named OR Groups](#named-or-groups)
7. [Sorting & Pagination](#sorting--pagination)
8. [Real-World Examples](#real-world-examples)
9. [TypeScript Support](#typescript-support)

## Basic Operators

All operators are used as suffixes to field names, separated by underscore.

### Comparison Operators

```typescript
// Equals (default - no suffix needed)
buildFilterQuery({ filters: { status: "active" } });
// status=active

// Not equals
buildFilterQuery({ filters: { status_ne: "deleted" } });
// status_ne=deleted

// Greater than
buildFilterQuery({ filters: { age_gt: 18 } });
// age_gt=18

// Greater than or equal
buildFilterQuery({ filters: { age_gte: 18 } });
// age_gte=18

// Less than
buildFilterQuery({ filters: { age_lt: 65 } });
// age_lt=65

// Less than or equal
buildFilterQuery({ filters: { age_lte: 65 } });
// age_lte=65
```

### String Operators

```typescript
// Contains substring (case-insensitive)
buildFilterQuery({ filters: { name_contains: "john" } });
// name_contains=john

// Starts with
buildFilterQuery({ filters: { name_startswith: "john" } });
// name_startswith=john

// Ends with
buildFilterQuery({ filters: { email_endswith: "gmail.com" } });
// email_endswith=gmail.com
```

### List Operators

```typescript
// In list (comma-separated values)
buildFilterQuery({ filters: { status_in: "active,pending,review" } });
// status_in=active,pending,review

// Not in list
buildFilterQuery({ filters: { status_notin: "deleted,banned" } });
// status_notin=deleted,banned
```

### Null Checks

```typescript
// Is null
buildFilterQuery({ filters: { deletedAt_isnull: true } });
// deletedAt_isnull=true

// Is not null
buildFilterQuery({ filters: { profilePicture_isnull: false } });
// profilePicture_isnull=false
```

## Simple AND Conditions

By default, all filter conditions are combined with AND logic.

```typescript
// Find active users aged 18-65
buildFilterQuery({
  filters: {
    status: "active",
    age_gte: 18,
    age_lte: 65,
  },
});
// status=active&age_gte=18&age_lte=65
// SQL: WHERE status = 'active' AND age >= 18 AND age <= 65
```

```typescript
// Find verified premium users in USA
buildFilterQuery({
  filters: {
    isVerified: true,
    isPremium: true,
    country: "USA",
  },
});
// SQL: WHERE isVerified = true AND isPremium = true AND country = 'USA'
```

## Multi-Field OR

Search for the same value across multiple fields using `field1__or__field2` syntax.

```typescript
// Search "john" in name OR email
buildFilterQuery({
  filters: {
    name__or__email_contains: "john",
  },
});
// SQL: WHERE (name ILIKE '%john%' OR email ILIKE '%john%')
```

```typescript
// Search in 3 fields
buildFilterQuery({
  filters: {
    name__or__username__or__email_contains: "admin",
  },
});
// SQL: WHERE (name ILIKE '%admin%' OR username ILIKE '%admin%' OR email ILIKE '%admin%')
```

```typescript
// Find documents where firstName OR lastName is "Smith"
buildFilterQuery({
  filters: {
    firstName__or__lastName: "Smith",
  },
});
// SQL: WHERE (firstName = 'Smith' OR lastName = 'Smith')
```

## Simple OR Conditions

Use `[or]` prefix to group multiple conditions with OR logic.

```typescript
// Find users who are EITHER over 18 OR admins
buildFilterQuery({
  filters: {
    "[or]age_gte": 18,
    "[or]role": "admin",
  },
});
// SQL: WHERE (age >= 18 OR role = 'admin')
```

```typescript
// Find premium OR verified users
buildFilterQuery({
  filters: {
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
});
// SQL: WHERE (isPremium = true OR isVerified = true)
```

## Mixed AND + OR

Combine AND and OR logic. OR conditions are grouped together and ANDed with other filters.

```typescript
// Find active users who are EITHER premium OR verified
buildFilterQuery({
  filters: {
    status: "active",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
});
// SQL: WHERE status = 'active' AND (isPremium = true OR isVerified = true)
```

```typescript
// Find incomplete tasks with specific criteria
buildFilterQuery({
  filters: {
    status: "incomplete",
    assignedTo: "user123",
    "[or]priority_gte": 8,
    "[or]dueDate_lt": "2025-01-01",
  },
});
// SQL: WHERE status = 'incomplete' AND assignedTo = 'user123'
//      AND (priority >= 8 OR dueDate < '2025-01-01')
```

## Named OR Groups

Create multiple independent OR groups using `[or:groupname]` syntax. Each group is ORed internally, and groups are ANDed together.

```typescript
// (age >= 18 OR role = admin) AND (country = USA OR country = UK)
buildFilterQuery({
  filters: {
    "[or:age]age_gte": 18,
    "[or:age]role": "admin",
    "[or:country]country": "USA",
    "[or:country]country": "UK",
  },
});
// SQL: WHERE (age >= 18 OR role = 'admin') AND (country = 'USA' OR country = 'UK')
```

```typescript
// Complex product filter
buildFilterQuery({
  filters: {
    "[or:availability]inStock": true,
    "[or:availability]isPreOrder": true,
    "[or:deals]onSale": true,
    "[or:deals]hasDiscount": true,
    price_lte: 100,
  },
});
// SQL: WHERE (inStock = true OR isPreOrder = true)
//      AND (onSale = true OR hasDiscount = true)
//      AND price <= 100
```

## Sorting & Pagination

Control result ordering and pagination.

```typescript
// Sort by age ascending
buildFilterQuery({
  filters: { status: "active" },
  sort: "age",
  order: "asc",
});
```

```typescript
// Sort by creation date descending (default)
buildFilterQuery({
  filters: { status: "active" },
  sort: "created_at",
  order: "desc",
});
```

```typescript
// Paginate results (20 per page, page 3)
buildFilterQuery({
  filters: { status: "active" },
  limit: 20,
  offset: 40, // (page - 1) * limit
});
```

```typescript
// Combined: Active users, sorted by age, page 2
buildFilterQuery({
  filters: { status: "active" },
  sort: "age",
  order: "asc",
  limit: 20,
  offset: 20,
});
```

## Real-World Examples

### E-commerce Product Search

```typescript
// Find available products in price range with promotions
buildFilterQuery({
  filters: {
    "[or:availability]inStock": true,
    "[or:availability]preOrder": true,
    "[or:promo]onSale": true,
    "[or:promo]isNew": true,
    price_gte: 50,
    price_lte: 200,
    category: "electronics",
  },
  sort: "price",
  order: "asc",
  limit: 50,
});
```

### User Management - Find Risky Users

```typescript
buildFilterQuery({
  filters: {
    "[or]failedLogins_gte": 5,
    "[or]suspiciousActivity": true,
    status_ne: "banned",
    lastLogin_lt: "2025-10-01",
  },
  sort: "lastLogin",
  order: "desc",
});
```

### Task Management - Urgent Tasks

```typescript
buildFilterQuery({
  filters: {
    "[or:urgency]priority": "high",
    "[or:urgency]isOverdue": true,
    "[or:assignment]assignedTo": "currentUserId",
    "[or:assignment]assignedTo_isnull": true,
    status_ne: "completed",
  },
  sort: "dueDate",
  order: "asc",
});
```

### Social Media - Popular Posts

```typescript
buildFilterQuery({
  filters: {
    "[or]likes_gt": 100,
    "[or]comments_gt": 50,
    createdAt_gte: "2025-10-01",
    isReported: false,
    isPublic: true,
  },
  sort: "likes",
  order: "desc",
  limit: 50,
  offset: 0,
});
```

### Healthcare - Critical Patients

```typescript
buildFilterQuery({
  filters: {
    "[or:vitals]temperature_gt": 38,
    "[or:vitals]bloodPressure_gt": 140,
    "[or:vitals]heartRate_gt": 100,
    "[or:risk]age_gt": 65,
    "[or:risk]chronicCondition": true,
    status: "admitted",
  },
  sort: "admissionDate",
  order: "desc",
});
```

### Inventory Management - Restock Needed

```typescript
buildFilterQuery({
  filters: {
    '[or:low]stock_lt': 10,
    '[or:low]stock': 0,
    '[or:important]isPopular': true,
    '[or:important]isEssential': true,
    discontinued: false,
    supplier_ne': 'unavailable'
  },
  sort: 'stock',
  order: 'asc'
});
```

## TypeScript Support

The SDK provides full TypeScript support with proper types.

```typescript
import { buildFilterQuery, type Query } from "coco_base_js";
import type { FilterOperator } from "coco_base_js/types/filter";

// Type-safe query building
const query: Query = {
  filters: {
    status: "active",
    age_gte: 18,
    name__or__email_contains: "john",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
  sort: "createdAt",
  order: "desc", // Typed as 'asc' | 'desc'
  limit: 50,
  offset: 0,
};

const queryString = buildFilterQuery(query);
```

### Available Types

```typescript
// Filter operators
type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "startswith"
  | "endswith"
  | "in"
  | "notin"
  | "isnull";

// Query interface
interface Query {
  filters?: Record<string, string | number | boolean>;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
}
```

## Helper Functions

### parseFilterKey

Parse a filter key to extract fields, operator, and OR group information.

```typescript
import { parseFilterKey } from "coco_base_js";

// Simple field with operator
parseFilterKey("age_gte");
// Returns: { fields: ['age'], operator: 'gte', isOrFields: false }

// Multi-field OR
parseFilterKey("name__or__email_contains");
// Returns: { fields: ['name', 'email'], operator: 'contains', isOrFields: true }

// OR group
parseFilterKey("[or]age_gte");
// Returns: { fields: ['age'], operator: 'gte', isOrFields: false, orGroupName: 'default' }

// Named OR group
parseFilterKey("[or:age]age_gte");
// Returns: { fields: ['age'], operator: 'gte', isOrFields: false, orGroupName: 'age' }
```

## Best Practices

### ✅ DO's

1. **Use meaningful group names for complex queries**

   ```typescript
   // Good
   '[or:age]age_gte': 18,
   '[or:age]role': 'admin',
   '[or:location]country': 'US'

   // Bad
   '[or:a]age_gte': 18,
   '[or:b]country': 'US'
   ```

2. **Use the IN operator for multiple values**

   ```typescript
   // Good
   status_in: 'active,pending,review'

   // Less efficient
   '[or]status': 'active',
   '[or]status': 'pending',
   '[or]status': 'review'
   ```

3. **Combine sorting with filtering**
   ```typescript
   buildFilterQuery({
     filters: { status: "active" },
     sort: "createdAt",
     order: "desc",
   });
   ```

### ❌ DON'Ts

1. **Don't over-complicate queries**

   - Keep OR groups under 3-4 when possible
   - Consider server-side filtering for complex logic

2. **Don't mix unrelated conditions in the same group**

   ```typescript
   // Bad
   '[or:mixed]age_gte': 18,
   '[or:mixed]country': 'US'

   // Good
   '[or:age]age_gte': 18,
   '[or:location]country': 'US'
   ```

3. **Don't forget about pagination for large datasets**
   ```typescript
   // Always include limit/offset for potentially large results
   buildFilterQuery({
     filters: { status: "active" },
     limit: 50,
     offset: 0,
   });
   ```

## Performance Tips

1. **Use indexed fields first in your filters**
2. **Limit result sets with appropriate `limit` values**
3. **Use `startswith` instead of `contains` when possible** (better index usage)
4. **Avoid broad wildcard searches** on large datasets

## Integration with Collections

Use query building with your collection queries:

```typescript
import { buildFilterQuery } from "coco_base_js";
import { db } from "./your-db-config";

// Build query
const queryString = buildFilterQuery({
  filters: {
    status: "active",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
  sort: "createdAt",
  order: "desc",
  limit: 50,
  offset: 0,
});

// Use with your API
const response = await fetch(
  `${baseUrl}/collections/users/documents?${queryString}`
);
const data = await response.json();
```

## Testing

Run the examples file to see all features in action:

```bash
npm run test:queries
```

Or import and run specific examples:

```typescript
import "./examples/advanced-queries";
```

## Support

For issues or questions:

- GitHub: [COCOBASE/coco_base_js](https://github.com/lordace-coder/coco_base_js)
- Documentation: [docs/README.md](./README.md)

---

**Version**: 1.0.0  
**Last Updated**: October 31, 2025

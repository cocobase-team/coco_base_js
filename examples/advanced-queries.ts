/**
 * Advanced Query Filtering Examples
 *
 * This file demonstrates all the advanced query filtering capabilities
 * supported by the buildFilterQuery function.
 */

import { buildFilterQuery } from "../src/utils/utils";
import type { Query } from "../src/types/types";

// ============================================================================
// 1. Basic Operators
// ============================================================================

console.log("\n=== Basic Operators ===\n");

// Equals (default)
const basicEquals: Query = {
  filters: { status: "active" },
};
console.log("Equals:", buildFilterQuery(basicEquals));
// Output: status=active&limit=100&offset=0

// Not equals
const notEquals: Query = {
  filters: { status_ne: "deleted" },
};
console.log("Not Equals:", buildFilterQuery(notEquals));
// Output: status_ne=deleted&limit=100&offset=0

// Greater than
const greaterThan: Query = {
  filters: { age_gt: 18 },
};
console.log("Greater Than:", buildFilterQuery(greaterThan));
// Output: age_gt=18&limit=100&offset=0

// Greater than or equal
const greaterThanOrEqual: Query = {
  filters: { age_gte: 18 },
};
console.log("Greater Than or Equal:", buildFilterQuery(greaterThanOrEqual));
// Output: age_gte=18&limit=100&offset=0

// Less than
const lessThan: Query = {
  filters: { age_lt: 65 },
};
console.log("Less Than:", buildFilterQuery(lessThan));
// Output: age_lt=65&limit=100&offset=0

// Less than or equal
const lessThanOrEqual: Query = {
  filters: { age_lte: 65 },
};
console.log("Less Than or Equal:", buildFilterQuery(lessThanOrEqual));
// Output: age_lte=65&limit=100&offset=0

// Contains substring
const contains: Query = {
  filters: { name_contains: "john" },
};
console.log("Contains:", buildFilterQuery(contains));
// Output: name_contains=john&limit=100&offset=0

// Starts with
const startsWith: Query = {
  filters: { name_startswith: "john" },
};
console.log("Starts With:", buildFilterQuery(startsWith));
// Output: name_startswith=john&limit=100&offset=0

// Ends with
const endsWith: Query = {
  filters: { email_endswith: "gmail.com" },
};
console.log("Ends With:", buildFilterQuery(endsWith));
// Output: email_endswith=gmail.com&limit=100&offset=0

// In list
const inList: Query = {
  filters: { status_in: "active,pending,review" },
};
console.log("In List:", buildFilterQuery(inList));
// Output: status_in=active,pending,review&limit=100&offset=0

// Not in list
const notInList: Query = {
  filters: { status_notin: "deleted,banned" },
};
console.log("Not In List:", buildFilterQuery(notInList));
// Output: status_notin=deleted,banned&limit=100&offset=0

// Is null
const isNull: Query = {
  filters: { deletedAt_isnull: true },
};
console.log("Is Null:", buildFilterQuery(isNull));
// Output: deletedAt_isnull=true&limit=100&offset=0

// Is not null
const isNotNull: Query = {
  filters: { profilePicture_isnull: false },
};
console.log("Is Not Null:", buildFilterQuery(isNotNull));
// Output: profilePicture_isnull=false&limit=100&offset=0

// ============================================================================
// 2. Simple AND Conditions
// ============================================================================

console.log("\n=== Simple AND Conditions ===\n");

// Find active users aged 18-65
const simpleAnd: Query = {
  filters: {
    status: "active",
    age_gte: 18,
    age_lte: 65,
  },
};
console.log("Simple AND:", buildFilterQuery(simpleAnd));
// Output: status=active&age_gte=18&age_lte=65&limit=100&offset=0

// Find verified premium users in USA
const multipleAnd: Query = {
  filters: {
    isVerified: true,
    isPremium: true,
    country: "USA",
  },
};
console.log("Multiple AND:", buildFilterQuery(multipleAnd));
// Output: isVerified=true&isPremium=true&country=USA&limit=100&offset=0

// ============================================================================
// 3. Multi-Field OR (Same Value, Multiple Fields)
// ============================================================================

console.log("\n=== Multi-Field OR ===\n");

// Search "john" in name OR email
const multiFieldOr: Query = {
  filters: {
    name__or__email_contains: "john",
  },
};
console.log("Multi-Field OR (2 fields):", buildFilterQuery(multiFieldOr));
// Output: name__or__email_contains=john&limit=100&offset=0

// Search in multiple fields
const multiFieldOrMany: Query = {
  filters: {
    name__or__username__or__email_contains: "admin",
  },
};
console.log("Multi-Field OR (3 fields):", buildFilterQuery(multiFieldOrMany));
// Output: name__or__username__or__email_contains=admin&limit=100&offset=0

// Find documents where firstName OR lastName is "Smith"
const multiFieldEquals: Query = {
  filters: {
    firstName__or__lastName: "Smith",
  },
};
console.log("Multi-Field OR (equals):", buildFilterQuery(multiFieldEquals));
// Output: firstName__or__lastName=Smith&limit=100&offset=0

// ============================================================================
// 4. Simple OR Conditions (Using [or] Prefix)
// ============================================================================

console.log("\n=== Simple OR Conditions ===\n");

// Find users who are EITHER over 18 OR admins
const simpleOr: Query = {
  filters: {
    "[or]age_gte": 18,
    "[or]role": "admin",
  },
};
console.log("Simple OR:", buildFilterQuery(simpleOr));
// Output: [or]age_gte=18&[or]role=admin&limit=100&offset=0

// Find premium users OR verified users
const simpleOrBoolean: Query = {
  filters: {
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
};
console.log("Simple OR (boolean):", buildFilterQuery(simpleOrBoolean));
// Output: [or]isPremium=true&[or]isVerified=true&limit=100&offset=0

// ============================================================================
// 5. Mixed AND + OR Conditions
// ============================================================================

console.log("\n=== Mixed AND + OR ===\n");

// Find active users who are EITHER premium OR verified
const mixedAndOr: Query = {
  filters: {
    status: "active",
    "[or]isPremium": true,
    "[or]isVerified": true,
  },
};
console.log("Mixed AND + OR:", buildFilterQuery(mixedAndOr));
// Output: status=active&[or]isPremium=true&[or]isVerified=true&limit=100&offset=0

// Find incomplete tasks assigned to user OR high priority
const complexMixed: Query = {
  filters: {
    status: "incomplete",
    assignedTo: "user123",
    "[or]priority_gte": 8,
    "[or]dueDate_lt": "2025-01-01",
  },
};
console.log("Complex Mixed:", buildFilterQuery(complexMixed));
// Output: status=incomplete&assignedTo=user123&[or]priority_gte=8&[or]dueDate_lt=2025-01-01&limit=100&offset=0

// ============================================================================
// 6. Multiple OR Groups (Named Groups)
// ============================================================================

console.log("\n=== Multiple OR Groups ===\n");

// (age >= 18 OR role = admin) AND (country = USA OR country = UK)
const namedOrGroups: Query = {
  filters: {
    "[or:age]age_gte": 18,
    "[or:age]role": "admin",
    "[or:country]country": "USA",
    "[or:country]country_ne": "banned", // Note: URLSearchParams handles duplicate keys
  },
};
console.log("Named OR Groups:", buildFilterQuery(namedOrGroups));
// Output: [or:age]age_gte=18&[or:age]role=admin&[or:country]country=USA&[or:country]country_ne=banned&limit=100&offset=0

// (premium OR verified) AND (active OR pending)
const twoGroups: Query = {
  filters: {
    "[or:tier]isPremium": true,
    "[or:tier]isVerified": true,
    "[or:status]status": "active",
    "[or:status]status_ne": "deleted",
  },
};
console.log("Two Named Groups:", buildFilterQuery(twoGroups));
// Output: [or:tier]isPremium=true&[or:tier]isVerified=true&[or:status]status=active&[or:status]status_ne=deleted&limit=100&offset=0

// ============================================================================
// 7. Sorting & Pagination
// ============================================================================

console.log("\n=== Sorting & Pagination ===\n");

// Sort by age ascending
const sortAsc: Query = {
  filters: { status: "active" },
  sort: "age",
  order: "asc",
};
console.log("Sort Ascending:", buildFilterQuery(sortAsc));
// Output: status=active&sort=age&order=asc&limit=100&offset=0

// Sort by creation date descending
const sortDesc: Query = {
  filters: { status: "active" },
  sort: "created_at",
  order: "desc",
};
console.log("Sort Descending:", buildFilterQuery(sortDesc));
// Output: status=active&sort=created_at&order=desc&limit=100&offset=0

// Paginate results (20 per page, page 3)
const pagination: Query = {
  filters: { status: "active" },
  limit: 20,
  offset: 40,
};
console.log("Pagination (page 3):", buildFilterQuery(pagination));
// Output: status=active&limit=20&offset=40

// Combined: Active users, sorted by age, page 2
const combined: Query = {
  filters: { status: "active" },
  sort: "age",
  order: "asc",
  limit: 20,
  offset: 20,
};
console.log("Combined Sort + Pagination:", buildFilterQuery(combined));
// Output: status=active&sort=age&order=asc&limit=20&offset=20

// ============================================================================
// 8. Real-World Complex Examples
// ============================================================================

console.log("\n=== Real-World Examples ===\n");

// E-commerce: Find available products
const ecommerce: Query = {
  filters: {
    "[or:avail]inStock": true,
    "[or:avail]preOrder": true,
    "[or:promo]onSale": true,
    "[or:promo]isNew": true,
    price_gte: 50,
    price_lte: 200,
  },
  sort: "price",
  order: "asc",
};
console.log("E-commerce Search:", buildFilterQuery(ecommerce));

// User Management: Find risky users
const userManagement: Query = {
  filters: {
    "[or]failedLogins_gte": 5,
    "[or]suspiciousActivity": true,
    status_ne: "banned",
  },
  sort: "lastLogin",
  order: "desc",
};
console.log("Risky Users:", buildFilterQuery(userManagement));

// Task Management: Find urgent tasks
const taskManagement: Query = {
  filters: {
    "[or:urgency]priority": "high",
    "[or:urgency]isOverdue": true,
    "[or:assignment]assignedTo": "user123",
    "[or:assignment]assignedTo_isnull": true,
    status_ne: "completed",
  },
};
console.log("Urgent Tasks:", buildFilterQuery(taskManagement));

// Social Media: Find popular posts
const socialMedia: Query = {
  filters: {
    "[or]likes_gt": 100,
    "[or]comments_gt": 50,
    createdAt_gte: "2025-01-05",
    isReported: false,
  },
  sort: "likes",
  order: "desc",
  limit: 50,
};
console.log("Popular Posts:", buildFilterQuery(socialMedia));

// Healthcare: Find critical patients
const healthcare: Query = {
  filters: {
    "[or:vitals]temperature_gt": 38,
    "[or:vitals]bloodPressure_gt": 140,
    "[or:risk]age_gt": 65,
    "[or:risk]chronicCondition": true,
  },
};
console.log("Critical Patients:", buildFilterQuery(healthcare));

// Inventory: Find products needing restock
const inventory: Query = {
  filters: {
    "[or:low]stock_lt": 10,
    "[or:low]stock": 0,
    "[or:important]isPopular": true,
    "[or:important]isEssential": true,
    discontinued: false,
  },
};
console.log("Restock Needed:", buildFilterQuery(inventory));

// ============================================================================
// 9. Edge Cases and Special Scenarios
// ============================================================================

console.log("\n=== Edge Cases ===\n");

// Empty filters
const emptyFilters: Query = {
  filters: {},
};
console.log("Empty Filters:", buildFilterQuery(emptyFilters));
// Output: limit=100&offset=0

// Only pagination
const onlyPagination: Query = {
  limit: 50,
  offset: 100,
};
console.log("Only Pagination:", buildFilterQuery(onlyPagination));
// Output: limit=50&offset=100

// Boolean values
const booleanValues: Query = {
  filters: {
    isActive: true,
    isDeleted: false,
    isPremium: true,
  },
};
console.log("Boolean Values:", buildFilterQuery(booleanValues));
// Output: isActive=true&isDeleted=false&isPremium=true&limit=100&offset=0

// Numeric values
const numericValues: Query = {
  filters: {
    age: 25,
    score_gte: 80,
    price_lt: 100.5,
  },
};
console.log("Numeric Values:", buildFilterQuery(numericValues));
// Output: age=25&score_gte=80&price_lt=100.5&limit=100&offset=0

// Special characters (URL encoding handled by URLSearchParams)
const specialChars: Query = {
  filters: {
    email_contains: "user@example.com",
    name: "John Doe",
  },
};
console.log("Special Characters:", buildFilterQuery(specialChars));
// Output: email_contains=user%40example.com&name=John+Doe&limit=100&offset=0

console.log("\n=== All Examples Complete ===\n");

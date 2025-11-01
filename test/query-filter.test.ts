/**
 * Test Suite for Advanced Query Filtering
 *
 * Run with: npm test or npx ts-node test/query-filter.test.ts
 */

import { buildFilterQuery, parseFilterKey } from "../src/utils/utils";
import type { Query } from "../src/types/types";

// Test counter
let passed = 0;
let failed = 0;

function test(name: string, actual: string, expected: string) {
  if (actual === expected) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.log(`✗ ${name}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
  }
}
// Test basic population
test(
  "Basic population",
  buildFilterQuery({
    filters: { status: "active" },
    populate: "author",
  }),
  "status=active&populate=author&limit=100&offset=0"
);

// Test multiple populations (array)
test(
  "Multiple populations (array)",
  buildFilterQuery({
    populate: ["author", "category"],
  }),
  "populate=author&populate=category&limit=100&offset=0"
);

// Test nested population
test(
  "Nested population",
  buildFilterQuery({
    populate: "post.author",
  }),
  "populate=post.author&limit=100&offset=0"
);

// Test filtering by relationship field
test(
  "Filter by relationship field",
  buildFilterQuery({
    filters: { "author.role": "admin" },
    populate: "author",
  }),
  "author.role=admin&populate=author&limit=100&offset=0"
);

// Test relationship field with operator
test(
  "Relationship field with operator",
  buildFilterQuery({
    filters: {
      "author.email_contains": "john",
      "category.name_ne": "archived",
    },
    populate: ["author", "category"],
  }),
  "author.email_contains=john&category.name_ne=archived&populate=author&populate=category&limit=100&offset=0"
);

// Test field selection
test(
  "Field selection",
  buildFilterQuery({
    select: ["title", "content", "author.name"],
    filters: { status: "published" },
  }),
  "status=published&select=title&select=content&select=author.name&limit=100&offset=0"
);

// Test combined relationships with select
test(
  "Combined population and selection",
  buildFilterQuery({
    filters: { status: "published" },
    populate: ["author", "category"],
    select: ["title", "author.name", "category.name"],
  }),
  "status=published&populate=author&populate=category&select=title&select=author.name&select=category.name&limit=100&offset=0"
);

// Test complex relationship query
test(
  "Complex relationship query",
  buildFilterQuery({
    filters: {
      "[or]author.role": "admin",
      "[or]author.isVerified": true,
      "category.slug": "technology",
      status: "published",
    },
    populate: ["author", "category"],
    select: ["title", "content", "author.name", "category.name"],
    sort: "created_at",
    order: "desc",
    limit: 50,
  }),
  "%5Bor%5Dauthor.role=admin&%5Bor%5Dauthor.isVerified=true&category.slug=technology&status=published&populate=author&populate=category&select=title&select=content&select=author.name&select=category.name&sort=created_at&order=desc&limit=50&offset=0"
);

// Test nested population with filters
test(
  "Nested population with filters",
  buildFilterQuery({
    filters: {
      "post.author.role": "admin",
      "post.status": "published",
    },
    populate: "post.author",
  }),
  "post.author.role=admin&post.status=published&populate=post.author&limit=100&offset=0"
);

// Test relationship with IN operator
test(
  "Relationship with IN operator",
  buildFilterQuery({
    filters: {
      "author.role_in": "admin,editor,moderator",
    },
    populate: "author",
  }),
  "author.role_in=admin%2Ceditor%2Cmoderator&populate=author&limit=100&offset=0"
);

function testParseKey(name: string, key: string, expected: any) {
  const actual = parseFilterKey(key);
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  if (match) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.log(`✗ ${name}`);
    console.log(`  Expected:`, expected);
    console.log(`  Actual:  `, actual);
  }
}

console.log("\n=== Testing buildFilterQuery ===\n");

// Test 1: Basic equals
test(
  "Basic equals",
  buildFilterQuery({ filters: { status: "active" } }),
  "status=active&limit=100&offset=0"
);

// Test 2: Comparison operators
test(
  "Greater than or equal",
  buildFilterQuery({ filters: { age_gte: 18 } }),
  "age_gte=18&limit=100&offset=0"
);

test(
  "Less than",
  buildFilterQuery({ filters: { age_lt: 65 } }),
  "age_lt=65&limit=100&offset=0"
);

test(
  "Not equals",
  buildFilterQuery({ filters: { status_ne: "deleted" } }),
  "status_ne=deleted&limit=100&offset=0"
);

// Test 3: String operators
test(
  "Contains",
  buildFilterQuery({ filters: { name_contains: "john" } }),
  "name_contains=john&limit=100&offset=0"
);

test(
  "Starts with",
  buildFilterQuery({ filters: { name_startswith: "admin" } }),
  "name_startswith=admin&limit=100&offset=0"
);

test(
  "Ends with",
  buildFilterQuery({ filters: { email_endswith: "gmail.com" } }),
  "email_endswith=gmail.com&limit=100&offset=0"
);

// Test 4: List operators
test(
  "In list",
  buildFilterQuery({ filters: { status_in: "active,pending" } }),
  "status_in=active%2Cpending&limit=100&offset=0"
);

test(
  "Not in list",
  buildFilterQuery({ filters: { status_notin: "deleted,banned" } }),
  "status_notin=deleted%2Cbanned&limit=100&offset=0"
);

// Test 5: Null checks
test(
  "Is null",
  buildFilterQuery({ filters: { deletedAt_isnull: true } }),
  "deletedAt_isnull=true&limit=100&offset=0"
);

// Test 6: Multiple AND conditions
test(
  "Multiple AND",
  buildFilterQuery({
    filters: {
      status: "active",
      age_gte: 18,
      age_lte: 65,
    },
  }),
  "status=active&age_gte=18&age_lte=65&limit=100&offset=0"
);

// Test 7: Multi-field OR
test(
  "Multi-field OR",
  buildFilterQuery({
    filters: {
      name__or__email_contains: "john",
    },
  }),
  "name__or__email_contains=john&limit=100&offset=0"
);

// Test 8: Simple OR conditions
test(
  "Simple OR",
  buildFilterQuery({
    filters: {
      "[or]age_gte": 18,
      "[or]role": "admin",
    },
  }),
  "%5Bor%5Dage_gte=18&%5Bor%5Drole=admin&limit=100&offset=0"
);

// Test 9: Mixed AND + OR
test(
  "Mixed AND + OR",
  buildFilterQuery({
    filters: {
      status: "active",
      "[or]isPremium": true,
      "[or]isVerified": true,
    },
  }),
  "status=active&%5Bor%5DisPremium=true&%5Bor%5DisVerified=true&limit=100&offset=0"
);

// Test 10: Named OR groups
test(
  "Named OR groups",
  buildFilterQuery({
    filters: {
      "[or:age]age_gte": 18,
      "[or:age]role": "admin",
      "[or:location]country": "USA",
    },
  }),
  "%5Bor%3Aage%5Dage_gte=18&%5Bor%3Aage%5Drole=admin&%5Bor%3Alocation%5Dcountry=USA&limit=100&offset=0"
);

// Test 11: Sorting ascending
test(
  "Sort ascending",
  buildFilterQuery({
    filters: { status: "active" },
    sort: "age",
    order: "asc",
  }),
  "status=active&sort=age&order=asc&limit=100&offset=0"
);

// Test 12: Sorting descending
test(
  "Sort descending",
  buildFilterQuery({
    filters: { status: "active" },
    sort: "created_at",
    order: "desc",
  }),
  "status=active&sort=created_at&order=desc&limit=100&offset=0"
);

// Test 13: Pagination
test(
  "Pagination",
  buildFilterQuery({
    filters: { status: "active" },
    limit: 20,
    offset: 40,
  }),
  "status=active&limit=20&offset=40"
);

// Test 14: Combined sorting and pagination
test(
  "Sort + Pagination",
  buildFilterQuery({
    filters: { status: "active" },
    sort: "age",
    order: "asc",
    limit: 50,
    offset: 100,
  }),
  "status=active&sort=age&order=asc&limit=50&offset=100"
);

// Test 15: Empty filters
test("Empty filters", buildFilterQuery({ filters: {} }), "limit=100&offset=0");

// Test 16: Boolean values
test(
  "Boolean values",
  buildFilterQuery({
    filters: {
      isActive: true,
      isDeleted: false,
    },
  }),
  "isActive=true&isDeleted=false&limit=100&offset=0"
);

// Test 17: Numeric values
test(
  "Numeric values",
  buildFilterQuery({
    filters: {
      age: 25,
      score_gte: 80,
    },
  }),
  "age=25&score_gte=80&limit=100&offset=0"
);

// Test 18: Complex real-world example
test(
  "Complex e-commerce query",
  buildFilterQuery({
    filters: {
      "[or:avail]inStock": true,
      "[or:avail]preOrder": true,
      "[or:promo]onSale": true,
      price_gte: 50,
      price_lte: 200,
      category: "electronics",
    },
    sort: "price",
    order: "asc",
    limit: 50,
  }),
  "%5Bor%3Aavail%5DinStock=true&%5Bor%3Aavail%5DpreOrder=true&%5Bor%3Apromo%5DonSale=true&price_gte=50&price_lte=200&category=electronics&sort=price&order=asc&limit=50&offset=0"
);

console.log("\n=== Testing parseFilterKey ===\n");

// Test parseFilterKey function
testParseKey("Parse simple field", "status", {
  fields: ["status"],
  operator: "eq",
  isOrFields: false,
});

testParseKey("Parse field with operator", "age_gte", {
  fields: ["age"],
  operator: "gte",
  isOrFields: false,
});

testParseKey("Parse contains operator", "name_contains", {
  fields: ["name"],
  operator: "contains",
  isOrFields: false,
});

testParseKey("Parse multi-field OR", "name__or__email_contains", {
  fields: ["name", "email"],
  operator: "contains",
  isOrFields: true,
});

testParseKey("Parse OR group", "[or]age_gte", {
  fields: ["age"],
  operator: "gte",
  isOrFields: false,
  orGroupName: "default",
});

testParseKey("Parse named OR group", "[or:age]age_gte", {
  fields: ["age"],
  operator: "gte",
  isOrFields: false,
  orGroupName: "age",
});

testParseKey("Parse multi-field with equals", "firstName__or__lastName", {
  fields: ["firstName", "lastName"],
  operator: "eq",
  isOrFields: true,
});

testParseKey("Parse isnull operator", "deletedAt_isnull", {
  fields: ["deletedAt"],
  operator: "isnull",
  isOrFields: false,
});

// Summary
console.log("\n=== Test Summary ===\n");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed === 0) {
  console.log("\n🎉 All tests passed!\n");
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed\n`);
  process.exit(1);
}

import { Query } from "../types/types";
import type { FilterOperator, ParsedFilterKey } from "../types/filter";

function getFromLocalStorage(key: string): string | null {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      const value = localStorage.getItem(key);
      return value !== null ? value : null;
    }
  } catch (err) {
    console.warn("Error accessing localStorage:", err);
  }
  return null;
}

function setToLocalStorage(key: string, value: string): void {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn("Error setting localStorage:", err);
  }
}

function mergeUserData(
  currentData: Record<string, any>,
  newData: Record<string, any>
): Record<string, any> {
  return {
    ...currentData,
    ...Object.fromEntries(
      Object.entries(newData).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    ),
  };
}

/**
 * Parse a filter key to extract fields, operator, and OR group information
 *
 * Examples:
 * - "status" -> { fields: ["status"], operator: "eq", isOrFields: false }
 * - "age_gte" -> { fields: ["age"], operator: "gte", isOrFields: false }
 * - "name__or__email_contains" -> { fields: ["name", "email"], operator: "contains", isOrFields: true }
 * - "[or]age_gte" -> { fields: ["age"], operator: "gte", isOrFields: false, orGroupName: "default" }
 * - "[or:group1]status" -> { fields: ["status"], operator: "eq", isOrFields: false, orGroupName: "group1" }
 */
function parseFilterKey(key: string): ParsedFilterKey {
  const operators: FilterOperator[] = [
    "ne",
    "gte",
    "lte",
    "gt",
    "lt",
    "contains",
    "startswith",
    "endswith",
    "in",
    "notin",
    "isnull",
  ];

  let workingKey = key;
  let orGroupName: string | undefined;

  // Check for OR group prefix: [or] or [or:groupname]
  const orGroupMatch = workingKey.match(/^\[or(?::([^\]]+))?\]/);
  if (orGroupMatch) {
    orGroupName = orGroupMatch[1] || "default";
    workingKey = workingKey.substring(orGroupMatch[0].length);
  }

  // Check for multi-field OR pattern: field1__or__field2__or__field3_operator
  const multiFieldParts = workingKey.split("__or__");

  if (multiFieldParts.length > 1) {
    // Last part might have the operator
    const lastPart = multiFieldParts[multiFieldParts.length - 1];
    let operator: FilterOperator = "eq";
    let lastField = lastPart;

    // Check if last part has an operator suffix
    for (const op of operators) {
      if (lastPart.endsWith(`_${op}`)) {
        operator = op;
        lastField = lastPart.substring(0, lastPart.length - op.length - 1);
        break;
      }
    }

    // Replace last part with the field name only
    multiFieldParts[multiFieldParts.length - 1] = lastField;

    return {
      fields: multiFieldParts,
      operator,
      isOrFields: true,
      orGroupName,
    };
  }

  // Single field with operator
  let operator: FilterOperator = "eq";
  let field = workingKey;

  for (const op of operators) {
    if (workingKey.endsWith(`_${op}`)) {
      operator = op;
      field = workingKey.substring(0, workingKey.length - op.length - 1);
      break;
    }
  }

  return {
    fields: [field],
    operator,
    isOrFields: false,
    orGroupName,
  };
}

/**
 * Build a comprehensive filter query string supporting all advanced query features
 *
 * Supports:
 * - Basic operators: eq, ne, gt, gte, lt, lte, contains, startswith, endswith, in, notin, isnull
 * - Multi-field OR: field1__or__field2_operator=value
 * - Simple OR conditions: [or]field_operator=value
 * - Named OR groups: [or:groupname]field_operator=value
 * - Relationships: populate parameter for fetching related documents
 * - Field selection: select parameter for choosing specific fields
 * - Sorting: sort and order parameters
 * - Pagination: limit and offset
 *
 * @param query - Query object with filters, limit, offset, sort, order, populate, and select
 * @returns URL-encoded query string
 *
 * @example
 * ```typescript
 * // Simple AND conditions
 * buildFilterQuery({
 *   filters: { status: 'active', age_gte: 18 }
 * })
 * // Returns: "status=active&age_gte=18&limit=100&offset=0"
 *
 * // Basic population
 * buildFilterQuery({
 *   filters: { status: 'active' },
 *   populate: 'author'
 * })
 * // Returns: "status=active&populate=author&limit=100&offset=0"
 *
 * // Multiple populations
 * buildFilterQuery({
 *   filters: { status: 'active' },
 *   populate: ['author', 'category']
 * })
 * // Returns: "status=active&populate=author&populate=category&limit=100&offset=0"
 *
 * // Nested population
 * buildFilterQuery({
 *   populate: 'post.author'
 * })
 * // Returns: "populate=post.author&limit=100&offset=0"
 *
 * // Filtering by relationship fields
 * buildFilterQuery({
 *   filters: { 'author.role': 'admin' },
 *   populate: 'author'
 * })
 * // Returns: "author.role=admin&populate=author&limit=100&offset=0"
 *
 * // Field selection
 * buildFilterQuery({
 *   select: ['name', 'email'],
 *   filters: { status: 'active' }
 * })
 * // Returns: "status=active&select=name&select=email&limit=100&offset=0"
 *
 * // Combined: filters, populate, select, sort
 * buildFilterQuery({
 *   filters: { status: 'active', 'author.role': 'admin' },
 *   populate: ['author', 'category'],
 *   select: ['title', 'content', 'author'],
 *   sort: 'createdAt',
 *   order: 'desc',
 *   limit: 50
 * })
 * ```
 */
function buildFilterQuery({
  filters = {},
  limit = 100,
  offset = 0,
  sort,
  order = "desc",
  populate,
  select,
}: Query = {}): string {
  const params = new URLSearchParams();

  // Process all filter parameters
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) {
      continue;
    }

    // Convert value to string
    const stringValue = String(value);

    // Add the filter parameter as-is to preserve the key format
    // The server will parse the operators and OR groups
    params.append(key, stringValue);
  }

  // Add populate parameters
  if (populate) {
    const populateArray = Array.isArray(populate) ? populate : [populate];
    populateArray.forEach((field) => {
      params.append("populate", field);
    });
  }

  // Add select parameters
  if (select) {
    const selectArray = Array.isArray(select) ? select : [select];
    selectArray.forEach((field) => {
      params.append("select", field);
    });
  }

  // Add sorting parameters
  if (sort) {
    params.set("sort", sort);
    params.set("order", order);
  }

  // Add pagination parameters
  params.set("limit", limit.toString());
  params.set("offset", offset.toString());

  return params.toString();
}

const BASEURL = "https://cocobase.pxxl.click";
export {
  getFromLocalStorage,
  setToLocalStorage,
  mergeUserData,
  BASEURL,
  buildFilterQuery,
  parseFilterKey,
};

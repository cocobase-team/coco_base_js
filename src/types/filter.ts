/**
 * Filter operators supported by the query system
 */
export type FilterOperator =
  | "eq" // Equals (default)
  | "ne" // Not equals
  | "gt" // Greater than
  | "gte" // Greater than or equal
  | "lt" // Less than
  | "lte" // Less than or equal
  | "contains" // Contains substring
  | "startswith" // Starts with
  | "endswith" // Ends with
  | "in" // In list (comma-separated)
  | "notin" // Not in list
  | "isnull"; // Is null/not null

/**
 * Represents a filter condition with field, operator, and value
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

/**
 * Represents an OR group of conditions
 */
export interface OrGroup {
  groupName: string;
  conditions: FilterCondition[];
}

/**
 * Parsed query structure with AND and OR conditions
 */
export interface ParsedQuery {
  andConditions: FilterCondition[];
  orConditions: FilterCondition[];
  namedOrGroups: OrGroup[];
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Result of parsing a filter key
 */
export interface ParsedFilterKey {
  fields: string[];
  operator: FilterOperator;
  isOrFields: boolean;
  orGroupName?: string;
}

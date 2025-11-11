/**
 * Configuration options for initializing the Cocobase client.
 */
export interface CocobaseConfig {
  /** Your Cocobase API key for authentication */
  apiKey?: string;
  /** Custom base URL (defaults to https://api.cocobase.buzz) */
  baseURL?: string;
  /** Your Cocobase project ID (required for cloud functions) */
  projectId?: string;
}

/**
 * Represents a collection in the database.
 */
export interface Collection {
  /** Collection name */
  name: string;
  /** Unique collection ID */
  id: string;
  /** ISO timestamp of when the collection was created */
  created_at: string;
}

/**
 * Response from initiating Google OAuth login.
 */
export interface GoogleLoginResponse {
  /** Google OAuth authorization URL to redirect the user to */
  url: string;
}

/**
 * Parameters for aggregate operations on documents.
 */
export interface AggregateParams {
  /** Field name to perform aggregation on */
  field: string;
  /** Optional query filters to apply before aggregation */
  query?: Query;
  /** Type of aggregation operation to perform */
  operation: "count" | "sum" | "avg" | "min" | "max";
}

/**
 * Results from an aggregate operation.
 */
export interface AggregateResults {
  /** Field that was aggregated */
  field: string;
  /** Operation that was performed */
  operation: string;
  /** Aggregated result value */
  result: number;
  /** Collection name */
  collection: string;
}

/**
 * Represents a document in a collection with metadata.
 *
 * @template T - The type of the document's data payload
 */
export interface Document<T> {
  /** User-defined document data */
  data: T;
  /** Unique document ID */
  id: string;
  /** ID of the collection this document belongs to */
  collection_id: string;
  /** ISO timestamp of when the document was created */
  created_at: string;
  /** Collection metadata */
  collection: Collection;
}
/**
 * Query parameters for filtering, sorting, and paginating documents.
 */
export interface Query {
  /** Filter conditions using field names and operators (e.g., { status: 'active', age_gte: 18 }) */
  filters?: Record<string, string | number | boolean>;
  /** Maximum number of documents to return (default: 100) */
  limit?: number;
  /** Number of documents to skip for pagination (default: 0) */
  offset?: number;
  /** Field name to sort by */
  sort?: string;
  /** Sort direction */
  order?: "asc" | "desc";
  /** Fields to populate (fetch referenced documents) - single field or array of fields */
  populate?: string | string[];
  /** Fields to include in the response - single field or array of fields */
  select?: string | string[];
}

/**
 * Response from authentication operations containing the access token.
 */
export interface TokenResponse {
  /** JWT access token for authenticated requests */
  access_token: string;
}

/**
 * Paginated list of users with metadata.
 */
export interface AppUserList {
  /** Array of user objects */
  data: AppUser[];
  /** Total number of users matching the query */
  total: number;
  /** Limit used for this query */
  limit: number;
  /** Offset used for this query */
  offset: number;
  /** Whether there are more users beyond this page */
  has_more: boolean;
}

/**
 * Represents a user in the authentication system.
 */
export interface AppUser {
  /** Unique user ID */
  id: string;
  /** User's email address */
  email: string;
  /** ISO timestamp of when the user account was created */
  created_at: string;
  /** Custom user data fields */
  data: Record<string, any>;
  /** Client/project ID the user belongs to */
  client_id: string;
  /** Array of role names assigned to the user */
  roles: string[];
}

/**
 * Represents an active WebSocket connection for real-time updates.
 */
export interface Connection {
  /** The underlying WebSocket instance */
  socket: WebSocket;
  /** Connection identifier name */
  name: string;
  /** Whether the connection has been closed */
  closed: boolean;
  /** Method to close the connection */
  close: () => void;
}

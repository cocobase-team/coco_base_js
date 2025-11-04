export interface CocobaseConfig {
  apiKey?: string;
  baseURL?: string;
  projectId?: string;
}

export interface Collection {
  name: string;
  id: string;
  created_at: string;
}

export interface Document<T> {
  data: T;
  id: string;
  collection_id: string;
  created_at: string;
  collection: Collection;
}
export interface Query {
  filters?: Record<string, string | number | boolean>;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  populate?: string | string[];
  select?: string | string[];
}
export interface TokenResponse {
  access_token: string;
}

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
  data: Record<string, any>;
  client_id: string;
  roles: string[];
}

export interface Connection {
  socket: WebSocket;
  name: string;
  closed: boolean;
  close: () => void;
}

import {
  CocobaseConfig,
  Document,
  TokenResponse,
  AppUser,
  Query,
  Connection,
} from "../types/types";
import {
  BASEURL,
  buildFilterQuery,
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
} from "../utils/utils";

import { closeConnection as closeCon } from "../utils/socket";
export class Cocobase {
  private baseURL: string;
  apiKey?: string;
  private token?: string;
  user?: AppUser;

  constructor(config: CocobaseConfig) {
    this.baseURL = BASEURL;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    useDataKey: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const data = useDataKey ? { data: body } : body;
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "x-api-key": `${this.apiKey}` } : {}),
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(data) } : {}),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorDetail;
        try {
          errorDetail = JSON.parse(errorText);
        } catch {
          errorDetail = errorText;
        }

        const errorMessage = {
          statusCode: res.status,
          url,
          method,
          error: errorDetail,
          suggestions: this.getErrorSuggestion(res.status, method),
        };

        throw new Error(
          `Request failed:\n${JSON.stringify(errorMessage, null, 2)}`
        );
      }

      return res.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Unexpected error during ${method} request to ${url}: ${error}`
      );
    }
  }

  private getErrorSuggestion(status: number, method: string): string {
    switch (status) {
      case 401:
        return "Check if your API key is valid and properly set";
      case 403:
        return "You don't have permission to perform this action. Verify your access rights";
      case 404:
        return "The requested resource was not found. Verify the path and ID are correct";
      case 405:
        return `The ${method} method is not allowed for this endpoint. Check the API documentation for supported methods`;
      case 429:
        return "You've exceeded the rate limit. Please wait before making more requests";
      default:
        return "Check the API documentation and verify your request format";
    }
  }

  // Fetch a single document
  async getDocument<T = any>(
    collection: string,
    docId: string
  ): Promise<Document<T>> {
    return this.request<Document<T>>(
      "GET",
      `/collections/${collection}/documents/${docId}`
    );
  }

  // Create a new document
  async createDocument<T = any>(
    collection: string,
    data: T
  ): Promise<Document<T>> {
    return this.request<Document<T>>(
      "POST",
      `/collections/documents?collection=${collection}`,
      data
    );
  }

  // Update a document
  async updateDocument<T = any>(
    collection: string,
    docId: string,
    data: Partial<T>
  ): Promise<Document<T>> {
    return this.request<Document<T>>(
      "PATCH",
      `/collections/${collection}/documents/${docId}`,
      data
    );
  }

  // Delete a document
  async deleteDocument(
    collection: string,
    docId: string
  ): Promise<{ success: boolean }> {
    return this.request(
      "DELETE",
      `/collections/${collection}/documents/${docId}`
    );
  }

  // List documents
  async listDocuments<T = any>(
    collection: string,
    query?: Query
  ): Promise<Document<T>[]> {
    const query_str = buildFilterQuery(query);

    return this.request<Document<T>[]>(
      "GET",
      `/collections/${collection}/documents${query_str ? `?${query_str}` : ""}`
    );
  }

  // authentication features
  async initAuth() {
    const token = getFromLocalStorage("cocobase-token");
    const user = getFromLocalStorage("cocobase-user");
    if (token) {
      this.token = token;
      if (user) {
        this.user = JSON.parse(user) as AppUser;
      } else {
        this.user = undefined;
        this.getCurrentUser();
      }
    } else {
      this.token = undefined;
    }
  }

  setToken(token: string) {
    this.token = token;
    setToLocalStorage("cocobase-token", token);
  }

  async login(email: string, password: string) {
    const response = this.request<TokenResponse>(
      `POST`,
      `/auth-collections/login`,
      { email, password },
      false // Do not use data key for auth endpoints
    );
    this.token = (await response).access_token;
    this.setToken(this.token);
    this.user = await this.getCurrentUser();
  }

  async register(email: string, password: string, data?: Record<string, any>) {
    const response = this.request<TokenResponse>(
      `POST`,
      `/auth-collections/signup`,
      { email, password, data },
      false // Do not use data key for auth endpoints
    );
    this.token = (await response).access_token;
    this.setToken(this.token);
    await this.getCurrentUser();
  }

  logout() {
    this.token = undefined;
  }
  isAuthenticated(): boolean {
    return !!this.token;
  }
  async getCurrentUser(): Promise<AppUser> {
    if (!this.token) {
      throw new Error("User is not authenticated");
    }
    const user = await this.request("GET", `/auth-collections/user`);
    if (!user) {
      throw new Error("Failed to fetch current user");
    }
    this.user = user as AppUser;
    setToLocalStorage("cocobase-user", JSON.stringify(user));
    return user as AppUser;
  }

  async updateUser(
    data?: Record<string, any> | null,
    email?: string | null,
    password?: string | null
  ): Promise<AppUser> {
    if (!this.token) {
      throw new Error("User is not authenticated");
    }

    // Build request body by excluding null or undefined values
    const body: Record<string, any> = {};
    if (data != null) body.data = mergeUserData(this.user?.data || {}, data);
    if (email != null) body.email = email;
    if (password != null) body.password = password;

    const user = await this.request(
      "PATCH",
      "/auth-collections/user",
      body,
      false
    );

    this.user = user as AppUser;
    setToLocalStorage("cocobase-user", JSON.stringify(user));
    return user as AppUser;
  }

  watchCollection(
    collection: string,
    callback: (event: { event: string; data: Document<any> }) => void,
    connectionName?: string,
    onOpen: () => void = () => { },
    onError: () => void = () => { }
  ): Connection {
    const socket = new WebSocket(
      `${this.baseURL.replace("http", "ws")}/realtime/collections/${collection}`
    );
    socket.onerror = onError;
    socket.onopen = () => {
      console.log(
        `WebSocket connection established for collection: ${collection}`
      );
      socket.send(JSON.stringify({ api_key: this.apiKey }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback({
        event: data.event,
        data: data.data as Document<any>,
      });
    };
    socket.onopen = () => {
      onOpen();
    };
    return {
      socket,
      name: connectionName || `watch-${collection}`,
      closed: false,
      close: () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      },
    };
  }
  hasRole(role: string): boolean {
    if (!this.user) {
      throw new Error("User is not authenticated");
    }
    return this.user.roles.includes(role);
  }
  closeConnection(name: string) {
    closeCon(name);
  }
}

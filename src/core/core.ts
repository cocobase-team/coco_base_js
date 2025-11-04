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
import { CloudFunction } from "./functions";

export class Cocobase {
  private baseURL: string;
  apiKey?: string;
  private token?: string;
  projectId?: string;
  user?: AppUser;
  functions: CloudFunction;

  constructor(config: CocobaseConfig) {
    this.baseURL = config.baseURL ?? BASEURL;
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;

    this.functions = new CloudFunction(
      config.projectId || "project id required",
      () => this.token
    );
  }

  getToken(): string | undefined {
    return this.token;
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

  /**
   * Create a document with file uploads
   *
   * @param collection - Collection name
   * @param data - Document data (JSON object)
   * @param files - Object mapping field names to File objects
   *
   * @example
   * ```typescript
   * // Upload avatar and cover photo
   * await db.createDocumentWithFiles('users',
   *   { name: 'John Doe', email: 'john@example.com' },
   *   {
   *     avatar: avatarFile,
   *     cover_photo: coverFile
   *   }
   * );
   *
   * // Upload product with gallery
   * await db.createDocumentWithFiles('products',
   *   { name: 'Laptop', price: 1299 },
   *   {
   *     main_image: mainImageFile,
   *     gallery: [img1, img2, img3] // Array for multiple files
   *   }
   * );
   * ```
   */
  async createDocumentWithFiles<T = any>(
    collection: string,
    data: T,
    files: Record<string, File | File[]>
  ): Promise<Document<T>> {
    const formData = new FormData();

    // Add JSON data
    formData.append("data", JSON.stringify(data));

    // Add files with their field names
    for (const [fieldName, fileOrFiles] of Object.entries(files)) {
      if (Array.isArray(fileOrFiles)) {
        // Multiple files with same field name creates an array
        fileOrFiles.forEach((file) => {
          formData.append(fieldName, file);
        });
      } else {
        // Single file
        formData.append(fieldName, fileOrFiles);
      }
    }

    const url = `${this.baseURL}/collections/documents?collection=${collection}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(this.apiKey ? { "x-api-key": `${this.apiKey}` } : {}),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`File upload failed: ${errorText}`);
    }

    return res.json() as Promise<Document<T>>;
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

  /**
   * Update a document with file uploads
   *
   * @param collection - Collection name
   * @param docId - Document ID
   * @param data - Partial document data to update (optional)
   * @param files - Object mapping field names to File objects (optional)
   *
   * @example
   * ```typescript
   * // Update only avatar
   * await db.updateDocumentWithFiles('users', 'user-123',
   *   undefined,
   *   { avatar: newAvatarFile }
   * );
   *
   * // Update data and files
   * await db.updateDocumentWithFiles('users', 'user-123',
   *   { bio: 'Updated bio' },
   *   { avatar: newAvatarFile, cover_photo: newCoverFile }
   * );
   * ```
   */
  async updateDocumentWithFiles<T = any>(
    collection: string,
    docId: string,
    data?: Partial<T>,
    files?: Record<string, File | File[]>
  ): Promise<Document<T>> {
    const formData = new FormData();

    // Add JSON data if provided
    if (data) {
      formData.append("data", JSON.stringify(data));
    }

    // Add files with their field names if provided
    if (files) {
      for (const [fieldName, fileOrFiles] of Object.entries(files)) {
        if (Array.isArray(fileOrFiles)) {
          fileOrFiles.forEach((file) => {
            formData.append(fieldName, file);
          });
        } else {
          formData.append(fieldName, fileOrFiles);
        }
      }
    }

    const url = `${this.baseURL}/collections/${collection}/documents/${docId}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        ...(this.apiKey ? { "x-api-key": `${this.apiKey}` } : {}),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`File upload failed: ${errorText}`);
    }

    return res.json() as Promise<Document<T>>;
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

  /**
   * Register a new user with file uploads (avatar, cover photo, etc.)
   *
   * @param email - User email
   * @param password - User password
   * @param data - Additional user data (optional)
   * @param files - Object mapping field names to File objects (optional)
   *
   * @example
   * ```typescript
   * // Register with avatar
   * await db.registerWithFiles(
   *   'john@example.com',
   *   'password123',
   *   { username: 'johndoe', full_name: 'John Doe' },
   *   { avatar: avatarFile }
   * );
   *
   * // Register with avatar and cover photo
   * await db.registerWithFiles(
   *   'john@example.com',
   *   'password123',
   *   { username: 'johndoe' },
   *   { avatar: avatarFile, cover_photo: coverFile }
   * );
   * ```
   */
  async registerWithFiles(
    email: string,
    password: string,
    data?: Record<string, any>,
    files?: Record<string, File | File[]>
  ): Promise<AppUser> {
    const formData = new FormData();

    // Add JSON data
    formData.append("data", JSON.stringify({ email, password, data }));

    // Add files with their field names if provided
    if (files) {
      for (const [fieldName, fileOrFiles] of Object.entries(files)) {
        if (Array.isArray(fileOrFiles)) {
          fileOrFiles.forEach((file) => {
            formData.append(fieldName, file);
          });
        } else {
          formData.append(fieldName, fileOrFiles);
        }
      }
    }

    const url = `${this.baseURL}/auth-collections/signup`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(this.apiKey ? { "x-api-key": `${this.apiKey}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Registration failed: ${errorText}`);
    }

    const response = (await res.json()) as TokenResponse & { user: AppUser };
    this.token = response.access_token;
    this.setToken(this.token);
    this.user = response.user;
    setToLocalStorage("cocobase-user", JSON.stringify(response.user));

    return response.user;
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

  /**
   * Update current user with file uploads
   *
   * @param data - User data to update (optional)
   * @param email - New email (optional)
   * @param password - New password (optional)
   * @param files - Object mapping field names to File objects (optional)
   *
   * @example
   * ```typescript
   * // Update only avatar
   * await db.updateUserWithFiles(
   *   undefined, undefined, undefined,
   *   { avatar: newAvatarFile }
   * );
   *
   * // Update bio and avatar
   * await db.updateUserWithFiles(
   *   { bio: 'Updated bio' },
   *   undefined, undefined,
   *   { avatar: newAvatarFile }
   * );
   *
   * // Update multiple fields and files
   * await db.updateUserWithFiles(
   *   { username: 'newusername', bio: 'New bio' },
   *   'newemail@example.com',
   *   undefined,
   *   { avatar: newAvatar, cover_photo: newCover }
   * );
   * ```
   */
  async updateUserWithFiles(
    data?: Record<string, any> | null,
    email?: string | null,
    password?: string | null,
    files?: Record<string, File | File[]>
  ): Promise<AppUser> {
    if (!this.token) {
      throw new Error("User is not authenticated");
    }

    const formData = new FormData();

    // Build request body by excluding null or undefined values
    const body: Record<string, any> = {};
    if (data != null) body.data = mergeUserData(this.user?.data || {}, data);
    if (email != null) body.email = email;
    if (password != null) body.password = password;

    // Add JSON data if there's any
    if (Object.keys(body).length > 0) {
      formData.append("data", JSON.stringify(body));
    }

    // Add files with their field names if provided
    if (files) {
      for (const [fieldName, fileOrFiles] of Object.entries(files)) {
        if (Array.isArray(fileOrFiles)) {
          fileOrFiles.forEach((file) => {
            formData.append(fieldName, file);
          });
        } else {
          formData.append(fieldName, fileOrFiles);
        }
      }
    }

    const url = `${this.baseURL}/auth-collections/user`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`User update failed: ${errorText}`);
    }

    const user = (await res.json()) as AppUser;
    this.user = user;
    setToLocalStorage("cocobase-user", JSON.stringify(user));

    return user;
  }

  watchCollection(
    collection: string,
    callback: (event: { event: string; data: Document<any> }) => void,
    connectionName?: string,
    onOpen: () => void = () => {},
    onError: () => void = () => {}
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

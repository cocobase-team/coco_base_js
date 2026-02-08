import {
  CocobaseConfig,
  Document,
  TokenResponse,
  AppUser,
  Query,
  AppUserList,
  GoogleLoginResponse,
  AggregateResults,
  AggregateParams,
  LoginResult,
} from "../types/types.js";
import {
  LoginParams,
  RegisterParams,
  RegisterWithFilesParams,
  GoogleLoginParams,
} from "../types/params.js";
import {
  BASEURL,
  buildFilterQuery,
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
} from "../utils/utils.js";
import { CloudFunction } from "./functions.js";
import AuthHandler from "./auth.js";
import {
  CollectionWatcher,
  ProjectBroadcast,
  RoomChat,
  listRooms,
} from "../realtime/websockets.js";
import { GameClient, listGameRooms, RoomListResponse } from "../realtime/multiplayer.js";

/**
 * Main Cocobase client for interacting with the Cocobase backend API.
 *
 * Provides methods for:
 * - Document CRUD operations (Create, Read, Update, Delete)
 * - User authentication and management
 * - File uploads
 * - Real-time data synchronization
 * - Cloud functions execution
 * - Batch operations
 * - Advanced querying and aggregations
 *
 * @example
 * ```typescript
 * // Initialize the client
 * const db = new Cocobase({
 *   apiKey: 'your-api-key',
 *   projectId: 'your-project-id'
 * });
 *
 * // Create a document
 * await db.createDocument('users', { name: 'John Doe' });
 *
 * // Query documents
 * const users = await db.listDocuments('users', {
 *   filters: { status: 'active' },
 *   limit: 10
 * });
 * ```
 */
export class Cocobase {
  private baseURL: string;
  apiKey?: string;
  private token?: string;
  projectId?: string;
  functions: CloudFunction;
  auth: AuthHandler;
  /**
   * Realtime helper factories. Use `db.realtime.collection(...)`, `db.realtime.broadcast(...)`, `db.realtime.room(...)`, `db.realtime.game(...)`, or `db.realtime.listRooms()`.
   */
  realtime: {
    collection: (
      collectionName: string,
      filters?: Record<string, any>
    ) => CollectionWatcher;
    broadcast: (userId?: string, userName?: string) => ProjectBroadcast;
    room: (roomId: string, userId?: string, userName?: string) => RoomChat;
    listRooms: () => Promise<any>;
    /**
     * Create a multiplayer game client for WebSocket-based games.
     *
     * @param functionName - Name of the WebSocket cloud function
     * @returns GameClient instance
     *
     * @example
     * ```typescript
     * const game = db.realtime.game('my-game');
     *
     * game.on('connected', (data) => {
     *   console.log('Connected! Player ID:', data.your_id);
     * });
     *
     * game.on('player_joined', (data) => {
     *   console.log('Player joined:', data.player_id);
     * });
     *
     * game.on('state', (data) => {
     *   renderPlayers(data.players);
     * });
     *
     * await game.connect({ roomId: 'game-room-1' });
     * game.send({ action: 'move', x: 100, y: 200 });
     * ```
     */
    game: (functionName: string) => GameClient;
    /**
     * List available game rooms for discovery.
     *
     * @param publicOnly - Only list public rooms (default: true)
     * @returns Promise resolving to room list
     *
     * @example
     * ```typescript
     * const { rooms, total } = await db.realtime.listGameRooms();
     * rooms.forEach(room => {
     *   console.log(`${room.room_id}: ${room.player_count} players`);
     * });
     * ```
     */
    listGameRooms: (publicOnly?: boolean) => Promise<RoomListResponse>;
  };
  /**
   * Creates a new Cocobase client instance.
   *
   * @param config - Configuration object for the client
   * @param config.apiKey - Your Cocobase API key (required for most operations)
   * @param config.projectId - Your Cocobase project ID (required for cloud functions)
   * @param config.baseURL - Optional custom base URL (defaults to https://api.cocobase.buzz)
   *
   * @example
   * ```typescript
   * const db = new Cocobase({
   *   apiKey: 'your-api-key',
   *   projectId: 'your-project-id'
   * });
   * ```
   */
  constructor(config: CocobaseConfig) {
    this.baseURL = config.baseURL ?? BASEURL;
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.auth = new AuthHandler(config);
    this.functions = new CloudFunction(
      config.projectId || "project id required",
      () => this.auth.getToken()
    );
    // realtime factories bound to this client configuration
    this.realtime = {
      collection: (collectionName: string, filters?: Record<string, any>) =>
        new CollectionWatcher(collectionName, this.apiKey || "", filters),
      broadcast: (userId?: string, userName?: string) =>
        new ProjectBroadcast(this.apiKey || "", userId, userName),
      room: (roomId: string, userId?: string, userName?: string) =>
        new RoomChat(roomId, this.apiKey || "", userId, userName),
      listRooms: async () => listRooms(this.apiKey || ""),
      game: (functionName: string) =>
        new GameClient(
          this.projectId || "",
          functionName,
          this.auth.getToken()
        ),
      listGameRooms: (publicOnly = true) =>
        listGameRooms(this.projectId || "", this.apiKey, publicOnly),
    };
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
          ...(this.auth.getToken()
            ? { Authorization: `Bearer ${this.auth.getToken()}` }
            : {}),
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

  /**
   * Retrieves a single document by ID from a collection.
   *
   * @template T - The type of the document data
   * @param collection - Name of the collection
   * @param docId - Unique ID of the document
   * @returns Promise resolving to the document with metadata
   *
   * @example
   * ```typescript
   * const user = await db.getDocument('users', 'user-123');
   * console.log(user.data.name);
   * ```
   */
  async getDocument<T = any>(
    collection: string,
    docId: string
  ): Promise<Document<T>> {
    return this.request<Document<T>>(
      "GET",
      `/collections/${collection}/documents/${docId}`
    );
  }

  /**
   * Creates a new document in a collection.
   *
   * @template T - The type of the document data
   * @param collection - Name of the collection
   * @param data - Document data to store
   * @returns Promise resolving to the created document with metadata
   *
   * @example
   * ```typescript
   * const newUser = await db.createDocument('users', {
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   age: 30
   * });
   * ```
   */
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
        ...(this.auth.getToken()
          ? { Authorization: `Bearer ${this.auth.getToken()}` }
          : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`File upload failed: ${errorText}`);
    }

    return res.json() as Promise<Document<T>>;
  }

  /**
   * Updates an existing document in a collection.
   *
   * @template T - The type of the document data
   * @param collection - Name of the collection
   * @param docId - Unique ID of the document to update
   * @param data - Partial document data to update (only specified fields are updated)
   * @returns Promise resolving to the updated document with metadata
   *
   * @example
   * ```typescript
   * await db.updateDocument('users', 'user-123', {
   *   age: 31,
   *   status: 'active'
   * });
   * ```
   */
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
        ...(this.auth.getToken()
          ? { Authorization: `Bearer ${this.auth.getToken()}` }
          : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`File upload failed: ${errorText}`);
    }

    return res.json() as Promise<Document<T>>;
  }

  /**
   * Deletes a document from a collection.
   *
   * @param collection - Name of the collection
   * @param docId - Unique ID of the document to delete
   * @returns Promise resolving to a success status object
   *
   * @example
   * ```typescript
   * await db.deleteDocument('users', 'user-123');
   * ```
   */
  async deleteDocument(
    collection: string,
    docId: string
  ): Promise<{ success: boolean }> {
    return this.request(
      "DELETE",
      `/collections/${collection}/documents/${docId}`
    );
  }

  /**
   * Lists documents from a collection with optional filtering and pagination.
   *
   * @template T - The type of the document data
   * @param collection - Name of the collection
   * @param query - Optional query parameters for filtering, sorting, and pagination
   * @returns Promise resolving to an array of documents
   *
   * @example
   * ```typescript
   * // Simple query
   * const users = await db.listDocuments('users', {
   *   filters: { status: 'active' },
   *   limit: 10
   * });
   *
   * // Advanced query with sorting
   * const posts = await db.listDocuments('posts', {
   *   filters: { published: true },
   *   sort: 'createdAt',
   *   order: 'desc',
   *   limit: 20
   * });
   * ```
   */
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

  /**
   * Initializes authentication by restoring the session from local storage.
   * Call this method when your application loads to restore user sessions.
   *
   * @deprecated Use `db.auth.initAuth()` instead. This method will be removed in a future version.
   * @example
   * ```typescript
   * await db.initAuth();
   * if (db.isAuthenticated()) {
   *   console.log('User is logged in:', db.user);
   * }
   * ```
   */
  async initAuth() {
    return this.auth.initAuth();
  }

  /**
   * Authenticates a user with email and password.
   *
   * @deprecated Use `db.auth.login()` instead. This method will be removed in a future version.
   * @param params - Login parameters
   * @returns Promise that resolves when login is complete
   *
   * @example
   * ```typescript
   * await db.login({ email: 'user@example.com', password: 'password123' });
   * console.log('Logged in as:', db.user.email);
   * ```
   */
  async login(params: LoginParams) {
    return this.auth.login(params);
  }

  /**
   * Registers a new user with email, password, and optional additional data.
   *
   * @deprecated Use `db.auth.register()` instead. This method will be removed in a future version.
   * @param params - Registration parameters
   * @returns Promise that resolves when registration is complete
   *
   * @example
   * ```typescript
   * await db.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe', fullName: 'John Doe' }
   * });
   * ```
   */
  async register(params: RegisterParams) {
    return this.auth.register(params);
  }

  /**
   * Authenticates a user using Google Sign-In with ID token.
   *
   * @deprecated Use `db.auth.loginWithGoogle()` instead. This method will be removed in a future version.
   * @param params - Google login parameters
   * @returns Promise resolving to the authenticated user object
   *
   * @example
   * ```typescript
   * // New recommended way
   * const user = await db.auth.loginWithGoogle({ idToken, platform: 'web' });
   *
   * // Old way (deprecated)
   * const user = await db.loginWithGoogle({ idToken, platform: 'web' });
   * ```
   */
  async loginWithGoogle(params: GoogleLoginParams): Promise<AppUser> {
    return this.auth.loginWithGoogle(params);
  }

  /**
   * Register a new user with file uploads (avatar, cover photo, etc.)
   *
   * @deprecated Use `db.auth.registerWithFiles()` instead. This method will be removed in a future version.
   * @param params - Registration parameters with files
   *
   * @example
   * ```typescript
   * // Register with avatar
   * await db.registerWithFiles({
   *   email: 'john@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe', full_name: 'John Doe' },
   *   files: { avatar: avatarFile }
   * });
   *
   * // Register with avatar and cover photo
   * await db.registerWithFiles({
   *   email: 'john@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe' },
   *   files: { avatar: avatarFile, cover_photo: coverFile }
   * });
   * ```
   */
  async registerWithFiles(params: RegisterWithFilesParams): Promise<LoginResult> {
    return this.auth.registerWithFiles(params);
  }

  /**
   * Logs out the current user by clearing the token and user data.
   *
   * @deprecated Use `db.auth.logout()` instead. This method will be removed in a future version.
   *
   * @example
   * ```typescript
   * db.logout();
   * console.log('User logged out');
   * ```
   */
  logout() {
    this.auth.logout();
  }

  /**
   * Checks if a user is currently authenticated.
   *
   * @deprecated Use `db.auth.isAuthenticated()` instead. This method will be removed in a future version.
   * @returns True if user is authenticated, false otherwise
   *
   * @example
   * ```typescript
   * if (db.isAuthenticated()) {
   *   console.log('User is logged in');
   * }
   * ```
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  /**
   * @deprecated Use `db.auth.getCurrentUser()` instead. This method will be removed in a future version.
   */
  async getCurrentUser(): Promise<AppUser> {
    return this.auth.getCurrentUser();
  }


  // BATCH OPERATIONS
  async deleteDocuments(
    collection: string,
    docIds: string[]
  ): Promise<{ status: string; message: string; count: number }> {
    return this.request<{ status: string; message: string; count: number }>(
      "POST",
      `/collections/${collection}/batch/documents/delete`,
      { document_ids: docIds },
      false
    );
  }

  async createDocuments<T = any>(
    collection: string,
    documents: T[]
  ): Promise<Document<T>[]> {
    return this.request<Document<T>[]>(
      "POST",
      `/collections/${collection}/batch/documents/create`,
      { documents },
      false
    );
  }
  /**
   * Batch update documents
   *
   * @param collection - Collection name
   * @param updates - Object mapping document IDs to partial update objects.
   *   Example: { "docId1": { fieldA: "value" }, "docId2": { fieldB: 2 } }
   */
  async updateDocuments<T = any>(
    collection: string,
    updates: Record<string, Partial<T>>
  ): Promise<Document<T>[]> {
    return this.request<Document<T>[]>(
      "POST",
      `/collections/${collection}/batch/documents/update`,
      { updates },
      false
    );
  }
  /**
   * Count documents matching filters without returning the documents.
   *
   * Example:
   *  await db.countDocuments('users', { status: 'active', age_gte: 18 })
   *  // returns { count: 42 }
   */
  async countDocuments(
    collection: string,
    query?: Query
  ): Promise<{ count: number }> {
    const query_str = buildFilterQuery(query);
    return this.request<{ count: number }>(
      "GET",
      `/collections/${collection}/query/documents/count${
        query_str ? `?${query_str}` : ""
      }`
    );
  }

  async aggregateDocuments(
    collection: string,
    params: AggregateParams
  ): Promise<AggregateResults> {
    const query_str = buildFilterQuery(params.query);
    return (await this.request<any>(
      "GET",
      `/collections/${collection}/query/documents/aggregate?field=${
        params.field
      }&operation=${params.operation}&${query_str ? `${query_str}` : ""}`
    )) as AggregateResults;
  }
}

import {
  CocobaseConfig,
  TokenResponse,
  AppUser,
  AppUserList,
  Query,
  GoogleLoginResponse,
  AuthCallbacks,
} from "../types/types.js";
import {
  buildFilterQuery,
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
} from "../utils/utils.js";

/**
 * Authentication handler for Cocobase client.
 *
 * Provides methods for user authentication, registration, and user management.
 * This class handles all authentication-related operations and maintains user session state.
 *
 * @example
 * ```typescript
 * const db = new Cocobase({ apiKey: 'your-key' });
 * await db.auth.login('user@example.com', 'password');
 * ```
 */
export class AuthHandler {
  private baseURL: string;
  private apiKey?: string;
  private token?: string;
  private user?: AppUser;
  private callbacks: AuthCallbacks = {};

  /**
   * Creates a new AuthHandler instance.
   *
   * @param config - Cocobase configuration
   */
  constructor(config: CocobaseConfig) {
    this.baseURL = config.baseURL ?? "https://api.cocobase.buzz";
    this.apiKey = config.apiKey;
  }

  /**
   * Register callbacks for authentication events.
   * This allows your application to respond to auth state changes in a framework-agnostic way.
   *
   * @param callbacks - Object containing callback functions for various auth events
   *
   * @example
   * ```typescript
   * // React example
   * db.auth.onAuthEvent({
   *   onLogin: (user, token) => {
   *     setUser(user);
   *     setIsAuthenticated(true);
   *   },
   *   onLogout: () => {
   *     setUser(null);
   *     setIsAuthenticated(false);
   *   },
   *   onUserUpdate: (user) => {
   *     setUser(user);
   *   }
   * });
   *
   * // Vue example
   * db.auth.onAuthEvent({
   *   onLogin: (user, token) => {
   *     store.commit('setUser', user);
   *     store.commit('setToken', token);
   *   },
   *   onLogout: () => {
   *     store.commit('clearAuth');
   *   }
   * });
   *
   * // Svelte example
   * db.auth.onAuthEvent({
   *   onLogin: (user, token) => {
   *     userStore.set(user);
   *     tokenStore.set(token);
   *   },
   *   onLogout: () => {
   *     userStore.set(null);
   *     tokenStore.set(null);
   *   }
   * });
   * ```
   */
  onAuthEvent(callbacks: AuthCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Remove all registered callbacks.
   */
  clearAuthCallbacks(): void {
    this.callbacks = {};
  }

  /**
   * Gets the current authentication token.
   *
   * @returns The current JWT token, or undefined if not authenticated
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Sets the authentication token and stores it in local storage.
   
   * @param token - JWT authentication token
   */
  setToken(token: string) {
    this.token = token;
    setToLocalStorage("cocobase-token", token);
    this.callbacks.onTokenChange?.(token);
  }

  /**
   * Updates the current user object.
   *
   * @param user - User object to set
   */
  setUser(user: AppUser) {
    this.user = user;
    setToLocalStorage("cocobase-user", JSON.stringify(user));
  }

  /**
   * Gets the current user object.
   *
   * @returns The current user, or undefined if not authenticated
   */
  getUser(): AppUser | undefined {
    return this.user;
  }

  /**
   * Makes an authenticated request to the API.
   *
   * @private
   * @param method - HTTP method
   * @param path - API endpoint path
   * @param body - Request body
   * @param useDataKey - Whether to wrap body in data key
   * @returns Promise resolving to response data
   */
  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    useDataKey: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const data = useDataKey ? { data: body } : body;
    console.log("request made")
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

  /**
   * Provides error suggestions based on HTTP status codes.
   *
   * @private
   * @param status - HTTP status code
   * @param method - HTTP method used
   * @returns Suggestion string
   */
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
   * Initializes authentication by restoring the session from local storage.
   * Call this method when your application loads to restore user sessions.
   *
   * @example
   * ```typescript
   * await db.auth.initAuth();
   * if (db.auth.isAuthenticated()) {
   *   console.log('User is logged in:', db.auth.getUser());
   * }
   * ```
   */
  async initAuth() {
    const token = getFromLocalStorage("cocobase-token");
    const user = getFromLocalStorage("cocobase-user");
    if (token) {
      this.token = token;
      if (user) {
        this.user = JSON.parse(user) as AppUser;
      } else {
        this.user = undefined;
        await this.getCurrentUser();
      }
    } else {
      this.token = undefined;
    }

    // Trigger auth state change callback
    this.callbacks.onAuthStateChange?.(this.user, this.token);
  }

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves when login is complete
   *
   * @example
   * ```typescript
   * await db.auth.login('user@example.com', 'password123');
   * console.log('Logged in as:', db.auth.getUser()?.email);
   * ```
   */
  async login(email: string, password: string) {
    const response = await this.request<TokenResponse>(
      "POST",
      `/auth-collections/login`,
      { email, password },
      false // Do not use data key for auth endpoints
    );
    this.token = response.access_token;
    this.setToken(this.token);
    if (!response.user) {
      await this.getCurrentUser();
    } else {
      this.setUser(response.user);
    }

    // Trigger login callback
    if (this.user) {
      this.callbacks.onLogin?.(this.user, this.token);
    }
  }

  /**
   * Registers a new user with email, password, and optional additional data.
   *
   * @param email - User's email address
   * @param password - User's password
   * @param data - Optional additional user data
   * @returns Promise that resolves when registration is complete
   *
   * @example
   * ```typescript
   * await db.auth.register('user@example.com', 'password123', {
   *   username: 'johndoe',
   *   fullName: 'John Doe'
   * });
   * ```
   */
  async register(email: string, password: string, data?: Record<string, any>) {
    const response = await this.request<TokenResponse>(
      "POST",
      `/auth-collections/signup`,
      { email, password, data },
      false // Do not use data key for auth endpoints
    );
    this.token = response.access_token;
    this.setToken(this.token);
    if (!response.user) {
      await this.getCurrentUser();
    }else{
      this.setUser(response.user)
    }

    // Trigger register callback
    if (this.user) {
      this.callbacks.onRegister?.(this.user, this.token);
    }
  }

  /**
   * Authenticates a user using Google Sign-In with ID token.
   *
   * This method verifies the Google ID token and either creates a new user
   * or logs in an existing user who registered with Google OAuth.
   *
   * @param idToken - Google ID token obtained from Google Sign-In
   * @param platform - Optional platform identifier ('web', 'mobile', 'ios', 'android')
   * @returns Promise resolving to the authenticated user object
   *
   * @throws {Error} If Google Sign-In is not enabled in project settings
   * @throws {Error} If the Google ID token is invalid or expired
   * @throws {Error} If email is already registered with password authentication
   * @throws {Error} If email is already registered with Apple Sign-In
   *
   * @example
   * ```typescript
   * // Web - Using Google Identity Services
   * google.accounts.id.initialize({
   *   client_id: 'YOUR_GOOGLE_CLIENT_ID',
   *   callback: async (response) => {
   *     const user = await db.auth.loginWithGoogle(response.credential, 'web');
   *     console.log('Logged in:', user.email);
   *   }
   * });
   *
   * // Mobile - After getting ID token from Google Sign-In SDK
   * const user = await db.auth.loginWithGoogle(idToken, 'mobile');
   * ```
   */
  async loginWithGoogle(
    idToken: string,
    platform?: "web" | "mobile" | "ios" | "android"
  ): Promise<AppUser> {
    const response = await this.request<{
      access_token: string;
      user: AppUser;
    }>(
      "POST",
      "/auth-collections/google-verify",
      { id_token: idToken, platform },
      false
    );

    this.token = response.access_token;
    this.setToken(response.access_token);
    this.setUser(response.user);

    // Trigger login callback
    this.callbacks.onLogin?.(response.user, response.access_token);

    return response.user;
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
   * await db.auth.registerWithFiles(
   *   'john@example.com',
   *   'password123',
   *   { username: 'johndoe', full_name: 'John Doe' },
   *   { avatar: avatarFile }
   * );
   *
   * // Register with avatar and cover photo
   * await db.auth.registerWithFiles(
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
    this.setToken(response.access_token);
    this.setUser(response.user);

    // Trigger register callback
    this.callbacks.onRegister?.(response.user, response.access_token);

    return response.user;
  }

  /**
   * Logs out the current user by clearing the token and user data.
   *
   * @example
   * ```typescript
   * db.auth.logout();
   * console.log('User logged out');
   * ```
   */
  logout() {
    this.token = undefined;
    this.user = undefined;
    // Clear local storage
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("cocobase-token");
      localStorage.removeItem("cocobase-user");
    }

    // Trigger logout callback
    this.callbacks.onLogout?.();
    // Also trigger token change callback with undefined
    this.callbacks.onTokenChange?.(undefined);
  }

  /**
   * Checks if a user is currently authenticated.
   *
   * @returns True if user is authenticated, false otherwise
   *
   * @example
   * ```typescript
   * if (db.auth.isAuthenticated()) {
   *   console.log('User is logged in');
   * }
   * ```
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Fetches the current authenticated user's data from the server.
   *
   * @returns Promise resolving to the current user object
   *
   * @example
   * ```typescript
   * const user = await db.auth.getCurrentUser();
   * console.log('Current user:', user.email);
   * ```
   */
  async getCurrentUser(): Promise<AppUser> {
    if (!this.token) {
      throw new Error("User is not authenticated");
    }
    const user = await this.request("GET", `/auth-collections/user`);
    if (!user) {
      throw new Error("Failed to fetch current user");
    }
    this.user = user as AppUser;
    this.setUser(user as AppUser);
    return user as AppUser;
  }

  /**
   * Updates the current user's profile data.
   *
   * @param data - User data to update (optional)
   * @param email - New email address (optional)
   * @param password - New password (optional)
   * @returns Promise resolving to the updated user object
   *
   * @example
   * ```typescript
   * await db.auth.updateUser({
   *   bio: 'Updated bio',
   *   website: 'https://example.com'
   * });
   * ```
   */
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
    this.setUser(user as AppUser);

    // Trigger user update callback
    this.callbacks.onUserUpdate?.(user as AppUser);

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
   * await db.auth.updateUserWithFiles(
   *   undefined, undefined, undefined,
   *   { avatar: newAvatarFile }
   * );
   *
   * // Update bio and avatar
   * await db.auth.updateUserWithFiles(
   *   { bio: 'Updated bio' },
   *   undefined, undefined,
   *   { avatar: newAvatarFile }
   * );
   *
   * // Update multiple fields and files
   * await db.auth.updateUserWithFiles(
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
    this.setUser(user);

    // Trigger user update callback
    this.callbacks.onUserUpdate?.(user);

    return user;
  }

  /**
   * Checks if the current user has a specific role.
   *
   * @param role - Role to check for
   * @returns True if user has the role, false otherwise
   *
   * @example
   * ```typescript
   * if (db.auth.hasRole('admin')) {
   *   console.log('User is an admin');
   * }
   * ```
   */
  hasRole(role: string): boolean {
    if (!this.user) {
      throw new Error("User is not authenticated");
    }
    return this.user.roles.includes(role);
  }

  /**
   * Lists users from the auth collection with optional filtering and pagination.
   *
   * @template T - The type of user data
   * @param query - Optional query parameters for filtering, sorting, and pagination
   * @returns Promise resolving to a list of users
   *
   * @example
   * ```typescript
   * const users = await db.auth.listUsers({
   *   filters: { status: 'active' },
   *   limit: 10
   * });
   * ```
   */
  listUsers<T = any>(query?: Query): Promise<AppUserList> {
    const query_str = buildFilterQuery(query);
    const url = `/auth-collections/users${query_str ? `?${query_str}` : ""}`;
    console.log("request going to ", url);
    return this.request<AppUserList>("GET", url);
  }

  /**
   * Gets a user by their ID.
   *
   * @template T - The type of user data
   * @param userId - Unique ID of the user
   * @returns Promise resolving to the user object
   *
   * @example
   * ```typescript
   * const user = await db.auth.getUserById('user-123');
   * console.log('User:', user.email);
   * ```
   */
  getUserById<T = any>(userId: string): Promise<AppUser> {
    return this.request<AppUser>("GET", `/auth-collections/users/${userId}`);
  }
}

export default AuthHandler;

import {
  CocobaseConfig,
  TokenResponse,
  AppUser,
  AppUserList,
  Query,
  GoogleLoginResponse,
  AuthCallbacks,
  Response,
  LoginResult,
  TwoFAVerifyResponse,
} from "../types/types.js";
import {
  buildFilterQuery,
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
} from "../utils/utils.js";

import {
  RegisterParams,
  RegisterWithFilesParams,
  LoginParams,
  UpdateUserParams,
  UpdateUserWithFilesParams,
  GoogleLoginParams,
  GithubLoginParams,
  Verify2FAParams,
} from "../types/params.js";
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
   user?: AppUser;
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
   * @param params - Login parameters
   * @returns Promise resolving to LoginResult indicating success or 2FA requirement
   *
   * @example
   * ```typescript
   * const result = await db.auth.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * if (result.requires_2fa) {
   *   // Show 2FA input form to user
   *   console.log(result.message); // "2FA code sent to your email"
   *   // Later, call verify2FALogin with the code
   * } else {
   *   // Login successful
   *   console.log('Logged in as:', result.user?.email);
   * }
   * ```
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const { email, password } = params;
    const response = await this.request<TokenResponse>(
      "POST",
      `/auth-collections/login`,
      { email, password },
      false // Do not use data key for auth endpoints
    );

    // Check if 2FA is required
    if (response.requires_2fa) {
      return {
        requires_2fa: true,
        message: response.message,
      };
    }

    // Normal login flow
    this.token = response.access_token!;
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

    return {
      requires_2fa: false,
      user: this.user,
    };
  }

  /**
   * Registers a new user with email, password, and optional additional data.
   *
   * @param params - Registration parameters
   * @returns Promise resolving to LoginResult (registration may require 2FA if enabled)
   *
   * @example
   * ```typescript
   * const result = await db.auth.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe', fullName: 'John Doe' },
   *   roles: ['user'] // optional, if allowed by project config
   * });
   *
   * if (result.requires_2fa) {
   *   // Handle 2FA verification
   * } else {
   *   console.log('Registered as:', result.user?.email);
   * }
   * ```
   */
  async register(params: RegisterParams): Promise<LoginResult> {
    const { email, password, data, roles,phone_number } = params;
    const response = await this.request<TokenResponse>(
      "POST",
      `/auth-collections/signup`,
      { email, password, data, roles ,phone_number},
      false // Do not use data key for auth endpoints
    );

    // Check if 2FA is required
    if (response.requires_2fa) {
      return {
        requires_2fa: true,
        message: response.message,
      };
    }

    this.token = response.access_token!;
    this.setToken(this.token);
    if (!response.user) {
      await this.getCurrentUser();
    } else {
      this.setUser(response.user);
    }

    // Trigger register callback
    if (this.user) {
      this.callbacks.onRegister?.(this.user, this.token);
    }

    return {
      requires_2fa: false,
      user: this.user,
    };
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
   * const user = await db.auth.loginWithGoogle({ idToken, platform: 'mobile' });
   * ```
   */
  async loginWithGoogle(params: GoogleLoginParams): Promise<AppUser> {
    const { idToken, platform } = params;
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
   * Authenticates a user using GitHub OAuth with authorization code.
   *
   * This method exchanges the GitHub authorization code for a user session.
   * It creates a new user or logs in an existing user who registered with GitHub OAuth.
   *
   * @param code - GitHub authorization code from OAuth callback
   * @param redirectUri - The redirect URI used in the OAuth flow (must match the one registered)
   * @param platform - Optional platform identifier ('web', 'mobile', 'ios', 'android')
   * @returns Promise resolving to the authenticated user object
   *
   * @throws {Error} If GitHub Sign-In is not enabled in project settings
   * @throws {Error} If the GitHub authorization code is invalid or expired
   * @throws {Error} If email is already registered with password authentication
   * @throws {Error} If email is already registered with other OAuth providers
   *
   * @example
   * ```typescript
   * // Web - After GitHub OAuth callback
   * // 1. Redirect user to GitHub OAuth
   * const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
   * window.location.href = githubAuthUrl;
   *
   * // 2. Handle the callback with the code
   * const urlParams = new URLSearchParams(window.location.search);
   * const code = urlParams.get('code');
   *
   * if (code) {
   *   const user = await db.auth.loginWithGithub(
   *     code,
   *     'http://localhost:3000/auth/github/callback',
   *     'web'
   *   );
   *   console.log('Logged in:', user.email);
   * }
   * ```
   */
  async loginWithGithub(params: GithubLoginParams): Promise<AppUser> {
    const { code, redirectUri, platform } = params;
    const response = await this.request<{
      access_token: string;
      user: AppUser;
    }>(
      "POST",
      "/auth-collections/github-verify",
      { code, redirect_uri: redirectUri, platform },
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
   * @param params - Registration parameters with files
   *
   * @example
   * ```typescript
   * // Register with avatar
   * await db.auth.registerWithFiles({
   *   email: 'john@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe', full_name: 'John Doe' },
   *   files: { avatar: avatarFile }
   * });
   *
   * // Register with avatar and cover photo
   * await db.auth.registerWithFiles({
   *   email: 'john@example.com',
   *   password: 'password123',
   *   data: { username: 'johndoe' },
   *   files: { avatar: avatarFile, cover_photo: coverFile }
   * });
   * ```
   */
  async registerWithFiles(params: RegisterWithFilesParams): Promise<LoginResult> {
    const { email, password, data, roles, files } = params;
    const formData = new FormData();

    // Add JSON data
    formData.append("data", JSON.stringify({ email, password, data, roles }));

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

    const response = (await res.json()) as TokenResponse;

    // Check if 2FA is required
    if (response.requires_2fa) {
      return {
        requires_2fa: true,
        message: response.message,
      };
    }

    this.token = response.access_token!;
    this.setToken(response.access_token!);
    this.setUser(response.user!);

    // Trigger register callback
    this.callbacks.onRegister?.(response.user!, response.access_token!);

    return {
      requires_2fa: false,
      user: response.user,
    };
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
   * @param params - Update parameters
   * @returns Promise resolving to the updated user object
   *
   * @example
   * ```typescript
   * await db.auth.updateUser({
   *   data: { bio: 'Updated bio', website: 'https://example.com' }
   * });
   *
   * // Update email
   * await db.auth.updateUser({ email: 'newemail@example.com' });
   *
   * // Update password
   * await db.auth.updateUser({ password: 'newpassword123' });
   * ```
   */
  async updateUser(params: UpdateUserParams): Promise<AppUser> {
    const { data, email, password } = params;
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
   * @param params - Update parameters with files
   *
   * @example
   * ```typescript
   * // Update only avatar
   * await db.auth.updateUserWithFiles({
   *   files: { avatar: newAvatarFile }
   * });
   *
   * // Update bio and avatar
   * await db.auth.updateUserWithFiles({
   *   data: { bio: 'Updated bio' },
   *   files: { avatar: newAvatarFile }
   * });
   *
   * // Update multiple fields and files
   * await db.auth.updateUserWithFiles({
   *   data: { username: 'newusername', bio: 'New bio' },
   *   email: 'newemail@example.com',
   *   files: { avatar: newAvatar, cover_photo: newCover }
   * });
   * ```
   */
  async updateUserWithFiles(params: UpdateUserWithFilesParams): Promise<AppUser> {
    const { data, email, password, files } = params;
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

  // ADDITIONAL SECURITY METHODS

  /**
   * Enables Two-Factor Authentication (2FA) for the current user.
   *
   * @returns Promise that resolves when 2FA is enabled
   *
   * @example
   * ```typescript
   * await db.auth.enable2FA();
   * console.log('2FA enabled for user');
   * ```
   */
  enable2FA(): Promise<void> {
    return this.request<void>(
      "POST",
      `/auth-collections/2fa/enable`,
      {},
      false
    );
  }

  /**
   * Disables Two-Factor Authentication (2FA) for the current user.
   *
   * @returns Promise that resolves when 2FA is disabled
   *
   * @example
   * ```typescript
   * await db.auth.disable2FA();
   * console.log('2FA disabled for user');
   * ```
   */
  disable2FA(): Promise<void> {
    return this.request<void>(
      "POST",
      `/auth-collections/2fa/disable`,
      {},
      false
    );
  }

  /**
   * Sends a Two-Factor Authentication (2FA) code to the user's registered method (e.g., email, SMS).
   *
   * @returns Promise that resolves when the 2FA code is sent
   *
   * @example
   * ```typescript
   * await db.auth.send2FACode();
   * console.log('2FA code sent to user');
   * ```
   */
  send2FACode(email:string): Promise<void> {
    return this.request<void>(
      "POST",
      `/auth-collections/2fa/send-code`,
      {
        email
      },
      false
    );
  }

  /**
   * Completes login after 2FA verification.
   * Call this after login() returns requires_2fa: true and the user provides the 2FA code.
   *
   * @param params - 2FA verification parameters
   * @returns Promise resolving to the authenticated user
   *
   * @example
   * ```typescript
   * // First, attempt login
   * const result = await db.auth.login({ email: 'user@example.com', password: 'password123' });
   *
   * if (result.requires_2fa) {
   *   // User enters the 2FA code they received
   *   const user = await db.auth.verify2FALogin({ email: 'user@example.com', code: '123456' });
   *   console.log('Logged in as:', user.email);
   * }
   * ```
   */
  async verify2FALogin(params: Verify2FAParams): Promise<AppUser> {
    const { email, code } = params;
    const response = await this.request<TwoFAVerifyResponse>(
      "POST",
      `/auth-collections/2fa/verify`,
      { email, code },
      false
    );

    this.token = response.access_token;
    this.setToken(this.token);
    this.setUser(response.user);

    // Trigger login callback
    this.callbacks.onLogin?.(response.user, response.access_token);

    return response.user;
  }

  /**
   * Requests an email verification to be sent to the user's email address.
   *
   * @returns Promise that resolves when the verification email is requested
   *
   * @example
   * ```typescript
   * await db.auth.requestEmailVerification();
   * console.log('Verification email requested');
   * ```
   */
  requestEmailVerification(): Promise<Response> {
    return this.request<Response>(
      "POST",
      `/auth-collections/verify-email/send`,
      {},
      false
    );
  }

  /**
   * Verifies the user's email using the provided token.
   *
   * @param token - Verification token
   * @returns Promise that resolves when the email is verified
   *
   * @example
   * ```typescript
   * await db.auth.verifyEmail('verification-token');
   * console.log('Email verified');
   * ```
   */
  verifyEmail(token: string): Promise<Response> {
    return this.request<Response>(
      "POST",
      `/auth-collections/verify-email/verify`,
      { token },
      false
    );
  }

  /**   * Resends the email verification to the user's email address.
   *
   * @returns Promise that resolves when the verification email is resent
   *
   * @example
   * ```typescript
   * await db.auth.resendVerificationEmail();
   * console.log('Verification email resent');
   * ```
   */
  resendVerificationEmail(): Promise<void> {
    return this.request<void>(
      "POST",
      `/auth-collections/verify-email/resend`,
      {},
      false
    );
  }
}

export default AuthHandler;

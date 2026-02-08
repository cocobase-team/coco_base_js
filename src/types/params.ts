/**
 * Parameter interfaces for Cocobase authentication methods.
 * These provide better IDE autocomplete and documentation for users.
 */

/**
 * Parameters for user login
 */
export interface LoginParams {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Parameters for user registration
 */
export interface RegisterParams {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;

  /**Optional user phone number **/
  phone_number?: string;
  /** Optional user roles (if allowed by project config) */
  roles?: string[];
  /** Optional additional user data */
  data?: Record<string, any>;
}

/**
 * Parameters for user registration with file uploads
 */
export interface RegisterWithFilesParams {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Optional user roles (if allowed by project config) */
  roles?: string[];
  /** Optional additional user data */
  data?: Record<string, any>;
  /** Optional files to upload (e.g., avatar, cover_photo) */
  files?: Record<string, File | File[]>;
}

/**
 * Parameters for updating user profile
 */
export interface UpdateUserParams {
  /** User data to update */
  data?: Record<string, any> | null;
  /** New email address */
  email?: string | null;
  /** New password */
  password?: string | null;
}

/**
 * Parameters for updating user profile with file uploads
 */
export interface UpdateUserWithFilesParams {
  /** User data to update */
  data?: Record<string, any> | null;
  /** New email address */
  email?: string | null;
  /** New password */
  password?: string | null;
  /** Files to upload (e.g., avatar, cover_photo) */
  files?: Record<string, File | File[]>;
}

/**
 * Parameters for Google login
 */
export interface GoogleLoginParams {
  /** Google ID token obtained from Google Sign-In */
  idToken: string;
  /** Platform identifier */
  platform?: "web" | "mobile" | "ios" | "android";
}

/**
 * Parameters for GitHub login
 */
export interface GithubLoginParams {
  /** GitHub authorization code from OAuth callback */
  code: string;
  /** The redirect URI used in the OAuth flow */
  redirectUri: string;
  /** Platform identifier */
  platform?: "web" | "mobile" | "ios" | "android";
}

/**
 * Parameters for 2FA verification
 */
export interface Verify2FAParams {
  /** User's email address */
  email: string;
  /** The 2FA code from email/authenticator */
  code: string;
}

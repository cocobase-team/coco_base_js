const BASEURL = "https://cloud.cocobase.buzz";

/**
 * Parameters for executing a cloud function.
 */
interface FunctionParams {
  /** Optional payload to send to the function */
  payload?: Record<string, unknown>;
  /** HTTP method to use (GET or POST) */
  method: "GET" | "POST";
}

/**
 * Response from a cloud function execution.
 *
 * @template T - The type of the function result
 */
interface FunctionResponse<T> {
  /** The result returned by the function */
  result: T;
  /** Whether the function executed successfully */
  success: boolean;
  /** Error message if the function failed, null otherwise */
  error: string | null;
  /** Time taken to execute the function in milliseconds */
  execution_time: number;
  /** Console output from the function execution */
  output: string;
}

/**
 * CloudFunction client for executing server-side functions.
 *
 * Cloud functions allow you to run custom server-side logic without managing infrastructure.
 * Functions are written in Python and deployed to your Cocobase project.
 *
 * @example
 * ```typescript
 * // Access via the Cocobase instance
 * const db = new Cocobase({
 *   apiKey: 'your-api-key',
 *   projectId: 'your-project-id'
 * });
 *
 * // Execute a function
 * const result = await db.functions.execute('sendEmail', {
 *   payload: { to: 'user@example.com', subject: 'Hello' },
 *   method: 'POST'
 * });
 * ```
 */
export class CloudFunction {
  projectId: string;
  private getToken: () => string | undefined;

  /**
   * Creates a new CloudFunction client.
   *
   * @param projectId - Your Cocobase project ID
   * @param getToken - Function that returns the current authentication token
   * @throws Error if projectId is empty or invalid
   */
  constructor(projectId: string, getToken: () => string | undefined) {
    this.projectId = projectId;
    this.getToken = getToken;

    // Validate projectId
    if (!projectId || projectId.trim() === "") {
      throw new Error(
        "CloudFunction requires a valid projectId. Please provide projectId in CocobaseConfig."
      );
    }
  }

  /**
   * Executes a cloud function by name.
   *
   * @template T - The expected return type of the function
   * @param functionName - Name of the cloud function to execute
   * @param params - Optional parameters including payload and HTTP method
   * @returns Promise resolving to the function response with result and metadata
   * @throws Error if projectId is invalid
   *
   * @example
   * ```typescript
   * // Simple GET request
   * const result = await db.functions.execute('getStats');
   *
   * // POST request with payload
   * const result = await db.functions.execute('processOrder', {
   *   payload: {
   *     orderId: '12345',
   *     items: [{ id: 1, quantity: 2 }]
   *   },
   *   method: 'POST'
   * });
   *
   * console.log(result.result); // Function output
   * console.log(result.execution_time); // Execution time in ms
   * ```
   */
  async execute<T>(
    functionName: string,
    params?: FunctionParams
  ): Promise<FunctionResponse<T>> {
    // Validate projectId again in case it was modified
    if (!this.projectId || this.projectId.trim() === "") {
      throw new Error(
        "Invalid projectId. Please ensure projectId is set in CocobaseConfig."
      );
    }

    const url = `${BASEURL}/functions/${this.projectId}/func/${functionName}`;

    // Default to GET if no params provided, otherwise use specified method or POST
    const method = params?.method ?? (params?.payload ? "POST" : "GET");

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Get the latest token dynamically
    const token = this.getToken();
    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Only add body for POST/PUT requests with payload
    if (method === "POST" && params?.payload) {
      fetchOptions.body = JSON.stringify({
        payload: params.payload,
      });
    }

    const res = await fetch(url, fetchOptions);
    const data = await res.json();
    return data as FunctionResponse<T>;
  }
}

const BASEURL = "https://cloud.cocobase.buzz";

interface FunctionParams {
  payload?: Record<string, unknown>;
  method: "GET" | "POST";
}

interface FunctionResponse<T> {
  result: T;
  success: boolean;
  error: string | null;
  execution_time: number;
  output: string;
}
export class CloudFunction {
  projectId: string;
  private getToken: () => string | undefined;

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

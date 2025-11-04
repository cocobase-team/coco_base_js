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
  token: string | undefined;
  constructor(projectId: string,token?:string) {
    this.projectId = projectId;
    this.token = token;
  }

  async execute<T>(
    functionName: string,
    params?: FunctionParams
  ): Promise<FunctionResponse<T>> {
    const url = `${BASEURL}/functions/${this.projectId}/func/${functionName}`;

    // Default to GET if no params provided, otherwise use specified method or POST
    const method = params?.method ?? (params?.payload ? "POST" : "GET");

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (this.token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    // Only add body for POST/PUT requests with payload
    if (method === "POST" && params?.payload) {
      fetchOptions.body = JSON.stringify(params.payload);
    }

    const res = await fetch(url, fetchOptions);
    const data = await res.json();
    return data as FunctionResponse<T>;
  }
}

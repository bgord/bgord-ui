type ServerFetcher = (request: Request) => Response | Promise<Response>;

const forwarded = ["cookie", "user-agent", "x-real-ip", "x-forwarded-for"];

export class ApiClient {
  private static server: ServerFetcher | null = null;

  static useServer(fetcher: ServerFetcher): void {
    ApiClient.server = fetcher;
  }

  static fetch(path: string, request: Request | null, init: RequestInit = {}): Promise<Response> {
    if (!request) return fetch(path, init);
    if (!ApiClient.server) throw new Error("ApiClient.useServer was not called");

    const headers = new Headers(init.headers);

    for (const name of forwarded) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    return Promise.resolve(ApiClient.server(new Request(new URL(path, request.url), { ...init, headers })));
  }

  static async json<T>(path: string, request: Request | null, fallback: T, init?: RequestInit): Promise<T> {
    const response = await ApiClient.fetch(path, request, init);

    if (!response.ok) return fallback;
    return response.json();
  }
}

import { describe, expect, mock, spyOn, test } from "bun:test";
import { ApiClient } from "../src/services/api-client";

const path = "/api/items";
const origin = "http://localhost:3000";
const init = { method: "QUERY", body: JSON.stringify({ page: 1 }) };
const fallback = { items: [] };
const body = { items: ["first"] };

describe("ApiClient.fetch", () => {
  test("useServer not called", () => {
    const request = new Request(`${origin}/page`);

    expect(() => ApiClient.fetch(path, request)).toThrow("ApiClient.useServer was not called");
  });

  test("happy path - client", async () => {
    const response = new Response();
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(response);

    const result = await ApiClient.fetch(path, null, init);

    expect(result).toEqual(response);
    expect(fetchSpy).toHaveBeenCalledWith(path, init);
  });

  test("happy path - server", async () => {
    const response = new Response();
    const server = mock((_request: Request) => response);
    ApiClient.useServer(server);
    const request = new Request(`${origin}/page`, {
      headers: {
        "user-agent": "agent",
        "x-real-ip": "1.2.3.4",
        "x-forwarded-for": "5.6.7.8",
        "accept-language": "pl",
      },
    });

    const result = await ApiClient.fetch(path, request, {
      ...init,
      headers: { "content-type": "text/plain" },
    });

    const forwarded = server.mock.calls[0]?.[0] as Request;
    expect(result).toEqual(response);
    expect(forwarded.url).toEqual(`${origin}${path}`);
    expect(forwarded.method).toEqual("QUERY");
    expect(await forwarded.text()).toEqual(init.body);
    expect(Object.fromEntries(forwarded.headers)).toEqual({
      "user-agent": "agent",
      "x-real-ip": "1.2.3.4",
      "x-forwarded-for": "5.6.7.8",
      "content-type": "text/plain",
    });
  });

  test("happy path - server without forwarded headers", async () => {
    const server = mock((_request: Request) => new Response());
    ApiClient.useServer(server);
    const request = new Request(`${origin}/page`);

    await ApiClient.fetch(path, request);

    const forwarded = server.mock.calls[0]?.[0] as Request;
    expect(Object.fromEntries(forwarded.headers)).toEqual({});
  });
});

describe("ApiClient.json", () => {
  test("fallback", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    const result = await ApiClient.json(path, null, fallback, init);

    expect(result).toEqual(fallback);
    expect(fetchSpy).toHaveBeenCalledWith(path, init);
  });

  test("happy path", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json(body));

    const result = await ApiClient.json(path, null, fallback);

    expect(result).toEqual(body);
  });
});

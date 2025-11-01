export function absoluteUrl(path: string, request: Request | null): string | URL {
  if (!request) return path;

  const incoming = new URL(request.url);

  // Respect reverse-proxy TLS
  const xfproto = request.headers.get("x-forwarded-proto");
  const forwarded = request.headers.get("forwarded");
  const isHttps = xfproto === "https" || (forwarded && /proto=https/i.test(forwarded));

  // Build a clean origin (protocol + host), no path/search/hash
  const origin = `${isHttps ? "https:" : incoming.protocol}//${incoming.host}`;

  // Let WHATWG URL do the right thing:
  // - if `path` is relative with "?...", it becomes pathname + search (NO %3F)
  // - if `path` is absolute, it’s used as-is
  return new URL(path, origin);
}

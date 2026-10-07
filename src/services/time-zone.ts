export class TimeZone {
  static readonly COOKIE = "time-zone";

  static readonly DEFAULT = "UTC";

  static readonly script = `(() => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const read = () => document.cookie.match(/(?:^|; )${TimeZone.COOKIE}=([^;]*)/)?.[1];
  if (read() === encodeURIComponent(timeZone)) return;
  document.cookie = "${TimeZone.COOKIE}=" + encodeURIComponent(timeZone) + "; path=/; max-age=31536000; samesite=lax";
  if (read() === encodeURIComponent(timeZone)) location.reload();
})();`;

  static get(request: Pick<Request, "headers"> | null): string {
    const cookies = request ? request.headers.get("cookie") : document.cookie;
    const value = cookies?.match(new RegExp(`(?:^|;\\s*)${TimeZone.COOKIE}=([^;]*)`))?.[1];

    if (!value) return TimeZone.DEFAULT;

    const timeZone = decodeURIComponent(value);

    try {
      new Intl.DateTimeFormat("en", { timeZone });
      return timeZone;
    } catch {
      return TimeZone.DEFAULT;
    }
  }
}

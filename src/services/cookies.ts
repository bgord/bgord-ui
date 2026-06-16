export class Cookies {
  static extractFrom(request: Request): string {
    return request.headers.get("cookie") ?? "";
  }

  static set(name: string, value: string) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }
}

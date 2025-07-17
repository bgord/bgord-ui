//TODO: tests
export class Cookies {
  static extractFrom(request: Request): string {
    return request.headers.get("cookie") ?? "";
  }
}

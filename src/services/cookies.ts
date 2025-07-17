//TODO: tests
export class Cookies {
  static extractFrom(request: Request): string | undefined {
    return request.headers.get("cookie") ?? undefined;
  }
}

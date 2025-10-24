import JsCookie from "js-cookie";

export class Cookies {
  static extractFrom(request: Request): string {
    return request.headers.get("cookie") ?? "";
  }

  static set(name: string, value: string) {
    JsCookie.set(name, value);
  }
}

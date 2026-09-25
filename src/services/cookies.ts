export class Cookies {
  static set(name: string, value: string) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }
}

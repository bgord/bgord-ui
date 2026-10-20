export class Cookies {
  static set(name: string, value: string) {
    const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    document.cookie = `${cookie}; path=/; max-age=31536000; samesite=lax`;
  }
}

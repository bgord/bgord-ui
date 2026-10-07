export class Clock {
  static now(): number {
    // biome-ignore lint: lint/style/noRestrictedGlobals
    return Date.now();
  }

  static iso(timestamp: number): string {
    // biome-ignore lint: lint/style/noRestrictedGlobals
    return new Date(timestamp).toISOString();
  }
}

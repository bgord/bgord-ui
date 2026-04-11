export class TimeZoneOffset {
  static get() {
    // biome-ignore lint: lint/style/noRestrictedGlobals
    return { "time-zone-offset": new Date().getTimezoneOffset().toString() };
  }
}

export class TimeZoneOffset {
  static get() {
    return { "time-zone-offset": new Date().getTimezoneOffset().toString() };
  }
}

export class Fields {
  static allUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.every((field) => field.unchanged);
  }

  static allEmpty(fields: { empty: boolean }[]): boolean {
    return fields.every((field) => field.empty);
  }

  static anyEmpty(fields: { empty: boolean }[]): boolean {
    return fields.some((field) => field.empty);
  }

  static anyUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.some((field) => field.unchanged);
  }

  static anyChanged(fields: { changed: boolean }[]): boolean {
    return fields.some((field) => field.changed);
  }
}

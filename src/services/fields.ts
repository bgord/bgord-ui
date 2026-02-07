export class Fields {
  static allUnchanged(fields: ReadonlyArray<{ unchanged: boolean }>): boolean {
    return fields.every((field) => field.unchanged);
  }

  static allEmpty(fields: ReadonlyArray<{ empty: boolean }>): boolean {
    return fields.every((field) => field.empty);
  }

  static anyEmpty(fields: ReadonlyArray<{ empty: boolean }>): boolean {
    return fields.some((field) => field.empty);
  }

  static anyUnchanged(fields: ReadonlyArray<{ unchanged: boolean }>): boolean {
    return fields.some((field) => field.unchanged);
  }

  static anyChanged(fields: ReadonlyArray<{ changed: boolean }>): boolean {
    return fields.some((field) => field.changed);
  }

  static clearAll(fields: ReadonlyArray<{ clear: VoidFunction }>) {
    fields.forEach((field) => field.clear());
  }
}

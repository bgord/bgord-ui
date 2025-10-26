export type DateFieldValueType<T extends string = string> = T | undefined;

export class DateField<T extends string = string> {
  static readonly EMPTY = undefined;

  private readonly value: DateFieldValueType<T> = DateField.EMPTY;

  constructor(value: DateFieldValueType<T>) {
    this.value = DateField.isEmpty(value) ? DateField.EMPTY : value;
  }

  get(): DateFieldValueType<T> {
    return this.value;
  }

  isEmpty() {
    return DateField.isEmpty(this.value);
  }

  static isEmpty<V extends string>(value: DateFieldValueType<V> | null): boolean {
    return value === undefined || value === null || value === "";
  }

  static compare<V extends string>(one: DateFieldValueType<V>, another: DateFieldValueType<V>): boolean {
    if (DateField.isEmpty(one) && DateField.isEmpty(another)) return true;
    return one === another;
  }
}

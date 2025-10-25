export type NumberFieldValueType<T extends number = number> = T | undefined;

export class NumberField<T extends number = number> {
  // Empty value is `undefined` here instead of `null`,
  // because HTML elements accept it as an empty value.
  static readonly EMPTY = undefined as undefined;

  private readonly value: NumberFieldValueType<T> = NumberField.EMPTY;

  constructor(value: NumberFieldValueType<T>) {
    this.value = NumberField.isEmpty(value) ? NumberField.EMPTY : value;
  }

  get(): NumberFieldValueType<T> {
    return this.value;
  }

  isEmpty(): boolean {
    return NumberField.isEmpty(this.value);
  }

  static isEmpty<V extends number>(value: NumberFieldValueType<V> | null): boolean {
    return value === undefined || value === null || Number.isNaN(value);
  }

  static compare<V extends number>(one: NumberFieldValueType<V>, another: NumberFieldValueType<V>): boolean {
    if (NumberField.isEmpty(one) && NumberField.isEmpty(another)) return true;
    return one === another;
  }
}

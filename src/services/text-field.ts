export type TextFieldValueType<T extends string = string> = T | undefined;

export class TextField<T extends string = string> {
  // Empty value is `undefined` here instead of `null`,
  // because HTML elements accept it as an empty value.
  static readonly EMPTY = undefined;

  private readonly value: TextFieldValueType<T> = TextField.EMPTY;

  constructor(value: TextFieldValueType<T>) {
    this.value = TextField.isEmpty(value) ? TextField.EMPTY : value;
  }

  get(): TextFieldValueType<T> {
    return this.value;
  }

  isEmpty(): boolean {
    return TextField.isEmpty(this.value);
  }

  static isEmpty<V extends string>(value: TextFieldValueType<V>): boolean {
    return value === undefined || value === "" || value === null;
  }

  static compare<V extends string>(one: TextFieldValueType<V>, another: TextFieldValueType<V>): boolean {
    if (TextField.isEmpty(one) && TextField.isEmpty(another)) return true;
    return one === another;
  }
}

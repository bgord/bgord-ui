import { useState } from "react";
import { Field, type FieldValueAllowedTypes } from "../services/field";

type FieldNameType = string;

export type FieldElementType = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type useFieldConfigType<T extends FieldValueAllowedTypes> = { name: FieldNameType; defaultValue?: T };

export type useFieldReturnType<T extends FieldValueAllowedTypes> = {
  defaultValue: T;
  currentValue: T;
  value: NonNullable<T>;
  set: (value: T) => void;
  handleChange: (event: React.ChangeEvent<FieldElementType>) => void;
  clear: () => void;
  label: { props: { htmlFor: FieldNameType } };
  input: {
    props: {
      id: FieldNameType;
      name: FieldNameType;
      value: NonNullable<T>;
      onChange: (event: React.ChangeEvent<FieldElementType>) => void;
    };
  };
  changed: boolean;
  unchanged: boolean;
  empty: boolean;
};

export function useField<T extends FieldValueAllowedTypes>(
  config: useFieldConfigType<T>,
): useFieldReturnType<T> {
  const defaultValue = new Field<T>(config.defaultValue as T);
  const [currentValue, currentValueSetter] = useState<T>(defaultValue.get());

  const value = Field.isEmpty(currentValue) ? ("" as NonNullable<T>) : (currentValue as NonNullable<T>);
  const setCurrentValue = (value: T) => currentValueSetter(new Field<T>(value).get());

  const onChange = (event: React.ChangeEvent<FieldElementType>) =>
    setCurrentValue(event.currentTarget.value as T);

  return {
    defaultValue: defaultValue.get(),
    currentValue,
    value,
    set: setCurrentValue,
    handleChange: onChange,
    clear: () => setCurrentValue(defaultValue.get()),
    label: { props: { htmlFor: config.name } },
    input: { props: { id: config.name, name: config.name, value, onChange } },
    changed: !Field.compare(currentValue, defaultValue.get()),
    unchanged: Field.compare(currentValue, defaultValue.get()),
    empty: Field.isEmpty(currentValue),
  };
}

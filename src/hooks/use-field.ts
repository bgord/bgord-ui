import { useState } from "react";
import { Field, type FieldValueAllowedTypes } from "../services/field";

type FieldNameType = string;

export type FieldElementType = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type UseFieldConfigType<T extends FieldValueAllowedTypes> = { name: FieldNameType; defaultValue?: T };

export type UseFieldReturnType<T extends FieldValueAllowedTypes> = {
  defaultValue: T;
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
  config: UseFieldConfigType<T>,
): UseFieldReturnType<T> {
  const defaultValue = new Field<T>(config.defaultValue as T);
  const [internal, setInternal] = useState<T>(defaultValue.get());

  // "" is used for the browser to get the empty field value
  const value = Field.isEmpty(internal) ? ("" as NonNullable<T>) : (internal as NonNullable<T>);
  const setCurrentValue = (value: T) => setInternal(new Field<T>(value).get());

  const onChange = (event: React.ChangeEvent<FieldElementType>) =>
    setCurrentValue(event.currentTarget.value as T);

  return {
    defaultValue: defaultValue.get(),
    value,
    set: setCurrentValue,
    handleChange: onChange,
    clear: () => setCurrentValue(defaultValue.get()),
    label: { props: { htmlFor: config.name } },
    input: { props: { id: config.name, name: config.name, value, onChange } },
    changed: !Field.compare(internal, defaultValue.get()),
    unchanged: Field.compare(internal, defaultValue.get()),
    empty: Field.isEmpty(internal),
  };
}

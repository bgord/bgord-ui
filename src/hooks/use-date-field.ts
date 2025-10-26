import { useState } from "react";
import { DateField, type DateFieldValueType } from "../services/date-field";

type DateFieldNameType = string;

export type DateFieldElementType = HTMLInputElement;

export type UseDateFieldConfigType<T extends string = string> = {
  name: DateFieldNameType;
  defaultValue?: DateFieldValueType<T>;
};

export type UseDateFieldReturnType<T extends string = string> = {
  defaultValue: DateFieldValueType<T>;
  value: DateFieldValueType<T>;
  set: (value: DateFieldValueType<T>) => void;
  handleChange: (event: React.ChangeEvent<DateFieldElementType>) => void;
  clear: () => void;
  label: { props: { htmlFor: DateFieldNameType } };
  input: {
    props: {
      id: DateFieldNameType;
      name: DateFieldNameType;
      value: string;
      min?: string;
      max?: string;
      onChange: (event: React.ChangeEvent<DateFieldElementType>) => void;
    };
  };
  changed: boolean;
  unchanged: boolean;
  empty: boolean;
};

export function useDateField<T extends string = string>(
  config: UseDateFieldConfigType<T>,
): UseDateFieldReturnType<T> {
  const defaultValue = new DateField<T>(config.defaultValue);

  const [value, setValue] = useState<DateFieldValueType<T>>(defaultValue.get());
  const [dom, setDom] = useState<string>(
    DateField.isEmpty(defaultValue.get()) ? "" : (defaultValue.get() as string),
  );

  const setCurrentValue = (next: DateFieldValueType<T>) => {
    const date = new DateField<T>(next).get();

    setValue(date);
    setDom(DateField.isEmpty(date) ? "" : String(date));
  };

  const onChange = (event: React.ChangeEvent<DateFieldElementType>) => {
    const element = event.currentTarget;
    const value = element.value;

    setDom(value);

    if (value === "") return setValue(DateField.EMPTY);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    if (!element.validity.valid) return;

    setValue(value as T);
  };

  return {
    defaultValue: defaultValue.get(),
    value,
    set: setCurrentValue,
    handleChange: onChange,
    clear: () => setCurrentValue(defaultValue.get()),
    label: { props: { htmlFor: config.name } },
    input: { props: { id: config.name, name: config.name, value: dom, onChange } },
    changed: !DateField.compare(value, defaultValue.get()),
    unchanged: DateField.compare(value, defaultValue.get()),
    empty: DateField.isEmpty(value),
  };
}

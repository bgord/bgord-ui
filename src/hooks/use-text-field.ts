import { useEffect, useState } from "react";
import { TextField, type TextFieldValueType } from "../services/text-field";

type TextFieldNameType = string;

export type TextFieldElementType = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type UseTextFieldConfigType<T extends string = string> = {
  name: TextFieldNameType;
  defaultValue?: TextFieldValueType<T>;
};

export type UseTextFieldReturnType<T extends string = string> = {
  defaultValue: TextFieldValueType<T>;
  value: TextFieldValueType<T>;
  set: (value: TextFieldValueType<T>) => void;
  handleChange: (event: React.ChangeEvent<TextFieldElementType>) => void;
  clear: () => void;
  label: { props: { htmlFor: TextFieldNameType } };
  input: {
    props: {
      id: TextFieldNameType;
      name: TextFieldNameType;
      value: string;
      onChange: (event: React.ChangeEvent<TextFieldElementType>) => void;
    };
  };
  changed: boolean;
  unchanged: boolean;
  empty: boolean;
};

export function useTextField<T extends string = string>(
  config: UseTextFieldConfigType<T>,
): UseTextFieldReturnType<T> {
  const defaultValue = new TextField<T>(config.defaultValue);

  const [value, setValue] = useState<TextFieldValueType<T>>(defaultValue.get());

  const setCurrentValue = (next: TextFieldValueType<T>) => setValue(new TextField<T>(next).get());

  const onChange = (event: React.ChangeEvent<TextFieldElementType>) =>
    setCurrentValue(event.currentTarget.value as T);

  useEffect(() => {
    setCurrentValue(defaultValue.get());
  }, [config.defaultValue]);

  return {
    defaultValue: defaultValue.get(),
    value,
    set: setCurrentValue,
    handleChange: onChange,
    clear: () => setCurrentValue(defaultValue.get()),
    label: { props: { htmlFor: config.name } },
    input: {
      props: {
        id: config.name,
        name: config.name,
        value: TextField.isEmpty(value) ? "" : (value as string),
        onChange,
      },
    },
    changed: !TextField.compare(value, defaultValue.get()),
    unchanged: TextField.compare(value, defaultValue.get()),
    empty: TextField.isEmpty(value),
  };
}

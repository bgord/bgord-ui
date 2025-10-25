import { useState } from "react";
import { NumberField, type NumberFieldValueType } from "../services/number-field";

type NumberFieldNameType = string;

export type NumberFieldElementType = HTMLInputElement;

export type UseNumberFieldConfigType<T extends number = number> = {
  name: NumberFieldNameType;
  defaultValue?: NumberFieldValueType<T>;
};

export type UseNumberFieldReturnType<T extends number = number> = {
  defaultValue: NumberFieldValueType<T>;
  value: NumberFieldValueType<T>;
  set: (value: NumberFieldValueType<T>) => void;
  handleChange: (event: React.ChangeEvent<NumberFieldElementType>) => void;
  clear: () => void;
  label: { props: { htmlFor: NumberFieldNameType } };
  input: {
    props: {
      id: NumberFieldNameType;
      name: NumberFieldNameType;
      value: string;
      onChange: (event: React.ChangeEvent<NumberFieldElementType>) => void;
    };
  };
  changed: boolean;
  unchanged: boolean;
  empty: boolean;
};

export function useNumberField<T extends number = number>(
  config: UseNumberFieldConfigType<T>,
): UseNumberFieldReturnType<T> {
  const defaultValue = new NumberField<T>(config.defaultValue);

  const [value, setValue] = useState<NumberFieldValueType<T>>(defaultValue.get());
  const [dom, setDom] = useState<string>(
    NumberField.isEmpty(defaultValue.get()) ? "" : String(defaultValue.get()),
  );

  const setCurrentValue = (next: NumberFieldValueType<T>) => {
    const number = new NumberField<T>(next).get();

    setValue(number);
    setDom(NumberField.isEmpty(number) ? "" : String(number));
  };

  const onChange = (event: React.ChangeEvent<NumberFieldElementType>) => {
    setDom(event.currentTarget.value);

    if (event.currentTarget.value === "") return setValue(NumberField.EMPTY);

    // Validating before setting the state value
    // to avoid undefined when typing 1. when trying to input 1.5
    const number = event.currentTarget.valueAsNumber;

    if (Number.isFinite(number)) setValue(number as T);
  };

  return {
    defaultValue: defaultValue.get(),
    value,
    set: setCurrentValue,
    handleChange: onChange,
    clear: () => setCurrentValue(defaultValue.get()),
    label: { props: { htmlFor: config.name } },
    input: { props: { id: config.name, name: config.name, value: dom, onChange } },
    changed: !NumberField.compare(value, defaultValue.get()),
    unchanged: NumberField.compare(value, defaultValue.get()),
    empty: NumberField.isEmpty(value),
  };
}

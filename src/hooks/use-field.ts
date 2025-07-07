import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Field, FieldValueAllowedTypes } from "../services/field";

/** Type for field names */
type NewFieldNameType = string;

/** Valid HTML elements that can be used as field inputs */
export type FieldElementType = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Defines the strategy for field value persistence
 * @enum {string}
 */
export enum useFieldStrategyEnum {
  /** Store field value in URL parameters */
  params = "params",
  /** Store field value in local state */
  local = "local",
}

/**
 * Configuration options for the useField hook
 * @template T - Type of the field value
 */
export type useFieldConfigType<T extends FieldValueAllowedTypes> = {
  /** Unique identifier for the field */
  name: NewFieldNameType;
  /** Initial value for the field */
  defaultValue?: T;
  /** Strategy for value persistence */
  strategy?: useFieldStrategyEnum;
};

/**
 * Return type for the useField hook
 * @template T - Type of the field value
 */
export type useFieldReturnType<T extends FieldValueAllowedTypes> = {
  /** Current persistence strategy */
  strategy: useFieldStrategyEnum;
  /** Initial field value */
  defaultValue: T;
  /** Current field value */
  currentValue: T;
  /** Non-nullable field value, empty string for empty values */
  value: NonNullable<T>;
  /** Function to set field value */
  set: (value: T) => void;
  /** Change event handler for controlled components */
  handleChange: (event: React.ChangeEvent<FieldElementType>) => void;
  /** Reset field to default value */
  clear: () => void;
  /** Props for field label */
  label: { props: { htmlFor: NewFieldNameType } };
  /** Props for field input */
  input: {
    props: {
      id: NewFieldNameType;
      name: NewFieldNameType;
      value: NonNullable<T>;
      onChange: (event: React.ChangeEvent<FieldElementType>) => void;
    };
  };
  /** Whether field value differs from default */
  changed: boolean;
  /** Whether field value equals default */
  unchanged: boolean;
  /** Whether field is empty */
  empty: boolean;
};

/**
 * Hook for managing form field state with URL parameters or local state
 *
 * @template T - Type of the field value
 * @param {useFieldConfigType<T>} config - Field configuration
 * @returns {useFieldReturnType<T>} Field state and handlers
 *
 * @example
 * ```tsx
 * // Using local strategy
 * function NameField() {
 *   const field = useField({
 *     name: "username",
 *     defaultValue: "",
 *     strategy: useFieldStrategyEnum.local
 *   });
 *
 *   return (
 *     <div>
 *       <label {...field.label.props}>Username:</label>
 *       <input
 *         {...field.input.props}
 *         type="text"
 *         value={field.value}
 *         onChange={field.handleChange}
 *       />
 *     </div>
 *   );
 * }
 *
 * // Using URL parameters strategy
 * function SearchField() {
 *   const field = useField({
 *     name: "q",
 *     strategy: useFieldStrategyEnum.params
 *   });
 *
 *   return (
 *     <input
 *       type="search"
 *       {...field.input.props}
 *       value={field.value}
 *       onChange={field.handleChange}
 *     />
 *   );
 * }
 * ```
 */
export function useField<T extends FieldValueAllowedTypes>(
  config: useFieldConfigType<T>,
): useFieldReturnType<T> {
  const strategy = config.strategy ?? useFieldStrategyEnum.local;
  const [params, setParams] = useSearchParams();
  const givenValue = new Field<T>(params.get(config.name) as T);
  const defaultValue = new Field<T>(config.defaultValue as T);
  const [currentValue, _setCurrentValue] = useState<T>(
    givenValue.isEmpty() ? defaultValue.get() : givenValue.get(),
  );

  const setCurrentValue = (value: T) => {
    const candidate = new Field<T>(value);
    _setCurrentValue(candidate.get());
  };

  useEffect(() => {
    const current = new Field(currentValue);
    if (strategy === useFieldStrategyEnum.params) {
      if (current.isEmpty()) {
        params.delete(config.name);
        setParams(params);
      } else {
        params.set(config.name, current.get() as string);
        setParams(params);
      }
    }
    if (strategy === useFieldStrategyEnum.local) {
    }
  }, [currentValue, params, setParams, config.name, strategy]);

  const value = Field.isEmpty(currentValue) ? ("" as NonNullable<T>) : (currentValue as NonNullable<T>);

  const onChange = (event: React.ChangeEvent<FieldElementType>) =>
    setCurrentValue(event.currentTarget.value as T);

  return {
    strategy,
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

/**
 * Utility class for working with multiple fields
 * @static
 */
export class Fields {
  /**
   * Check if all fields are unchanged
   * @param {Array<{unchanged: boolean}>} fields - Array of field states
   * @returns {boolean} True if all fields match their default values
   */
  static allUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.every((field) => field.unchanged);
  }

  /**
   * Check if any field is unchanged
   * @param {Array<{unchanged: boolean}>} fields - Array of field states
   * @returns {boolean} True if any field matches its default value
   */
  static anyUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.some((field) => field.unchanged);
  }

  /**
   * Check if any field has changed
   * @param {Array<{changed: boolean}>} fields - Array of field states
   * @returns {boolean} True if any field differs from its default value
   */
  static anyChanged(fields: { changed: boolean }[]): boolean {
    return fields.some((field) => field.changed);
  }
}

/**
 * Utility class for working with local fields
 * @static
 */
export class LocalFields {
  static clearAll(fields: { clear: VoidFunction }[]) {
    return () => fields.forEach((field) => field.clear());
  }
}

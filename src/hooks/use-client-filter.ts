import { useCallback, useMemo } from "react";
import { Field, type FieldValueAllowedTypes } from "../services/field";
import {
  useField,
  type useFieldConfigType,
  type useFieldReturnType,
  useFieldStrategyEnum,
} from "./use-field";

export type useClientFilterQueryType = string | undefined;

type useClientFilterConfigType<T extends FieldValueAllowedTypes> = Omit<useFieldConfigType<T>, "strategy"> & {
  enum: { [key: string]: useClientFilterQueryType };
  filterFn?: (value: T) => boolean;
};

export type useClientFilterReturnType<T extends FieldValueAllowedTypes> = useFieldReturnType<T> & {
  filterFn: NonNullable<useClientFilterConfigType<T>["filterFn"]>;
  options: {
    name: string;
    value: useClientFilterConfigType<T>["enum"][0];
  }[];
} & {
  strategy: useFieldStrategyEnum.local;
};

export function useClientFilter<T extends FieldValueAllowedTypes>(
  config: useClientFilterConfigType<T>,
): useClientFilterReturnType<T> {
  const query = useField({
    ...config,
    strategy: useFieldStrategyEnum.local,
  });

  const defaultFilterFn = useCallback(
    (given: T) => {
      if (query.empty) return true;
      return Field.compare(given, query.currentValue);
    },
    [query.empty, query.currentValue],
  );

  const filterFn = useMemo(() => config.filterFn ?? defaultFilterFn, [config.filterFn, defaultFilterFn]);

  const options = useMemo(
    () => Object.entries(config.enum).map(([name, value]) => ({ name, value })),
    [config.enum],
  );

  return useMemo(
    () => ({
      ...query,
      filterFn,
      options,
      strategy: useFieldStrategyEnum.local as const,
    }),
    [query, filterFn, options],
  );
}

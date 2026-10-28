export type SearchParamParser<T> = (value: unknown) => T | undefined;

type SearchParamTextConfigType = { min?: number; max?: number };

type SearchParamShapeType = Record<string, SearchParamParser<unknown>>;

type SearchParamValuesType<Shape extends SearchParamShapeType> = {
  [Key in keyof Shape]?: Shape[Key] extends SearchParamParser<infer T> ? T : never;
};

export class SearchParam {
  static text(config: SearchParamTextConfigType = {}): SearchParamParser<string> {
    const min = config.min ?? 1;
    const max = config.max ?? Number.POSITIVE_INFINITY;

    return (value) =>
      typeof value === "string" && value.length >= min && value.length <= max ? value : undefined;
  }

  static oneOf<const T extends string>(options: ReadonlyArray<T>): SearchParamParser<T> {
    return (value) => (options.includes(value as T) ? (value as T) : undefined);
  }

  static matches<T extends string = string>(pattern: RegExp): SearchParamParser<T> {
    return (value) => (typeof value === "string" && pattern.test(value) ? (value as T) : undefined);
  }

  static or<A, B>(first: SearchParamParser<A>, second: SearchParamParser<B>): SearchParamParser<A | B> {
    return (value) => first(value) ?? second(value);
  }

  static form<Shape extends SearchParamShapeType>(shape: Shape) {
    const parsers = Object.entries(shape);

    return {
      default: Object.fromEntries(parsers.map(([key]) => [key, undefined])) as SearchParamValuesType<Shape>,
      validate: (value: Record<string, unknown>): SearchParamValuesType<Shape> =>
        Object.fromEntries(
          parsers.map(([key, parse]) => [key, parse(value[key])]),
        ) as SearchParamValuesType<Shape>,
      isDefault: (search: SearchParamValuesType<Shape>): boolean =>
        parsers.every(([key]) => search[key] === undefined),
    };
  }
}

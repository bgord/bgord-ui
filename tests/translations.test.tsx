import { describe, expect, jest, spyOn, test } from "bun:test";
import { render, renderHook, screen } from "@testing-library/react";
import {
  TranslationsContext,
  type TranslationsContextValueType,
  useLanguage,
  useSupportedLanguages,
  useTranslations,
} from "../src/services/translations";

const value = {
  translations: {
    hello: "Hello",
    welcome: "Hello, {{name}}! You have {{count}} messages.",
    count: "Count: {{number}}",
    missing: "Hello, {{name}}!",
  },
  language: "en" as const,
  supportedLanguages: { en: "en" },
};

const wrapper = (props: { children: React.ReactNode; value: TranslationsContextValueType }) => (
  <TranslationsContext.Provider value={props.value}>{props.children}</TranslationsContext.Provider>
);

describe("Translations", () => {
  test("useTranslations - existing key", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current("hello")).toEqual("Hello");
  });

  test("useTranslations - returns key and warns for missing translation", () => {
    const missingKey = "missing.key";

    const mockWarn = spyOn(console, "warn").mockImplementation(jest.fn());

    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current(missingKey)).toEqual(missingKey);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(missingKey));
  });

  test("useTranslations - replaces variables", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current("welcome", { name: "John", count: 5 })).toEqual(
      "Hello, John! You have 5 messages.",
    );
  });

  test("useTranslations - numeric variable", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current("count", { number: 42 })).toEqual("Count: 42");
  });

  test("useTranslations - missing variable", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current("missing")).toEqual("Hello, {{name}}!");
  });

  test("useLanguage - happy path", () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current).toEqual("en");
  });

  test("useLanguage - updated language", () => {
    const { result, rerender } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current).toEqual("en");

    rerender();
    wrapper({
      children: result.current,
      value: { translations: {}, language: "es", supportedLanguages: { es: "es" } },
    });
    expect(result.current).toEqual("en");
  });

  test("useSupportedLanguages - happy path", () => {
    const { result } = renderHook(() => useSupportedLanguages(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current).toEqual(value.supportedLanguages);
  });

  test("integration", () => {
    function TestComponent() {
      const t = useTranslations();
      const language = useLanguage();

      return (
        <div>
          <span data-testid="translation">{t("hello")}</span>
          <span data-testid="language">{language}</span>
        </div>
      );
    }

    render(
      <TranslationsContext.Provider value={value}>
        <TestComponent />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByTestId("translation")).toHaveTextContent("Hello");
    expect(screen.getByTestId("language")).toHaveTextContent("en");
  });
});

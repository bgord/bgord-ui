import { describe, expect, jest, spyOn, test } from "bun:test";
import { render, renderHook, screen } from "@testing-library/react";
import type React from "react";
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
  describe("useTranslations", () => {
    test("existing key", () => {
      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("hello")).toEqual("Hello");
    });

    test("returns key and warns for missing translation", () => {
      const mockWarn = spyOn(console, "warn").mockImplementation(jest.fn());

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      const missingKey = "missing.key";

      expect(result.current(missingKey)).toEqual(missingKey);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(missingKey));
    });

    test("replaces variables", () => {
      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("welcome", { name: "John", count: 5 })).toEqual(
        "Hello, John! You have 5 messages.",
      );
    });

    test("numeric variable", () => {
      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("count", { number: 42 })).toEqual("Count: 42");
    });

    test("missing variable", () => {
      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("missing")).toEqual("Hello, {{name}}!");
    });
  });

  describe("useLanguage", () => {
    test("happy path", () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current).toEqual("en");
    });

    test("updated language", () => {
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
  });

  describe("useSupportedLanguages", () => {
    test("happy path", () => {
      const { result } = renderHook(() => useSupportedLanguages(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current).toEqual(value.supportedLanguages);
    });
  });

  test("component integration test", () => {
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

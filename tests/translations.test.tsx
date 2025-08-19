import { describe, expect, spyOn, test } from "bun:test";
import { render, renderHook, screen } from "@testing-library/react";
import type React from "react";
import {
  TranslationsContext,
  type TranslationsContextValueType,
  useLanguage,
  useTranslations,
} from "../src/services/translations";

describe("Translations Context and Hooks", () => {
  const mockWarn = spyOn(console, "warn");

  describe("TranslationsContextProvider", () => {
    test("renders children with provided value", () => {
      const value = {
        translations: { hello: "Hello" },
        language: "en" as const,
      };

      render(
        <TranslationsContext.Provider value={value}>
          <div>Child Component</div>
        </TranslationsContext.Provider>,
      );

      screen.getByText("Child Component");
    });

    test("renders multiple children", () => {
      const value = { translations: {}, language: "en" as const };

      render(
        <TranslationsContext.Provider value={value}>
          <div>First Child</div>
          <div>Second Child</div>
        </TranslationsContext.Provider>,
      );

      screen.getByText("First Child");
      screen.getByText("Second Child");
    });
  });

  describe("useTranslations", () => {
    const wrapper = (props: { children: React.ReactNode; value: TranslationsContextValueType }) => (
      <TranslationsContext.Provider value={props.value}>{props.children}</TranslationsContext.Provider>
    );

    test("returns translation for existing key", () => {
      const value = {
        translations: { greeting: "Hello" },
        language: "en" as const,
      };

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("greeting")).toBe("Hello");
    });

    test("returns key and warns when translation is missing", () => {
      const value = { translations: {}, language: "en" as const };

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      const missingKey = "missing.key";
      expect(result.current(missingKey)).toBe(missingKey);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining(missingKey));
    });

    test("replaces variables in translation", () => {
      const value = {
        translations: {
          welcome: "Hello, {{name}}! You have {{count}} messages.",
        },
        language: "en" as const,
      };

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("welcome", { name: "John", count: 5 })).toBe("Hello, John! You have 5 messages.");
    });

    test("handles numeric variable values", () => {
      const value = {
        translations: { count: "Count: {{number}}" },
        language: "en" as const,
      };

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("count", { number: 42 })).toBe("Count: 42");
    });

    test("handles missing variables gracefully", () => {
      const value = {
        translations: { test: "Hello, {{name}}!" },
        language: "en" as const,
      };

      const { result } = renderHook(() => useTranslations(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current("test")).toBe("Hello, {{name}}!");
    });
  });

  describe("useLanguage", () => {
    const wrapper = (props: { children: React.ReactNode; value: TranslationsContextValueType }) => (
      <TranslationsContext.Provider value={props.value}>{props.children}</TranslationsContext.Provider>
    );

    test("returns current language", () => {
      const value = { translations: {}, language: "fr" as const };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => wrapper({ children, value }),
      });

      expect(result.current).toBe("fr");
    });

    test("updates when language changes", () => {
      const initialValue = { translations: {}, language: "en" as const };

      const { result, rerender } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => wrapper({ children, value: initialValue }),
      });

      expect(result.current).toBe("en");

      const newValue = { translations: {}, language: "es" as const };

      rerender();
      wrapper({ children: result.current, value: newValue });
      expect(result.current).toBe("en");
    });
  });

  describe("Integration Tests", () => {
    test("works in a component context", () => {
      function TestComponent() {
        const translate = useTranslations();
        const language = useLanguage();

        return (
          <div>
            <span data-testid="translation">{translate("welcome", { name: "Test" })}</span>
            <span data-testid="language">{language}</span>
          </div>
        );
      }

      const value = {
        translations: { welcome: "Welcome, {{name}}!" },
        language: "en" as const,
      };

      render(
        <TranslationsContext.Provider value={value}>
          <TestComponent />
        </TranslationsContext.Provider>,
      );

      expect(screen.getByTestId("translation")).toHaveTextContent("Welcome, Test!");
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });
  });
});

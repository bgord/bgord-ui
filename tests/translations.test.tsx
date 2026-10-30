/* cSpell:disable */
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

const plurals = {
  en: {
    translations: {
      articles: "{{count}} {{count|one=article|other=articles}}",
      named: "{{name}}: {{count}} {{count|one=article|other=articles}}",
    },
    language: "en",
    supportedLanguages: { en: "en", pl: "pl" },
  },
  pl: {
    translations: {
      articles: "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
      window:
        "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}} w {{days}} {{days|one=dniu|other=dniach}}",
      days: "{{days}} {{days|other=dniu}}",
      incomplete: "{{count}} {{count|one=artykuł}}",
    },
    language: "pl",
    supportedLanguages: { en: "en", pl: "pl" },
  },
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
    using mockWarn = spyOn(console, "warn").mockImplementation(jest.fn());
    const missingKey = "missing.key";

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

  test("useTranslations - special characters in value", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value }),
    });

    expect(result.current("missing", { name: "$& $$" })).toEqual("Hello, $& $$!");
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

  test("useTranslations - plural - en", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.en }),
    });

    expect(result.current("articles", { count: 1 })).toEqual("1 article");
    expect(result.current("articles", { count: 2 })).toEqual("2 articles");
    expect(result.current("articles", { count: 0 })).toEqual("0 articles");
  });

  test("useTranslations - plural - pl", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("articles", { count: 1 })).toEqual("1 artykuł");
    expect(result.current("articles", { count: 3 })).toEqual("3 artykuły");
    expect(result.current("articles", { count: 5 })).toEqual("5 artykułów");
    expect(result.current("articles", { count: 22 })).toEqual("22 artykuły");
    expect(result.current("articles", { count: 1.5 })).toEqual("1.5 artykułu");
  });

  test("useTranslations - plural - string variable", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("articles", { count: "3" })).toEqual("3 artykuły");
  });

  test("useTranslations - plural - multiple blocks", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("window", { count: 1, days: 7 })).toEqual("1 artykuł w 7 dniach");
  });

  test("useTranslations - plural - falls back to other", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("days", { days: 1 })).toEqual("1 dniu");
  });

  test("useTranslations - plural - missing form", () => {
    using mockWarn = spyOn(console, "warn").mockImplementation(jest.fn());
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("incomplete", { count: 5 })).toEqual("5 {{count|one=artykuł}}");
    expect(mockWarn).toHaveBeenCalledWith("[@bgord/ui] missing plural form: many for key: incomplete");
  });

  test("useTranslations - plural - missing variable", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("articles", { other: 1 })).toEqual(
      "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
    );
  });

  test("useTranslations - plural - no variables", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.pl }),
    });

    expect(result.current("articles")).toEqual(
      "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
    );
  });

  test("useTranslations - plural - variable value is not parsed", () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => wrapper({ children, value: plurals.en }),
    });

    expect(result.current("named", { name: "{{count|one=x|other=y}}", count: 1 })).toEqual(
      "{{count|one=x|other=y}}: 1 article",
    );
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

    expect(screen.getByTestId("translation").textContent).toEqual("Hello");
    expect(screen.getByTestId("language").textContent).toEqual("en");
  });
});

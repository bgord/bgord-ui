import { createContext, use, useCallback } from "react";
import { type PluralizeOptionsType, pluralize } from "./pluralize";

export type TranslationsKeyType = string;

export type TranslationsValueType = string;

export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;

type TranslationPlaceholderType = string;

type TranslationPlaceholderValueType = string | number;

type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export type TranslationsContextValueType = {
  translations: TranslationsType;
  language: string;
  supportedLanguages: Record<string, string>;
};

export const TranslationsContext = createContext<TranslationsContextValueType>({
  translations: {},
  language: "en",
  supportedLanguages: { en: "en" },
});

export function useTranslations() {
  const value = use(TranslationsContext);

  if (value === undefined) throw new Error("useTranslations must be used within the TranslationsContext");

  const translate = useCallback(
    (key: TranslationsKeyType, variables?: TranslationVariableType) => {
      const translation = value.translations[key];

      if (!translation) {
        // biome-ignore lint: lint/suspicious/noConsole
        console.warn(`[@bgord/ui] missing translation for key: ${key}`);
        return key;
      }

      if (!variables) return translation;

      return Object.entries(variables).reduce((result, [placeholder, value]) => {
        return result.replace(new RegExp(`{{${placeholder}}}`, "g"), String(value));
      }, translation);
    },
    [value.translations],
  );

  return translate;
}

export function useLanguage(): TranslationsContextValueType["language"] {
  const value = use(TranslationsContext);

  if (value === undefined) throw new Error("useLanguage must be used within the TranslationsContext");
  return value.language;
}

export function useSupportedLanguages(): TranslationsContextValueType["supportedLanguages"] {
  const value = use(TranslationsContext);

  if (value === undefined) {
    throw new Error("useSupportedLanguages must be used within the TranslationsContext");
  }
  return value.supportedLanguages;
}

export function usePluralize() {
  const language = useLanguage();

  return (options: Omit<PluralizeOptionsType, "language">) => pluralize({ ...options, language });
}

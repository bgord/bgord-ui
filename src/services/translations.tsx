import { createContext, use, useCallback, useMemo } from "react";

export type TranslationsKeyType = string;

export type TranslationsValueType = string;

export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;

type TranslationPlaceholderType = string;

type TranslationPlaceholderValueType = string | number;

type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export type TranslateType = (key: TranslationsKeyType, variables?: TranslationVariableType) => string;

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

const TranslationPluralBlock = /\{\{(\w+)\|([^{}]*)\}\}/g;

export function useTranslations(): TranslateType {
  const value = use(TranslationsContext);

  const plurals = useMemo(() => new Intl.PluralRules(value.language), [value.language]);

  const translate = useCallback<TranslateType>(
    (key, variables) => {
      const translation = value.translations[key];

      if (!translation) {
        // biome-ignore lint: lint/suspicious/noConsole
        console.warn(`[@bgord/ui] missing translation for key: ${key}`);
        return key;
      }

      if (!variables) return translation;

      const pluralized = translation.replaceAll(
        TranslationPluralBlock,
        (block, placeholder: TranslationPlaceholderType, forms: string) => {
          const variable = variables[placeholder];

          if (variable === undefined) return block;

          const category = plurals.select(Number(variable));
          const candidates = new Map(forms.split("|").map((form) => form.split("=") as [string, string]));
          const form = candidates.get(category) ?? candidates.get("other");

          if (form === undefined) {
            // biome-ignore lint: lint/suspicious/noConsole
            console.warn(`[@bgord/ui] missing plural form: ${category} for key: ${key}`);
            return block;
          }

          return form;
        },
      );

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) => result.replaceAll(`{{${placeholder}}}`, () => String(value)),
        pluralized,
      );
    },
    [value.translations, plurals],
  );

  return translate;
}

export function useLanguage(): TranslationsContextValueType["language"] {
  return use(TranslationsContext).language;
}

export function useSupportedLanguages(): TranslationsContextValueType["supportedLanguages"] {
  return use(TranslationsContext).supportedLanguages;
}

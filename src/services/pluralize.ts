import { polishPlurals } from "polish-plurals";

type PluralizeWordType = string;
type PluralizeValueType = number | null | undefined;

export type PluralizeOptionsType = {
  value: PluralizeValueType;
  singular: PluralizeWordType;
  plural?: PluralizeWordType;
  genitive?: PluralizeWordType;
  language: string;
};

enum PluralizationSupportedLanguages {
  en = "en",
  pl = "pl",
}

export function pluralize(options: PluralizeOptionsType): PluralizeWordType {
  switch (options.language) {
    case PluralizationSupportedLanguages.en: {
      if (options.value === 1) return options.singular;
      return options.plural ?? `${options.singular}s`;
    }

    case PluralizationSupportedLanguages.pl: {
      if (options.value === 1) return options.singular;
      return polishPlurals(
        options.singular,
        String(options.plural),
        String(options.genitive),
        options.value ?? 1,
      );
    }

    default: {
      // biome-ignore lint: lint/suspicious/noConsole
      console.warn(`[@bgord/ui] missing pluralization function for language: ${options.language}.`);
      return options.singular;
    }
  }
}

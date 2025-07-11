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

/**
 * Pluralizes words based on count and language
 * @param options - Pluralization configuration
 * @param options.value - Number determining plural form
 * @param options.singular - Singular form
 * @param options.plural - Optional plural form (defaults to singular + 's' for English)
 * @param options.genitive - Optional genitive form for Polish
 * @param options.language - Language code ('en'|'pl')
 * @returns Pluralized word
 */
export function pluralize(options: PluralizeOptionsType): PluralizeWordType {
  if (options.language === PluralizationSupportedLanguages.en) {
    const plural = options.plural ?? `${options.singular}s`;

    if (options.value === 1) return options.singular;

    return plural;
  }

  if (options.language === PluralizationSupportedLanguages.pl) {
    const value = options.value ?? 1;

    if (value === 1) return options.singular;

    return polishPlurals(options.singular, String(options.plural), String(options.genitive), value);
  }

  console.warn(`[@bgord/frontend] missing pluralization function for language ${options.language}.`);

  return options.singular;
}

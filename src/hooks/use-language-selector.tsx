// cspell:disable
import Cookies from "js-cookie";
import { useCallback, useEffect } from "react";
import { useRevalidator } from "react-router";
import { Field } from "../services/field";
import { useLanguage } from "../services/translations";
import { useClientFilter, type useClientFilterReturnType } from "./use-client-filter";

type LanguageType = string;

export function useLanguageSelector(
  supportedLanguages: Record<LanguageType, LanguageType>,
): useClientFilterReturnType<LanguageType> {
  const language = useLanguage();
  const revalidator = useRevalidator();

  const field = useClientFilter<LanguageType>({
    enum: supportedLanguages,
    defaultValue: language,
    name: "language",
  });

  const handleLanguageChange = useCallback(() => {
    const current = new Field(field.currentValue);

    if (!current.isEmpty() && field.changed) {
      Cookies.set("language", String(current.get()));
      revalidator.revalidate();
    }
  }, [field.currentValue, field.changed]);

  useEffect(() => {
    handleLanguageChange();
  }, [handleLanguageChange]);

  return field;
}

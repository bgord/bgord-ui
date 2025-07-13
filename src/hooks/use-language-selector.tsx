import Cookies from "js-cookie";
import { useCallback, useEffect } from "react";
import { Field } from "../services/field";
import { getSafeWindow } from "../services/get-safe-window";
import { useLanguage } from "../services/translations";
import { useClientFilter, useClientFilterReturnType } from "./use-client-filter";

type LanguageType = string;

export function useLanguageSelector(
  supportedLanguages: Record<LanguageType, LanguageType>,
): useClientFilterReturnType<LanguageType> {
  const language = useLanguage();

  const field = useClientFilter<LanguageType>({
    enum: supportedLanguages,
    defaultValue: language,
    name: "language",
  });

  const handleLanguageChange = useCallback(() => {
    const safeWindow = getSafeWindow();
    if (!safeWindow) return;

    const current = new Field(field.currentValue);
    if (!current.isEmpty() && field.changed) {
      Cookies.set("accept-language", String(current.get()));
      safeWindow.document.location.reload();
    }
  }, [field.currentValue, field.changed]);

  useEffect(() => {
    handleLanguageChange();
  }, [handleLanguageChange]);

  return field;
}

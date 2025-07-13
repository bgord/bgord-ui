// cspell:disable
import { describe, expect, jest, spyOn, test } from "bun:test";
import { renderHook } from "@testing-library/react";

import Cookies from "js-cookie";
import * as RR from "react-router";
import * as clientFilterHook from "../src/hooks/use-client-filter";
import { useLanguageSelector } from "../src/hooks/use-language-selector";
import * as translationsService from "../src/services/translations";

function createStubRevalidator() {
  return {
    revalidate: () => {},
    state: "idle" as RR.RevalidationState,
  };
}

describe("useLanguageSelector", () => {
  test("does nothing on initial render when field.changed is false", () => {
    jest.restoreAllMocks();

    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);

    const stubRevalidator = createStubRevalidator();
    const revalidateSpy = spyOn(stubRevalidator, "revalidate");

    spyOn(RR, "useRevalidator").mockReturnValue(stubRevalidator as any);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "en",
      changed: false,
    } as any);

    renderHook(() => useLanguageSelector({ en: "English", pl: "Polski" }));

    expect(setSpy).toHaveBeenCalledTimes(0);
    expect(revalidateSpy).toHaveBeenCalledTimes(0);
  });

  test("writes cookie and triggers revalidation when language actually changes", () => {
    jest.restoreAllMocks();

    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);

    const stubRevalidator = createStubRevalidator();
    const revalidateSpy = spyOn(stubRevalidator, "revalidate");

    spyOn(RR, "useRevalidator").mockReturnValue(stubRevalidator as any);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "pl",
      changed: true,
    } as any);

    renderHook(() => useLanguageSelector({ en: "English", pl: "Polski" }));

    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith("language", "pl");
    expect(revalidateSpy).toHaveBeenCalledTimes(1);
  });

  test("ignores empty currentValue even if changed is true", () => {
    jest.restoreAllMocks();

    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);

    const stubRevalidator = createStubRevalidator();
    const revalidateSpy = spyOn(stubRevalidator, "revalidate");

    spyOn(RR, "useRevalidator").mockReturnValue(stubRevalidator as any);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "",
      changed: true,
    } as any);

    renderHook(() => useLanguageSelector({ en: "English", pl: "Polski" }));

    expect(setSpy).toHaveBeenCalledTimes(0);
    expect(revalidateSpy).toHaveBeenCalledTimes(0);
  });
});

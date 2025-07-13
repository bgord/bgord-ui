import { describe, expect, jest, spyOn, test } from "bun:test";
import { renderHook } from "@testing-library/react";

import Cookies from "js-cookie";
import * as clientFilterHook from "../src/hooks/use-client-filter";
// Hook under test
import { useLanguageSelector } from "../src/hooks/use-language-selector";
import * as windowService from "../src/services/get-safe-window";
import * as translationsService from "../src/services/translations";

describe("useLanguageSelector", () => {
  test("does nothing on initial render when field.changed is false", () => {
    jest.restoreAllMocks();

    // ── spies & stubs local to this test ──────────────────────────────
    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);
    // @ts-expect-error
    spyOn(Cookies, "get").mockReturnValue(undefined);

    const fakeWindow = {
      document: { location: { reload() {} } },
    } as unknown as Window;

    const reloadSpy = spyOn(fakeWindow.document.location, "reload");

    // @ts-expect-error
    spyOn(windowService, "getSafeWindow").mockReturnValue(fakeWindow);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "en",
      changed: false,
    } as any);

    // ── act ──────────────────────────────────────────────────────────
    renderHook(() => useLanguageSelector({ en: "en", pl: "pl" }));

    // ── assert ───────────────────────────────────────────────────────
    expect(setSpy).toHaveBeenCalledTimes(0);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  test("writes cookie and triggers reload when language actually changes", () => {
    jest.restoreAllMocks();

    // ── spies & stubs ────────────────────────────────────────────────
    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);
    // @ts-expect-error
    spyOn(Cookies, "get").mockReturnValue("en");

    const fakeWindow = {
      document: { location: { reload() {} } },
    } as unknown as Window;

    const reloadSpy = spyOn(fakeWindow.document.location, "reload");

    // @ts-expect-error
    spyOn(windowService, "getSafeWindow").mockReturnValue(fakeWindow);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "pl",
      changed: true,
    } as any);

    // ── act ──────────────────────────────────────────────────────────
    renderHook(() => useLanguageSelector({ en: "en", pl: "pl" }));

    // ── assert ───────────────────────────────────────────────────────
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith("accept-language", "pl");
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  test("ignores empty currentValue even if changed is true", () => {
    jest.restoreAllMocks();

    // ── spies & stubs ────────────────────────────────────────────────
    const setSpy = spyOn(Cookies, "set").mockImplementation(() => undefined as any);
    // @ts-expect-error
    spyOn(Cookies, "get").mockReturnValue("en");

    const fakeWindow = {
      document: { location: { reload() {} } },
    } as unknown as Window;

    const reloadSpy = spyOn(fakeWindow.document.location, "reload");

    // @ts-expect-error
    spyOn(windowService, "getSafeWindow").mockReturnValue(fakeWindow);
    spyOn(translationsService, "useLanguage").mockReturnValue("en");
    spyOn(clientFilterHook, "useClientFilter").mockReturnValue({
      currentValue: "",
      changed: true,
    } as any);

    // ── act ──────────────────────────────────────────────────────────
    renderHook(() => useLanguageSelector({ en: "en", pl: "pl" }));

    // ── assert ───────────────────────────────────────────────────────
    expect(setSpy).toHaveBeenCalledTimes(0);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });
});

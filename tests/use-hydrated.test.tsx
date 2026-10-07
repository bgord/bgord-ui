import { describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useHydrated } from "../src/hooks/use-hydrated";

function Testcase() {
  return String(useHydrated());
}

describe("useHydrated", () => {
  test("client", () => {
    const { result } = renderHook(() => useHydrated());

    expect(result.current).toEqual(true);
  });

  test("server", () => {
    const html = renderToString(<Testcase />);

    expect(html).toEqual("false");
  });
});

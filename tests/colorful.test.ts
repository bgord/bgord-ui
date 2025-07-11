import { describe, expect, test } from "bun:test";
import { Colorful } from "../src/services/colorful";

describe("Colorful", () => {
  const cases = ["brand-50", "primary", "accent-200", ""] as const;

  cases.forEach((token) => {
    test(`returns correct shape for "${token}"`, () => {
      const result = Colorful(token);

      const cssVar = `var(--${token})`;

      const expected = {
        color: { color: cssVar },
        background: { background: cssVar },
        style: {
          color: { style: { color: cssVar } },
          background: { style: { background: cssVar } },
        },
      };

      expect(result).toEqual(expected);
    });
  });
});

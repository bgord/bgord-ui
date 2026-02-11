import { describe, expect, spyOn, test } from "bun:test";
import { Clipboard } from "../src/services/clipboard";

describe("Clipboard", () => {
  test("copy", async () => {
    const options = { onSuccess: () => {}, text: "test" };
    using onSuccessSpy = spyOn(options, "onSuccess");
    using clipboardWriteSpy = spyOn(navigator.clipboard, "writeText");

    await Clipboard.copy(options);

    expect(clipboardWriteSpy).toHaveBeenCalledWith(options.text);
    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
  });
});

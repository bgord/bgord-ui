import { describe, expect, spyOn, test } from "bun:test";
import { Clipboard } from "../src/services/clipboard";

describe("Clipboard", () => {
  test("copy", async () => {
    const options = { onSuccess: () => {}, text: "test" };
    const onSuccessSpy = spyOn(options, "onSuccess");
    const clipboardWriteSpy = spyOn(navigator.clipboard, "writeText");

    await Clipboard.copy(options);

    expect(clipboardWriteSpy).toHaveBeenCalledWith(options.text);
    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
  });
});

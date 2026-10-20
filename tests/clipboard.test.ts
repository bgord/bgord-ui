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

  test("copy - no clipboard", async () => {
    const options = { onSuccess: () => {}, text: "test" };
    using onSuccessSpy = spyOn(options, "onSuccess");
    using cleanup = new DisposableStack();
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    cleanup.defer(() => Reflect.deleteProperty(navigator, "clipboard"));

    await Clipboard.copy(options);

    expect(onSuccessSpy).not.toHaveBeenCalled();
  });
});

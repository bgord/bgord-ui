import { noop } from "./noop";

export type CopyToClipboardOptionsType = { text: string; onSuccess?: VoidFunction };

export class Clipboard {
  static async copy(options: CopyToClipboardOptionsType) {
    const onSuccess = options.onSuccess ?? noop;

    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(options.text);
    onSuccess();
  }
}

import { noop } from "./noop";

type CopyToClipboardTextType = string;
type OnCopyToClipboardFailureType = (error?: unknown) => void;
type OnCopyToClipboardSuccessType = VoidFunction;

const defaultOnCopyToClipboardFailure: OnCopyToClipboardFailureType = () =>
  console.warn("Copying to clipboard not supported");

export type CopyToClipboardOptionsType = {
  text: CopyToClipboardTextType;
  onFailure?: OnCopyToClipboardFailureType;
  onSuccess?: OnCopyToClipboardSuccessType;
};

// TODO: tests
export async function copyToClipboard(options: CopyToClipboardOptionsType) {
  const onFailure = options.onFailure ?? defaultOnCopyToClipboardFailure;
  const onSuccess = options.onSuccess ?? noop;

  if (!navigator.clipboard) onFailure();

  try {
    await navigator.clipboard.writeText(options.text);
    onSuccess();
  } catch (error) {
    onFailure(error);
  }
}

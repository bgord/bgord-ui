export function getSafeWindow() {
  if (typeof window === "undefined") return undefined;
  return window;
}

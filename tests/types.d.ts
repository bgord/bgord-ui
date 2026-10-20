import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { DetachedWindowAPI } from "happy-dom";

declare module "bun:test" {
  interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}

declare global {
  interface Window {
    happyDOM: DetachedWindowAPI;
  }
}

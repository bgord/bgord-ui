// cspell:ignore registrator
import { afterEach, setSystemTime } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const { cleanup } = await import("@testing-library/react");

afterEach(() => {
  cleanup();
  setSystemTime();
});

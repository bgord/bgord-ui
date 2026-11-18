import { afterEach, jest, setSystemTime } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost/" });

const { cleanup } = await import("@testing-library/react");

afterEach(() => {
  cleanup();
  setSystemTime();
  jest.useRealTimers();
});

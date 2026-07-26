// cspell:ignore registrator
import { expect } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const matchers = await import("@testing-library/jest-dom/matchers");

expect.extend(matchers as any);

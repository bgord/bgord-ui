import { beforeEach, expect, jest } from "bun:test";
// cspell:disable-next-line
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as matchers from "@testing-library/jest-dom/matchers";

// cspell:disable-next-line
GlobalRegistrator.register();

expect.extend(matchers);

beforeEach(() => jest.restoreAllMocks());

import { describe, expect, spyOn, test } from "bun:test";
import { exec } from "../src/services/exec";

describe("exec", () => {
  test("happy path", () => {
    const handlers = { mutate: () => {}, cleanup: () => {} };
    const mutateSpy = spyOn(handlers, "mutate");
    const cleanupSpy = spyOn(handlers, "cleanup");

    exec([handlers.mutate, handlers.cleanup])();

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });
});

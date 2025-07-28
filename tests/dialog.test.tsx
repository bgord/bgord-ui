// Dialog.test.tsx
import { describe, test, beforeAll, afterEach, expect, jest } from "bun:test";

import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { Dialog } from "../src/components/dialog";
import * as hooks from "../src/hooks";

const showSpy = jest.fn();
const closeSpy = jest.fn();

beforeAll(() => {
  Object.assign(HTMLDialogElement.prototype, { showModal: showSpy, close: closeSpy });
});

afterEach(() => {
  cleanup();
  showSpy.mockClear();
  closeSpy.mockClear();
});

function Harness({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const toggle = hooks.useToggle({ name: "demo", defaultValue: defaultOpen });

  return (
    <>
      <button data-testid="open" onClick={toggle.enable} />
      <button data-testid="close" onClick={toggle.disable} />
      <Dialog {...toggle} data-testid="dlg" />
    </>
  );
}

describe("Dialog component", () => {
  test("calls showModal() once when opened", () => {
    render(<Harness defaultOpen={true} />);
    expect(showSpy).toHaveBeenCalledTimes(1);
  });

  test("calls close() when closed programmatically via toggle.disable", async () => {
    const { getByTestId } = render(<Harness defaultOpen={true} />);

    fireEvent.click(getByTestId("close")); // trigger toggle.disable()

    await waitFor(() => expect(closeSpy).toHaveBeenCalledTimes(1));
    expect(getByTestId("dlg").dataset.disp).toBe("none");
  });

  test("ESC key closes the dialog", async () => {
    const { getByTestId } = render(<Harness defaultOpen={true} />);
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(getByTestId("dlg").dataset.disp).toBe("none");
    });
  });

  test("clicking outside closes the dialog", async () => {
    const { getByTestId } = render(<Harness defaultOpen={true} />);
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(getByTestId("dlg").dataset.disp).toBe("none");
    });
  });

  test("body scroll locked on open and released on close", async () => {
    const { getByTestId } = render(<Harness defaultOpen={true} />);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(getByTestId("close"));

    await waitFor(() => expect(document.body.style.overflow).toBe(""));
  });
});

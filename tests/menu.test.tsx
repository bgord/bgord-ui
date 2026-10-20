import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Menu,
  MenuContent,
  MenuFooter,
  MenuItem,
  MenuLink,
  MenuSeparator,
  MenuTrigger,
} from "../src/components/menu";

function Testcase() {
  return (
    <>
      <Menu name="demo">
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent>
          <MenuItem>Copy</MenuItem>
          <MenuItem onClick={(event) => event.preventDefault()}>Stay</MenuItem>
          <MenuItem disabled>Disabled</MenuItem>
          <MenuLink href="#export">Export</MenuLink>
          <MenuSeparator />
          <MenuItem tone="danger">Delete</MenuItem>
          <MenuFooter>Updated</MenuFooter>
        </MenuContent>
      </Menu>
      <button type="button">Outside</button>
    </>
  );
}

afterEach(() => cleanup());

describe("Menu component", () => {
  test("closed by default", () => {
    render(<Testcase />);

    expect(screen.getByRole("button", { name: "More actions" }).getAttribute("aria-expanded")).toEqual(
      "false",
    );
    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
  });

  test("open - click", () => {
    render(<Testcase />);

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("button", { name: "More actions" }).getAttribute("aria-expanded")).toEqual(
      "true",
    );
    expect(screen.getByRole("menu").getAttribute("data-disp")).toEqual("flex");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy" }));
  });

  test("open - ArrowDown", () => {
    render(<Testcase />);

    fireEvent.keyDown(screen.getByRole("button", { name: "More actions" }), { key: "ArrowDown" });

    expect(screen.getByRole("menu").getAttribute("data-disp")).toEqual("flex");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy" }));
  });

  test("close - click trigger", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "More actions" }));
  });

  test("close - Escape", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "Escape" });

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "More actions" }));
  });

  test("close - click outside", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
  });

  test("close - focus leaves", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.blur(screen.getByRole("menuitem", { name: "Copy" }), {
      relatedTarget: screen.getByRole("button", { name: "Outside" }),
    });

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
  });

  test("item - closes on select", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "More actions" }));
  });

  test("item - stays open on preventDefault", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Stay" }));

    expect(screen.getByRole("menu").getAttribute("data-disp")).toEqual("flex");
  });

  test("link - closes on select", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Export" }));

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "More actions" }));
  });

  test("link - stays open on preventDefault", () => {
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent>
          <MenuLink href="#export" onClick={(event) => event.preventDefault()}>
            Export
          </MenuLink>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Export" }));

    expect(screen.getByRole("menu").getAttribute("data-disp")).toEqual("flex");
  });

  test("link - tone", () => {
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent>
          <MenuLink href="#export">Export</MenuLink>
          <MenuLink href="#delete" tone="danger">
            Delete
          </MenuLink>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Export" }).getAttribute("data-color")).toEqual(
      "neutral-200",
    );
    expect(screen.getByRole("menuitem", { name: "Delete" }).getAttribute("data-color")).toEqual("danger-400");
  });

  test("trigger - title from aria-label", () => {
    render(<Testcase />);

    expect(screen.getByRole("button", { name: "More actions" }).getAttribute("title")).toEqual(
      "More actions",
    );
  });

  test("trigger - onClick", () => {
    const onClick = jest.fn();
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions" onClick={onClick}>
          ...
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menu").getAttribute("data-disp")).toEqual("flex");
  });

  test("trigger - onClick - preventDefault", () => {
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions" onClick={(event) => event.preventDefault()}>
          ...
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
  });

  test("menu - onKeyDown", () => {
    const onKeyDown = jest.fn();
    render(
      <Menu name="demo" onKeyDown={onKeyDown}>
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent>
          <MenuItem>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "Escape" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menu", { hidden: true }).getAttribute("data-disp")).toEqual("none");
  });

  test("content - onKeyDown", () => {
    const onKeyDown = jest.fn();
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent onKeyDown={onKeyDown}>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Delete</MenuItem>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "ArrowDown" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Delete" }));
  });

  test("content - style", () => {
    render(
      <Menu name="demo">
        <MenuTrigger aria-label="More actions">...</MenuTrigger>
        <MenuContent style={{ color: "red" }}>
          <MenuItem>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menu").style.color).toEqual("red");
    expect(screen.getByRole("menu").style.top).toEqual("calc(100% + var(--spacing-1-5))");
  });

  test("item - tone", () => {
    render(<Testcase />);

    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Copy" }).getAttribute("data-color")).toEqual("neutral-200");
    expect(screen.getByRole("menuitem", { name: "Delete" }).getAttribute("data-color")).toEqual("danger-400");
  });

  test("navigation - ArrowDown skips disabled and wraps", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Stay" }), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Export" }), { key: "ArrowDown" });

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Delete" }), { key: "ArrowDown" });

    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy" }));
  });

  test("navigation - ArrowUp wraps", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "ArrowUp" });

    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Delete" }));
  });

  test("navigation - Home and End", () => {
    render(<Testcase />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "End" });

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Delete" }), { key: "Home" });

    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy" }));
  });

  test("useMenu - outside Menu", () => {
    expect(() => render(<MenuItem>Orphan</MenuItem>)).toThrow("useMenu must be used within Menu");
  });
});

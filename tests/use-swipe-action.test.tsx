import { describe, expect, jest, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { type UseSwipeActionConfig, useSwipeAction } from "../src/hooks/use-swipe-action";

function Row(props: UseSwipeActionConfig) {
  const swipe = useSwipeAction(props);

  return (
    <div
      data-direction={swipe.direction ?? "none"}
      data-kind={swipe.state.kind}
      data-testid="row"
      style={{ translate: swipe.translate }}
      {...swipe.handlers}
    />
  );
}

const touch = { isPrimary: true, pointerType: "touch" };

describe("useSwipeAction", () => {
  test("idle", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    expect(row.dataset.kind).toEqual("idle");
    expect(row.dataset.direction).toEqual("none");
    expect(row.style.translate).toEqual("0px");
  });

  test("dead zone", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 108 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.dataset.direction).toEqual("none");
    expect(row.style.translate).toEqual("0px");
  });

  test("follows the touch - right", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.dataset.direction).toEqual("right");
    expect(row.style.translate).toEqual("50px");
  });

  test("follows the touch - left", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 50 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.dataset.direction).toEqual("left");
    expect(row.style.translate).toEqual("-50px");
  });

  test("follows the touch back into the dead zone", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    fireEvent.pointerMove(row, { ...touch, clientX: 104 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.dataset.direction).toEqual("right");
    expect(row.style.translate).toEqual("4px");
  });

  test("armed at the threshold", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 4 });

    expect(row.dataset.kind).toEqual("armed");
    expect(row.dataset.direction).toEqual("left");
    expect(row.style.translate).toEqual("-96px");
  });

  test("armed - custom threshold", () => {
    render(<Row onSwipe={jest.fn()} threshold={60} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 160 });

    expect(row.dataset.kind).toEqual("armed");
    expect(row.style.translate).toEqual("60px");
  });

  test("disarmed by pulling back", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 250 });

    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.style.translate).toEqual("50px");
  });

  test("pulling - ignores another touch", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    fireEvent.pointerDown(row, { ...touch, clientX: 300 });
    fireEvent.pointerMove(row, { ...touch, clientX: 160 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.style.translate).toEqual("60px");
  });

  test("ignores a vertical drag", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 104, clientY: 160 });
    fireEvent.pointerMove(row, { ...touch, clientX: 250, clientY: 160 });

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("ignores a diagonal drag", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 120, clientY: 120 });

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("keeps swiping after vertical drift", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150, clientY: 100 });

    fireEvent.pointerMove(row, { ...touch, clientX: 160, clientY: 300 });

    expect(row.dataset.kind).toEqual("pulling");
    expect(row.style.translate).toEqual("60px");
  });

  test("ignores mouse", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, pointerType: "mouse", clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, pointerType: "mouse", clientX: 250 });

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("ignores secondary pointers", () => {
    render(<Row onSwipe={jest.fn()} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, isPrimary: false, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 250 });

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("disabled", () => {
    const onSwipe = jest.fn();
    render(<Row enabled={false} onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 250 });
    fireEvent.pointerUp(row, touch);

    expect(onSwipe).not.toHaveBeenCalled();
    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("springs back below the threshold", () => {
    const onSwipe = jest.fn();
    render(<Row onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    fireEvent.pointerUp(row, touch);

    expect(onSwipe).not.toHaveBeenCalled();
    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("springs back on a tap", () => {
    const onSwipe = jest.fn();
    render(<Row onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });

    fireEvent.pointerUp(row, touch);

    expect(onSwipe).not.toHaveBeenCalled();
    expect(row.dataset.kind).toEqual("idle");
  });

  test("springs back on cancel", () => {
    const onSwipe = jest.fn();
    render(<Row onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 250 });

    fireEvent.pointerCancel(row, touch);

    expect(onSwipe).not.toHaveBeenCalled();
    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("commits when released armed - right", () => {
    const onSwipe = jest.fn(() => new Promise(() => {}));
    render(<Row onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 200 });

    fireEvent.pointerUp(row, touch);

    expect(onSwipe).toHaveBeenCalledWith("right");
    expect(row.dataset.kind).toEqual("committed");
    expect(row.dataset.direction).toEqual("right");
    expect(row.style.translate).toEqual("100%");
  });

  test("commits when released armed - left", () => {
    const onSwipe = jest.fn(() => new Promise(() => {}));
    render(<Row onSwipe={onSwipe} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 200 });
    fireEvent.pointerMove(row, { ...touch, clientX: 100 });

    fireEvent.pointerUp(row, touch);

    expect(onSwipe).toHaveBeenCalledWith("left");
    expect(row.dataset.kind).toEqual("committed");
    expect(row.dataset.direction).toEqual("left");
    expect(row.style.translate).toEqual("-100%");
  });

  test("committed - ignores touches", () => {
    render(<Row onSwipe={() => new Promise(() => {})} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 200 });
    fireEvent.pointerUp(row, touch);

    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 150 });

    expect(row.dataset.kind).toEqual("committed");
    expect(row.style.translate).toEqual("100%");
  });

  test("stays committed after the action", async () => {
    render(<Row onSwipe={() => Promise.resolve(new Response())} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 200 });

    await act(async () => fireEvent.pointerUp(row, touch));

    expect(row.dataset.kind).toEqual("committed");
    expect(row.style.translate).toEqual("100%");
  });

  test("springs back after an unsuccessful action", async () => {
    render(<Row onSwipe={() => Promise.resolve(undefined)} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 200 });

    await act(async () => fireEvent.pointerUp(row, touch));

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });

  test("springs back after a failed action", async () => {
    render(<Row onSwipe={() => Promise.reject(new Error("failure"))} />);
    const row = screen.getByTestId("row");
    fireEvent.pointerDown(row, { ...touch, clientX: 100 });
    fireEvent.pointerMove(row, { ...touch, clientX: 200 });

    await act(async () => fireEvent.pointerUp(row, touch));

    expect(row.dataset.kind).toEqual("idle");
    expect(row.style.translate).toEqual("0px");
  });
});

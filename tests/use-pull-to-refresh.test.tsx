import { describe, expect, jest, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { type UsePullToRefreshConfig, usePullToRefresh } from "../src/hooks/use-pull-to-refresh";

function Feed(props: UsePullToRefreshConfig) {
  const pull = usePullToRefresh(props);

  return (
    <div
      data-distance={pull.state.distance}
      data-kind={pull.state.kind}
      data-testid="feed"
      {...pull.handlers}
    />
  );
}

describe("usePullToRefresh", () => {
  test("idle", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("follows the touch at half speed", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 160 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("30");
  });

  test("ignores pulling up", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 40 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("armed at the threshold", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 228 }] });

    expect(feed.dataset.kind).toEqual("armed");
    expect(feed.dataset.distance).toEqual("64");
  });

  test("armed - capped distance", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 500 }] });

    expect(feed.dataset.kind).toEqual("armed");
    expect(feed.dataset.distance).toEqual("64");
  });

  test("disarmed by pulling back", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 200 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("50");
  });

  test("pulling - ignores another touch", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 160 }] });

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 180 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("40");
  });

  test("dead zone", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 104, clientY: 108 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("ignores a horizontal swipe", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 160, clientY: 104 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 160, clientY: 300 }] });

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("ignores a diagonal swipe", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 120, clientY: 120 }] });

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("keeps pulling after horizontal drift", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 160 }] });

    fireEvent.touchMove(feed, { touches: [{ clientX: 300, clientY: 200 }] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("50");
  });

  test("ignores touches without points", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [] });

    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("ignores moves without points", () => {
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 160 }] });

    fireEvent.touchMove(feed, { touches: [] });

    expect(feed.dataset.kind).toEqual("pulling");
    expect(feed.dataset.distance).toEqual("30");
  });

  test("ignores the touch when scrolled", () => {
    const originalScrollY = window.scrollY;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 10 });
    render(<Feed onRefresh={jest.fn()} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");

    Object.defineProperty(window, "scrollY", { configurable: true, value: originalScrollY });
  });

  test("springs back below the threshold", () => {
    const onRefresh = jest.fn();
    render(<Feed onRefresh={onRefresh} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 200 }] });

    fireEvent.touchEnd(feed);

    expect(onRefresh).not.toHaveBeenCalled();
    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("springs back on cancel", () => {
    const onRefresh = jest.fn();
    render(<Feed onRefresh={onRefresh} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    fireEvent.touchCancel(feed);

    expect(onRefresh).not.toHaveBeenCalled();
    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("refreshes when released armed", () => {
    const onRefresh = jest.fn(() => new Promise(() => {}));
    render(<Feed onRefresh={onRefresh} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    fireEvent.touchEnd(feed);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(feed.dataset.kind).toEqual("refreshing");
    expect(feed.dataset.distance).toEqual("64");
  });

  test("refreshing - ignores touches", () => {
    render(<Feed onRefresh={() => new Promise(() => {})} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });
    fireEvent.touchEnd(feed);

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 120 }] });
    fireEvent.touchCancel(feed);

    expect(feed.dataset.kind).toEqual("refreshing");
    expect(feed.dataset.distance).toEqual("64");
  });

  test("settles after refreshing", async () => {
    const onRefresh = jest.fn(() => Promise.resolve());
    render(<Feed onRefresh={onRefresh} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    await act(async () => fireEvent.touchEnd(feed));

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("settles after a failed refresh", async () => {
    const onRefresh = jest.fn(() => Promise.reject(new Error("failure")));
    render(<Feed onRefresh={onRefresh} />);
    const feed = screen.getByTestId("feed");
    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 300 }] });

    await act(async () => fireEvent.touchEnd(feed));

    expect(feed.dataset.kind).toEqual("idle");
    expect(feed.dataset.distance).toEqual("0");
  });

  test("armed - custom threshold", () => {
    render(<Feed onRefresh={jest.fn()} threshold={40} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 180 }] });

    expect(feed.dataset.kind).toEqual("armed");
    expect(feed.dataset.distance).toEqual("40");
  });

  test("armed - custom threshold capped distance", () => {
    render(<Feed onRefresh={jest.fn()} threshold={40} />);
    const feed = screen.getByTestId("feed");

    fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(feed, { touches: [{ clientX: 100, clientY: 500 }] });

    expect(feed.dataset.kind).toEqual("armed");
    expect(feed.dataset.distance).toEqual("40");
  });
});

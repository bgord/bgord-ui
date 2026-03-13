import { describe, expect, test } from "bun:test";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NotificationContext,
  type NotificationContextValueType,
  NotificationProvider,
  useDismiss,
  useDismissAll,
  useNotifications,
  useNotify,
} from "../src/services/notifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const wrapper =
  (props: { duration?: number; max?: number } = {}) =>
  ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider {...props}>{children}</NotificationProvider>
  );

const contextWrapper =
  (value: NotificationContextValueType) =>
  ({ children }: { children: React.ReactNode }) => (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );

const positive = { message: "Saved successfully.", variant: "positive" } as const;
const negative = { message: "Something went wrong.", variant: "negative" } as const;
const warning = { message: "Proceed with caution.", variant: "warning" } as const;
const neutral = { message: "Nothing to report.", variant: "neutral" } as const;

// ---------------------------------------------------------------------------
// useNotifications
// ---------------------------------------------------------------------------

describe("useNotifications", () => {
  test("returns an empty list initially", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: wrapper() });

    expect(result.current).toEqual([]);
  });

  test("throws when used outside the NotificationContext", () => {
    expect(() => renderHook(() => useNotifications())).toThrow(
      "useNotifications must be used within the NotificationContext",
    );
  });
});

// ---------------------------------------------------------------------------
// useNotify
// ---------------------------------------------------------------------------

describe("useNotify", () => {
  test("throws when used outside the NotificationContext", () => {
    expect(() => renderHook(() => useNotify())).toThrow(
      "useNotify must be used within the NotificationContext",
    );
  });

  test("adds a notification to the list", () => {
    const { result } = renderHook(() => ({ notify: useNotify(), notifications: useNotifications() }), {
      wrapper: wrapper(),
    });

    act(() => result.current.notify(positive));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject(positive);
  });

  test("assigns a unique id to each notification", () => {
    const { result } = renderHook(() => ({ notify: useNotify(), notifications: useNotifications() }), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
    });

    const ids = result.current.notifications.map((n) => n.id);
    expect(new Set(ids).size).toEqual(2);
  });

  test("newest notification appears first", () => {
    const { result } = renderHook(() => ({ notify: useNotify(), notifications: useNotifications() }), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
    });

    expect(result.current.notifications[0]).toMatchObject(negative);
    expect(result.current.notifications[1]).toMatchObject(positive);
  });

  test("respects the max cap — drops the oldest on overflow", () => {
    const { result } = renderHook(() => ({ notify: useNotify(), notifications: useNotifications() }), {
      wrapper: wrapper({ max: 2 }),
    });

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
      result.current.notify(warning);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0]).toMatchObject(warning);
    expect(result.current.notifications[1]).toMatchObject(negative);
  });
});

// ---------------------------------------------------------------------------
// useDismiss
// ---------------------------------------------------------------------------

describe("useDismiss", () => {
  test("throws when used outside the NotificationContext", () => {
    expect(() => renderHook(() => useDismiss())).toThrow(
      "useDismiss must be used within the NotificationContext",
    );
  });

  test("removes the notification with the given id", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismiss: useDismiss(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.notify(positive));

    const id = result.current.notifications[0].id;

    act(() => result.current.dismiss(id));

    expect(result.current.notifications).toHaveLength(0);
  });

  test("does not affect other notifications", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismiss: useDismiss(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
    });

    const id = result.current.notifications[0].id;

    act(() => result.current.dismiss(id));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject(positive);
  });

  test("is a no-op for an unknown id", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismiss: useDismiss(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.notify(positive));
    act(() => result.current.dismiss("non-existent-id"));

    expect(result.current.notifications).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// useDismissAll
// ---------------------------------------------------------------------------

describe("useDismissAll", () => {
  test("throws when used outside the NotificationContext", () => {
    expect(() => renderHook(() => useDismissAll())).toThrow(
      "useDismissAll must be used within the NotificationContext",
    );
  });

  test("clears all notifications", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismissAll: useDismissAll(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
      result.current.notify(warning);
    });

    act(() => result.current.dismissAll());

    expect(result.current.notifications).toHaveLength(0);
  });

  test("is a no-op when the list is already empty", () => {
    const { result } = renderHook(
      () => ({ dismissAll: useDismissAll(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.dismissAll());

    expect(result.current.notifications).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Integration
// ---------------------------------------------------------------------------

describe("integration", () => {
  test("full notify → dismiss flow via UI", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const notify = useNotify();
      const dismiss = useDismiss();
      const notifications = useNotifications();

      return (
        <div>
          <button onClick={() => notify(positive)}>notify</button>
          {notifications.map((n) => (
            <div key={n.id}>
              <span data-testid="message">{n.message}</span>
              <button onClick={() => dismiss(n.id)}>dismiss</button>
            </div>
          ))}
        </div>
      );
    }

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    await user.click(screen.getByText("notify"));

    expect(screen.getByTestId("message")).toHaveTextContent(positive.message);

    await user.click(screen.getByText("dismiss"));

    expect(screen.queryByTestId("message")).toBeNull();
  });

  test("all four variants are accepted", () => {
    const { result } = renderHook(() => ({ notify: useNotify(), notifications: useNotifications() }), {
      wrapper: wrapper(),
    });

    act(() => {
      result.current.notify(positive);
      result.current.notify(negative);
      result.current.notify(warning);
      result.current.notify(neutral);
    });

    const variants = result.current.notifications.map((n) => n.variant);
    expect(variants).toContain("positive");
    expect(variants).toContain("negative");
    expect(variants).toContain("warning");
    expect(variants).toContain("neutral");
  });
});

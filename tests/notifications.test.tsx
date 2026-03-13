import { describe, expect, test } from "bun:test";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NotificationProvider,
  useDismiss,
  useDismissAll,
  useNotifications,
  useNotify,
} from "../src/services/notifications";

const wrapper =
  (duration = 5000) =>
  ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider duration={duration}>{children}</NotificationProvider>
  );

const positive = { message: "Saved successfully.", variant: "positive" } as const;
const negative = { message: "Something went wrong.", variant: "negative" } as const;
const warning = { message: "Proceed with caution.", variant: "warning" } as const;

describe("Notifications", () => {
  test("useNotifications - initial", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: wrapper() });

    expect(result.current).toEqual([]);
  });

  test("useNotifications - no context", () => {
    expect(() => renderHook(() => useNotifications())).toThrow(
      "useNotifications must be used within the NotificationContext",
    );
  });

  test("useDismiss - happy path", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismiss: useDismiss(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.notify(positive));

    const id = result.current.notifications[0].id;

    act(() => result.current.dismiss(id));

    expect(result.current.notifications.length).toEqual(0);
  });

  test("useDismiss - two notifications", () => {
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

    expect(result.current.notifications.length).toEqual(1);
    expect(result.current.notifications[0]).toMatchObject(positive);
  });

  test("useDismiss - unknown id", () => {
    const { result } = renderHook(
      () => ({ notify: useNotify(), dismiss: useDismiss(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.notify(positive));
    act(() => result.current.dismiss("non-existent-id"));

    expect(result.current.notifications.length).toEqual(1);
  });

  test("useDismiss - no context", () => {
    expect(() => renderHook(() => useDismiss())).toThrow(
      "useDismiss must be used within the NotificationContext",
    );
  });

  test("useDismissAll - happy path", () => {
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

    expect(result.current.notifications.length).toEqual(0);
  });

  test("useDismissAll - empty list", () => {
    const { result } = renderHook(
      () => ({ dismissAll: useDismissAll(), notifications: useNotifications() }),
      { wrapper: wrapper() },
    );

    act(() => result.current.dismissAll());

    expect(result.current.notifications.length).toEqual(0);
  });

  test("useDismissAll - no context", () => {
    expect(() => renderHook(() => useDismissAll())).toThrow(
      "useDismissAll must be used within the NotificationContext",
    );
  });

  test("useNotify - happy path", () => {
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

  test("useNotify - no context", () => {
    expect(() => renderHook(() => useNotify())).toThrow(
      "useNotify must be used within the NotificationContext",
    );
  });

  test("integration", async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const notify = useNotify();
      const dismiss = useDismiss();
      const notifications = useNotifications();

      return (
        <div>
          <button onClick={() => notify(positive)} type="button">
            notify
          </button>
          {notifications.map((notification) => (
            <div key={notification.id}>
              <span data-testid="message">{notification.message}</span>
              <button onClick={() => dismiss(notification.id)} type="button">
                dismiss
              </button>
            </div>
          ))}
        </div>
      );
    }

    render(
      <NotificationProvider duration={5000}>
        <TestComponent />
      </NotificationProvider>,
    );

    await user.click(screen.getByText("notify"));

    expect(screen.getByTestId("message")).toHaveTextContent(positive.message);

    await user.click(screen.getByText("dismiss"));

    expect(screen.queryByTestId("message")).toBeNull();
  });
});

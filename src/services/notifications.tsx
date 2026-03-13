import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";

export type NotificationVariantType = "positive" | "negative" | "warning" | "neutral";
export type NotificationType = { id: string; message: string; variant: NotificationVariantType };
export type NotificationConfigType = { message: string; variant: NotificationVariantType };

export type NotificationContextValueType = {
  notifications: NotificationType[];
  notify: (config: NotificationConfigType) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

type NotificationActionType =
  | { type: "ADD"; notification: NotificationType }
  | { type: "DISMISS"; id: string }
  | { type: "DISMISS_ALL" };

type NotificationStateType = { notifications: NotificationType[] };

function notificationReducer(
  state: NotificationStateType,
  action: NotificationActionType,
  max: number | undefined,
): NotificationStateType {
  switch (action.type) {
    case "ADD": {
      const next = [action.notification, ...state.notifications];
      return {
        notifications: max !== undefined && next.length > max ? next.slice(0, max) : next,
      };
    }
    case "DISMISS":
      return { notifications: state.notifications.filter((n) => n.id !== action.id) };
    case "DISMISS_ALL":
      return { notifications: [] };
  }
}

export const NotificationContext = createContext<NotificationContextValueType | undefined>(undefined);

type NotificationProviderPropsType = PropsWithChildren<{ duration?: number; max?: number }>;

export function NotificationProvider(props: NotificationProviderPropsType) {
  const { children, duration, max } = props;

  const [state, dispatch] = useReducer(
    (state: NotificationStateType, action: NotificationActionType) => notificationReducer(state, action, max),
    { notifications: [] },
  );

  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (config: NotificationConfigType) => {
      const notification: NotificationType = {
        id: crypto.randomUUID(),
        message: config.message,
        variant: config.variant,
      };

      dispatch({ type: "ADD", notification });

      if (duration !== undefined) {
        const timer = setTimeout(() => {
          dispatch({ type: "DISMISS", id: notification.id });
          timers.current.delete(notification.id);
        }, duration);

        timers.current.set(notification.id, timer);
      }
    },
    [duration],
  );

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      dispatch({ type: "DISMISS", id });
    },
    [clearTimer],
  );

  const dismissAll = useCallback(() => {
    for (const id of timers.current.keys()) clearTimer(id);
    dispatch({ type: "DISMISS_ALL" });
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications: state.notifications, notify, dismiss, dismissAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValueType["notifications"] {
  const value = use(NotificationContext);

  if (value === undefined) throw new Error("useNotifications must be used within the NotificationContext");

  return value.notifications;
}

export function useNotify(): NotificationContextValueType["notify"] {
  const value = use(NotificationContext);

  if (value === undefined) throw new Error("useNotify must be used within the NotificationContext");

  return value.notify;
}

export function useDismiss(): NotificationContextValueType["dismiss"] {
  const value = use(NotificationContext);

  if (value === undefined) throw new Error("useDismiss must be used within the NotificationContext");

  return value.dismiss;
}

export function useDismissAll(): NotificationContextValueType["dismissAll"] {
  const value = use(NotificationContext);

  if (value === undefined) throw new Error("useDismissAll must be used within the NotificationContext");

  return value.dismissAll;
}

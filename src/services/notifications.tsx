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

export type NotificationContextValueType = {
  notifications: Array<NotificationType>;
  notify: (config: Omit<NotificationType, "id">) => void;
  dismiss: (id: NotificationType["id"]) => void;
  dismissAll: () => void;
};

type NotificationActionType =
  | { type: "ADD"; notification: NotificationType }
  | { type: "DISMISS"; id: NotificationType["id"] }
  | { type: "DISMISS_ALL" };
  type NotificationStateType = { notifications: Array<NotificationType> };

function notificationReducer(
  state: NotificationStateType,
  action: NotificationActionType,
): NotificationStateType {
  switch (action.type) {
    case "ADD":
      return { notifications: [action.notification, ...state.notifications] };
    case "DISMISS":
      return { notifications: state.notifications.filter((notification) => notification.id !== action.id) };
    case "DISMISS_ALL":
      return { notifications: [] };
  }
}

export const NotificationContext = createContext<NotificationContextValueType | undefined>(undefined);

type NotificationProviderPropsType = PropsWithChildren<{ duration: number }>;

export function NotificationProvider(props: NotificationProviderPropsType) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  const timers = useRef<Map<NotificationType["id"], ReturnType<typeof setTimeout>>>(new Map());

  const notify = useCallback(
    (config: Omit<NotificationType, "id">) => {
      const notification: NotificationType = { id: crypto.randomUUID(), ...config };

      dispatch({ type: "ADD", notification });

      const timer = setTimeout(() => {
        dispatch({ type: "DISMISS", id: notification.id });
        timers.current.delete(notification.id);
      }, props.duration);

      timers.current.set(notification.id, timer);
    },
    [props.duration],
  );

  const dismiss = useCallback((id: NotificationType["id"]) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    dispatch({ type: "DISMISS", id });
  }, []);

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    dispatch({ type: "DISMISS_ALL" });
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications: state.notifications, notify, dismiss, dismissAll }}>
      {props.children}
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

import { createContext, useContext, useEffect, useRef } from "react";
import { type UseToggleReturnType, useClickOutside, useToggle } from "../hooks";
import { Rhythm } from "../services/rhythm";

type MenuContextType = {
  toggle: UseToggleReturnType;
  trigger: React.RefObject<HTMLButtonElement | null>;
  content: React.RefObject<HTMLDivElement | null>;
};

const MenuContext = createContext<MenuContextType | null>(null);

const colors = { neutral: "neutral-200", brand: "brand-400", danger: "danger-400" } as const;

export type MenuItemTone = keyof typeof colors;

function items(content: HTMLDivElement | null) {
  return Array.from(content?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []);
}

export function useMenu() {
  const menu = useContext(MenuContext);
  if (!menu) throw new Error("useMenu must be used within Menu");

  const close = () => {
    menu.trigger.current?.focus();
    menu.toggle.disable();
  };

  return { ...menu, close };
}

export function Menu(props: React.JSX.IntrinsicElements["div"] & { name: string }) {
  const { name, ...rest } = props;

  const toggle = useToggle({ name });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useClickOutside(root, toggle.disable);

  return (
    <MenuContext.Provider value={{ toggle, trigger, content }}>
      <div
        data-position="relative"
        data-shrink="0"
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget)) toggle.disable();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || toggle.off) return;
          event.preventDefault();
          trigger.current?.focus();
          toggle.disable();
        }}
        ref={root}
        {...rest}
      />
    </MenuContext.Provider>
  );
}

export function MenuTrigger(props: React.JSX.IntrinsicElements["button"]) {
  const menu = useMenu();

  return (
    <button
      aria-controls={menu.toggle.props.controller["aria-controls"]}
      aria-expanded={menu.toggle.on}
      aria-haspopup="menu"
      data-bg={menu.toggle.on ? "neutral-800" : undefined}
      onClick={menu.toggle.on ? menu.close : menu.toggle.enable}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        if (menu.toggle.on) items(menu.content.current)[0]?.focus();
        else menu.toggle.enable();
      }}
      ref={menu.trigger}
      title={props["aria-label"]}
      type="button"
      {...props}
    />
  );
}

export function MenuContent(props: React.JSX.IntrinsicElements["div"]) {
  const menu = useMenu();

  useEffect(() => {
    if (menu.toggle.on) items(menu.content.current)[0]?.focus();
  }, [menu.toggle.on, menu.content]);

  const move = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const list = items(menu.content.current);
    const current = list.indexOf(document.activeElement as HTMLElement);

    const targets: Record<string, number | undefined> = {
      ArrowDown: (current + 1) % list.length,
      ArrowUp: current <= 0 ? list.length - 1 : current - 1,
      Home: 0,
      End: list.length - 1,
    };

    const target = targets[event.key];
    if (target === undefined) return;

    event.preventDefault();
    list[target]?.focus();
  };

  return (
    <div
      aria-orientation="vertical"
      data-animation="grow-fade-in"
      data-bc="alpha-soft"
      data-bg="neutral-900"
      data-br="md"
      data-bw="hairline"
      data-dir="column"
      data-disp={menu.toggle.on ? "flex" : "none"}
      data-p="1"
      data-position="absolute"
      data-right="0"
      data-shadow="lg"
      data-z="1"
      id={menu.toggle.props.target.id}
      onKeyDown={move}
      ref={menu.content}
      role="menu"
      style={{ outline: "none", top: "calc(100% + var(--spacing-1-5))", ...Rhythm().times(17).minWidth }}
      tabIndex={-1}
      {...props}
    />
  );
}

const item = (tone: MenuItemTone) =>
  ({
    "data-br": "sm",
    "data-color": colors[tone],
    "data-cursor": "pointer",
    "data-focus-bg": "neutral-800",
    "data-fs": "sm",
    "data-gap": "2",
    "data-hover-bg": "neutral-800",
    "data-px": "2-5",
    "data-stack": "x",
    "data-transform": "truncate",
    role: "menuitem",
    style: { outline: "none", ...Rhythm().times(3).minHeight },
    tabIndex: -1,
  }) as const;

export function MenuItem(props: React.JSX.IntrinsicElements["button"] & { tone?: MenuItemTone }) {
  const menu = useMenu();
  const { tone = "neutral", onClick, ...rest } = props;

  return (
    <button
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) menu.close();
      }}
      type="button"
      {...item(tone)}
      {...rest}
    />
  );
}

export function MenuLink(props: React.JSX.IntrinsicElements["a"] & { tone?: MenuItemTone }) {
  const menu = useMenu();
  const { tone = "neutral", href, onClick, ...rest } = props;

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) menu.close();
      }}
      {...item(tone)}
      {...rest}
    />
  );
}

export function MenuSeparator(props: React.JSX.IntrinsicElements["hr"]) {
  return <hr data-bg="alpha-subtle" data-my="1" {...props} />;
}

export function MenuFooter(props: React.JSX.IntrinsicElements["small"]) {
  return <small data-color="neutral-500" data-pb="1-5" data-pt="2" data-px="2-5" {...props} />;
}

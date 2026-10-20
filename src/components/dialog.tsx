import { useEffect, useRef } from "react";
import { extractUseToggle, type UseToggleReturnType, useClickOutside, useScrollLock } from "../hooks";
import { noop } from "../services/noop";

export type DialogPropsType = UseToggleReturnType &
  React.JSX.IntrinsicElements["dialog"] & { locked?: boolean };

export function Dialog(props: DialogPropsType) {
  const { locked = false, onCancel, ...others } = props;

  const { toggle: dialog, rest } = extractUseToggle(others);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialog.on) {
      ref.current?.showModal();
      ref.current?.focus();
      return;
    }

    ref.current?.close();
    if (window.matchMedia("(pointer: coarse)").matches)
      (document.activeElement as HTMLElement | null)?.blur();
  }, [dialog.on]);

  useScrollLock(dialog.on);
  useClickOutside(ref, locked ? noop : dialog.disable);

  return (
    <dialog
      aria-modal="true"
      data-animation="grow-fade-in"
      data-backdrop="stronger"
      data-bg="neutral-900"
      data-br="xs"
      data-bw="none"
      data-dir="column"
      data-disp={dialog.on ? "flex" : "none"}
      data-mx="auto"
      data-p="5"
      data-position="fixed"
      data-z="2"
      tabIndex={0}
      {...dialog.props.target}
      {...rest}
      onCancel={(event) => {
        onCancel?.(event);
        if (!(event.defaultPrevented || locked)) dialog.disable();
        event.preventDefault();
      }}
      ref={ref}
      style={{ outline: "none", ...rest.style }}
    />
  );
}

import React, { useEffect, useRef } from "react";
import * as hooks from "../hooks";

export type DialogPropsType = hooks.UseToggleReturnType & React.JSX.IntrinsicElements["dialog"];

export function Dialog(props: DialogPropsType) {
  const { toggle: dialog, rest } = hooks.extractUseToggle(props);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (props.on) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [props.on]);

  hooks.useKeyboardShortcuts({ Escape: dialog.disable });
  hooks.useScrollLock(props.on);
  hooks.useClickOutside(ref, dialog.disable);

  return (
    <dialog
      ref={ref}
      tabIndex={0}
      aria-modal="true"
      role="dialog"
      data-disp={props.on ? "flex" : "none"}
      data-dir="column"
      data-mx="auto"
      data-p="5"
      data-position="fixed"
      data-z="2"
      data-bg="neutral-900"
      data-br="xs"
      data-backdrop="stronger"
      data-animation="grow-fade-in"
      {...rest}
    />
  );
}

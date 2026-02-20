import { useEffect, useRef } from "react";
import {
  extractUseToggle,
  type UseToggleReturnType,
  useClickOutside,
  useScrollLock,
  useShortcuts,
} from "../hooks";
import { noop } from "../services/noop";

export type DialogPropsType = UseToggleReturnType &
  React.JSX.IntrinsicElements["dialog"] & { locked?: boolean };

export function Dialog(props: DialogPropsType) {
  const { locked: _locked, ..._props } = props;
  const locked = _locked ?? false;

  const { toggle: dialog, rest } = extractUseToggle(_props);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (props.on) ref.current?.showModal();
    else ref.current?.close();
  }, [props.on]);

  useShortcuts({ Escape: locked ? noop : dialog.disable });
  useScrollLock(props.on);
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
      data-disp={props.on ? "flex" : "none"}
      data-mx="auto"
      data-p="5"
      data-position="fixed"
      data-z="2"
      ref={ref}
      tabIndex={0}
      {...dialog.props.target}
      {...rest}
    />
  );
}

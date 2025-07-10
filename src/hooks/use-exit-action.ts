import React from "react";

type UseExitActionOptionsType = { actionFn: () => void; animation: string };

enum UseExitActionPhase {
  idle = "idle",
  exiting = "exiting",
  gone = "gone",
}

export function useExitAction(options: UseExitActionOptionsType) {
  const [phase, setPhase] = React.useState<UseExitActionPhase>(UseExitActionPhase.idle);

  const trigger = (event: React.MouseEvent) => {
    event.preventDefault();
    if (phase === "idle") setPhase(UseExitActionPhase.exiting);
  };

  const onAnimationEnd = (event: React.AnimationEvent) => {
    if (event.animationName !== options.animation) return;
    options.actionFn();
    setPhase(UseExitActionPhase.gone);
  };

  const attach = phase === "exiting" ? { "data-exit": options.animation, onAnimationEnd } : undefined;

  return { visible: phase !== "gone", attach, trigger };
}

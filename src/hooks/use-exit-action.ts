import React from "react";

type UseExitActionAnimationType = string;

type UseExitActionOptionsType = { action: () => void; animation: UseExitActionAnimationType };

type UseExitActionReturnType = {
  visible: boolean;
  trigger: (event: React.MouseEvent) => void;
  attach:
    | { "data-animation": UseExitActionAnimationType; onAnimationEnd: (event: React.AnimationEvent) => void }
    | undefined;
};

enum UseExitActionPhase {
  idle = "idle",
  exiting = "exiting",
  gone = "gone",
}

export function useExitAction(options: UseExitActionOptionsType): UseExitActionReturnType {
  const [phase, setPhase] = React.useState<UseExitActionPhase>(UseExitActionPhase.idle);

  const trigger = (event: React.MouseEvent) => {
    event.preventDefault();
    if (phase === "idle") setPhase(UseExitActionPhase.exiting);
  };

  const onAnimationEnd = (event: React.AnimationEvent) => {
    if (event.animationName !== options.animation) return;
    options.action();
    setPhase(UseExitActionPhase.gone);
  };

  const attach = phase === "exiting" ? { "data-animation": options.animation, onAnimationEnd } : undefined;

  return { visible: phase !== "gone", attach, trigger };
}

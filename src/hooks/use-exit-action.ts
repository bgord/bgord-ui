import { useState } from "react";

type UseExitActionAnimationType = string;

type UseExitActionOptionsType = { action: () => Promise<unknown>; animation: UseExitActionAnimationType };

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
  const [phase, setPhase] = useState<UseExitActionPhase>(UseExitActionPhase.idle);

  const trigger = (event: React.MouseEvent) => {
    event.preventDefault();
    if (phase === "idle") setPhase(UseExitActionPhase.exiting);
  };

  const onAnimationEnd = async (event: React.AnimationEvent) => {
    if (event.animationName !== options.animation) return;
    setPhase(UseExitActionPhase.gone);
    await options.action();
  };

  const attach = phase === "exiting" ? { "data-animation": options.animation, onAnimationEnd } : undefined;

  return { visible: phase !== "gone", attach, trigger };
}

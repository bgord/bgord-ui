import { useCallback, useEffect, useMemo, useRef } from "react";
import { UseToggleReturnType, useToggle } from "./use-toggle";

type UseHoverConfigType = { enabled?: boolean };

type UseHoverReturnType = { attach: { ref: React.RefObject<any> }; isHovering: UseToggleReturnType["on"] };

export function useHover(config?: UseHoverConfigType): UseHoverReturnType {
  const enabled = config?.enabled ?? true;
  const ref = useRef<any>(null);
  const isHovering = useToggle({ name: "is-hovering" });

  const handleMouseEnter = useCallback(isHovering.enable, []);
  const handleMouseLeave = useCallback(isHovering.disable, []);

  useEffect(() => {
    const node = ref.current;
    if (node && enabled) {
      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (node && enabled) {
        node.removeEventListener("mouseenter", handleMouseEnter);
        node.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [enabled, handleMouseEnter, handleMouseLeave]);

  return useMemo(() => ({ attach: { ref }, isHovering: isHovering.on && enabled }), [isHovering.on, enabled]);
}

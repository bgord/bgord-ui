import { useCallback, useMemo, useState } from "react";

export type UseToggleValueType = boolean;

export type UseToggleConfigType = {
  name: string;
  defaultValue?: UseToggleValueType;
};

type UseToggleProps = {
  controller: {
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    role: "button";
    tabIndex: 0;
  };
  target: {
    id: string;
    role: "region";
    "aria-hidden": "true" | "false";
  };
};

export type UseToggleReturnType = {
  on: UseToggleValueType;
  off: UseToggleValueType;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  props: UseToggleProps;
};

export function useToggle({ name, defaultValue = false }: UseToggleConfigType): UseToggleReturnType {
  const [on, setOn] = useState<UseToggleValueType>(defaultValue);

  // tighter callbacks, defined inline
  const enable = () => setOn(true);
  const disable = () => setOn(false);
  const toggle = () => setOn((v) => !v);

  // simplify memoization: compute directly
  const off = !on;

  const props: UseToggleProps = {
    controller: {
      "aria-expanded": on ? "true" : "false",
      "aria-controls": name,
      role: "button",
      tabIndex: 0,
    },
    target: {
      id: name,
      role: "region",
      "aria-hidden": on ? "false" : "true",
    },
  };

  return { on, off, enable, disable, toggle, props };
}

export function extractUseToggle<X>(_props: UseToggleReturnType & X): {
  toggle: UseToggleReturnType;
  rest: X;
} {
  const { on, off, enable, disable, toggle, props, ...rest } = _props;
  return {
    toggle: { on, off, enable, disable, toggle, props },
    rest: rest as X,
  };
}

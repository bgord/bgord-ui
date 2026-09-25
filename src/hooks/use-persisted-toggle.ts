import { useEffect } from "react";
import {
  type UseToggleConfigType,
  type UseToggleReturnType,
  type UseToggleValueType,
  useToggle,
} from "./use-toggle";

const key = (name: string) => `toggle:${name}`;

const read = (name: string): UseToggleValueType | null => {
  try {
    const stored = localStorage.getItem(key(name));
    return stored === null ? null : stored === "on";
  } catch {
    return null;
  }
};

const write = (name: string, on: UseToggleValueType) => {
  try {
    localStorage.setItem(key(name), on ? "on" : "off");
  } catch {}
};

export function usePersistedToggle(config: UseToggleConfigType): UseToggleReturnType {
  const toggle = useToggle(config);

  useEffect(() => {
    const stored = read(config.name);

    if (stored === true) toggle.enable();
    if (stored === false) toggle.disable();
  }, [config.name]);

  return {
    ...toggle,
    enable: () => {
      write(config.name, true);
      toggle.enable();
    },
    disable: () => {
      write(config.name, false);
      toggle.disable();
    },
    toggle: () => {
      write(config.name, !toggle.on);
      toggle.toggle();
    },
  };
}

import type React from "react";

type PatternTextConfigType = {
  min?: number;
  max?: number;
  required?: React.JSX.IntrinsicElements["input"]["required"];
};

type PatternExactConfigType = {
  text: string;
  required?: React.JSX.IntrinsicElements["input"]["required"];
};

export class Form {
  static input(config: PatternTextConfigType): React.ComponentPropsWithoutRef<"input"> {
    const required = config.required ?? true;

    if (config.min && !config.max) return { pattern: `.{${config.min}}`, required };
    if (config.min && config.max) return { pattern: `.{${config.min},${config.max}}`, required };
    if (!config.min && config.max) return { pattern: `.{,${config.max}}`, required };
    return { pattern: undefined, required };
  }

  static textarea(config: PatternTextConfigType): React.ComponentPropsWithoutRef<"textarea"> {
    const required = config.required ?? true;

    if (config.min && !config.max) return { minLength: config.min, required };
    if (config.min && config.max) return { minLength: config.min, maxLength: config.max, required };
    if (!config.min && config.max) return { maxLength: config.max, required };
    return { required };
  }

  static exact(config: PatternExactConfigType): React.ComponentPropsWithoutRef<"input"> {
    const required = config.required ?? true;

    return { pattern: config.text, required };
  }
}

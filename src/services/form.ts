import React from "react";

type PatternConfigType = {
  min?: number;
  max?: number;
  required?: React.JSX.IntrinsicElements["input"]["required"];
};

export class Form {
  static pattern(
    config: PatternConfigType,
  ): React.JSX.IntrinsicElements["textarea"] & React.JSX.IntrinsicElements["input"] {
    const required = config.required ?? true;

    if (config.min && !config.max) return { pattern: `.{${config.min}}`, required };

    if (config.min && config.max) return { pattern: `.{${config.min},${config.max}}`, required };

    if (!config.min && config.max) return { pattern: `.{,${config.max}}`, required };

    return { pattern: undefined, required };
  }
}

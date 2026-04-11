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

  static date = {
    min: {
      // biome-ignore lint: lint/style/noRestrictedGlobals
      today: () => new Date().toISOString().split("T")[0],
      tomorrow: () => {
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const today = new Date();
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const tomorrow = new Date(today.setDate(today.getDate() + 1));

        return tomorrow.toISOString().split("T")[0];
      },
      yesterday: () => {
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const today = new Date();
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const yesterday = new Date(today.setDate(today.getDate() - 1));

        return yesterday.toISOString().split("T")[0];
      },
    },
    max: {
      // biome-ignore lint: lint/style/noRestrictedGlobals
      today: () => new Date().toISOString().split("T")[0],
      tomorrow: () => {
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const today = new Date();
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const tomorrow = new Date(today.setDate(today.getDate() + 1));

        return tomorrow.toISOString().split("T")[0];
      },
      yesterday: () => {
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const today = new Date();
        // biome-ignore lint: lint/style/noRestrictedGlobals
        const yesterday = new Date(today.setDate(today.getDate() - 1));

        return yesterday.toISOString().split("T")[0];
      },
    },
  };
}

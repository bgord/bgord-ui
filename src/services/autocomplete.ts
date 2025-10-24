type AutocompleteType = {
  email: React.JSX.IntrinsicElements["input"];
  password: { new: React.JSX.IntrinsicElements["input"]; current: React.JSX.IntrinsicElements["input"] };
  off: React.JSX.IntrinsicElements["input"];
};

export const Autocomplete: AutocompleteType = {
  email: { inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: "false" },
  password: { new: { autoComplete: "new-password" }, current: { autoComplete: "current-password" } },
  off: { autoComplete: "off", spellCheck: false },
};

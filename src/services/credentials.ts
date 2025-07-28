type CredentialsType = {
  email: React.JSX.IntrinsicElements["input"];
  password: { new: React.JSX.IntrinsicElements["input"]; current: React.JSX.IntrinsicElements["input"] };
};

export const Credentials: CredentialsType = {
  email: { inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: "false" },
  password: { new: { autoComplete: "new-password" }, current: { autoComplete: "current-password" } },
};

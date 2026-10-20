import { useCallback } from "react";

export function useMetaEnterSubmit() {
  // Stryker disable ArrayDeclaration: any constant dependency list keeps the identity
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }, []);
  // Stryker restore ArrayDeclaration

  return { onKeyDown };
}

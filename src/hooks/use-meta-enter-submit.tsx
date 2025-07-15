import { useCallback, useMemo } from "react";

export function useMetaEnterSubmit() {
  const handleMetaEnterSubmit = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || !event.metaKey) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }, []);

  return useMemo(() => ({ onKeyDown: handleMetaEnterSubmit }), [handleMetaEnterSubmit]);
}

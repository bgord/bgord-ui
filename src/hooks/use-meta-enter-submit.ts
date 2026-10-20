import { useCallback } from "react";

export function useMetaEnterSubmit() {
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }, []);

  return { onKeyDown };
}

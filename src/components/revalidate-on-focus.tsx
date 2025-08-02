// cspell:disable
import { useEffect } from "react";
import { useRevalidator } from "react-router";

export function RevalidateOnFocus() {
  const revalidator = useRevalidator();

  useEffect(() => {
    const onFocus = () => revalidator.revalidate();

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [revalidator]);

  return null;
}

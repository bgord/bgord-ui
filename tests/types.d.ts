import type { DetachedWindowAPI } from "happy-dom";

declare global {
  interface Window {
    happyDOM: DetachedWindowAPI;
  }
}

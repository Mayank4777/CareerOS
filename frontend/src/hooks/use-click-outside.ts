import { type RefObject, useEffect } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  active = true
): void {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const listener = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [active, handler, ref]);
}

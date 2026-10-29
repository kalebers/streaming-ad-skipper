import type { SkipControl } from "../adapters/types";

export function isSafeSkipControl(control: SkipControl | null): boolean {
  if (!control) return false;
  const { element } = control;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    element.isConnected &&
    !element.hasAttribute("disabled") &&
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

export function activateSkipControl(control: SkipControl | null): boolean {
  if (!isSafeSkipControl(control)) return false;
  control?.element.click();
  return true;
}

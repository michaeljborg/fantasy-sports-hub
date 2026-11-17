/** Transition types for <Link transitionTypes>; animated in src/styles/motion.css */
export const NAV_FORWARD = ["nav-forward"];
export const NAV_BACK = ["nav-back"];

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

"use client";

import { useEffect } from "react";

const NAVBAR_SELECTOR = "[data-site-navbar]";

// The navbar is position: fixed, so it takes no room in the page: this keeps
// the --navbar-height CSS variable equal to its real height (it changes when
// the links wrap onto a second row on narrow phones) so the content can start
// right below it. Renders nothing.
export function NavbarHeightSync() {
  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
    if (!navbar) return;

    const root = document.documentElement;
    const update = () =>
      root.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(navbar);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--navbar-height");
    };
  }, []);

  return null;
}

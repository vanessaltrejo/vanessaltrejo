"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNavItems } from "@/lib/site-nav";

// Client component only because the active view comes from the current
// pathname — the rest of the navbar stays a server component.
export function SiteNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal">
      <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 min-[414px]:gap-x-3 sm:gap-x-4 md:gap-x-6">
        {siteNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`transition-colors ${
                  isActive
                    ? "text-tertiary"
                    : "text-neutral-500 hover:text-secondary"
                }`}
              >
                {item.navLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

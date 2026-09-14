import Link from "next/link";

import type { NavItem } from "@/features/auth/role-nav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const visibleItems = items.slice(0, 5);

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5 gap-1">
        {visibleItems.map((item) => (
          <li key={item.href}>
            <Link
              className="flex min-h-12 items-center justify-center rounded-xl px-1 text-center text-xs font-medium hover:bg-black/5"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

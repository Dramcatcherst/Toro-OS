import Link from "next/link";

import type { NavItem } from "@/features/auth/role-nav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const visibleItems = [
    ...items.filter((item) => item.availability === "available"),
    ...items.filter((item) => item.availability === "coming-soon"),
  ].slice(0, 5);

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5 gap-1">
        {visibleItems.map((item) => (
          <li key={item.label}>
            {item.availability === "available" ? (
              <Link
                className="flex min-h-12 items-center justify-center rounded-xl px-1 text-center text-xs font-medium hover:bg-black/5"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-center text-xs text-neutral-500"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px]">Próximamente</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

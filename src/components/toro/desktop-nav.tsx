import Link from "next/link";

import type { NavItem } from "@/features/auth/role-nav";

export function DesktopNav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Navegación principal" className="hidden w-64 shrink-0 border-r border-black/10 bg-white p-4 md:block">
      <div className="mb-6 text-lg font-semibold">TORO OS</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

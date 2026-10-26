"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCreditCard,
  FiShoppingBag,
  FiBox,
  FiArrowDown,
  FiBarChart2,
} from "react-icons/fi";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: FiHome },
  { href: "/checkout", label: "Checkout (POS)", icon: FiCreditCard },
  { href: "/products", label: "Products", icon: FiShoppingBag },
  { href: "/inventory", label: "Inventory", icon: FiBox },
  { href: "/movements", label: "Stock In/Out", icon: FiArrowDown },
  { href: "/sales", label: "Sales Reports", icon: FiBarChart2 },
];

export function Nav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              active
                ? "bg-orange-50 text-orange-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
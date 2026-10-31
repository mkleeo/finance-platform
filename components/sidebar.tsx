
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartPie,
  Settings,
  Wallet,
} from "lucide-react";

const menuItems = [
  {
    nome: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    nome: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    nome: "Reports",
    href: "/reports",
    icon: ChartPie,
  },
  {
    nome: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r bg-white p-6">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3">
        <Wallet className="h-8 w-8 text-emerald-600" />

        <h1 className="text-xl font-bold text-gray-900">
          Finance Platform
        </h1>
      </Link>

      {/* Menu de navegação */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icone = item.icon;

          const ativo =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                ativo
                  ? "bg-emerald-50 font-medium text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icone className="h-5 w-5" />
              {item.nome}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto border-t pt-6 text-sm text-gray-400">
        Finance Platform v1.0
      </div>
    </aside>
  );
}

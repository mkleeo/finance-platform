
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
  { nome: "Dashboard", href: "/", icon: LayoutDashboard },
  { nome: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { nome: "Reports", href: "/reports", icon: ChartPie },
  { nome: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <Wallet className="h-8 w-8 text-sidebar-primary" />

        <h1 className="text-xl font-bold">
          Finance Platform
        </h1>
      </Link>

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
                  ? "bg-sidebar-accent font-medium text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icone className="h-5 w-5" />
              {item.nome}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border pt-6 text-sm text-muted-foreground">
        Finance Platform v1.0
      </div>
    </aside>
  );
}

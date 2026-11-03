"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, ChartPie, Settings, Wallet, LogIn } from "lucide-react";
const items = [
 { label: "Dashboard", href: "/demo", icon: LayoutDashboard },
 { label: "Transactions", href: "/demo/transactions", icon: ArrowLeftRight },
 { label: "Reports", href: "/demo/reports", icon: ChartPie },
 { label: "Settings", href: "/demo/settings", icon: Settings },
];
export function DemoSidebar() {
 const pathname = usePathname();
 return <aside className="w-full shrink-0 border-b border-sidebar-border bg-sidebar p-5 text-sidebar-foreground md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
  <Link href="/demo" className="mb-6 flex items-center gap-3 md:mb-10"><Wallet className="h-8 w-8 text-sidebar-primary" /><span className="text-xl font-bold">Finance Platform</span></Link>
  <nav className="flex flex-wrap gap-2 md:flex-col">{items.map(({label,href,icon:Icon}) => {const active=pathname===href;return <Link key={href} href={href} aria-current={active?"page":undefined} className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${active?"bg-sidebar-accent font-medium text-sidebar-primary":"text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}><Icon className="h-5 w-5" />{label}</Link>})}</nav>
  <div className="mt-6 border-t border-sidebar-border pt-5 text-sm text-muted-foreground md:mt-12"><p className="mb-3">Modo demonstração · Dados fictícios</p><Link href="/" className="flex items-center gap-2 hover:text-primary"><LogIn className="h-4 w-4" /> Área de login</Link></div>
 </aside>;
}

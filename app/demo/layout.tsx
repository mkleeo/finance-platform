import type { ReactNode } from "react";
import { DemoProvider } from "./demo-context";
import { DemoSidebar } from "./sidebar";
export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoProvider><div className="min-h-screen md:flex"><DemoSidebar /><div className="min-w-0 flex-1">{children}</div></div></DemoProvider>;
}

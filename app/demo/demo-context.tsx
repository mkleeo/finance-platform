"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { transacoesDemo } from "@/lib/demo-data";
import type { Transacao } from "@/lib/types/transacao";

type DemoContextType = { transacoes: Transacao[]; setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>; restaurar: () => void };
const DemoContext = createContext<DemoContextType | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>(() => transacoesDemo.map(t => ({...t})));
  const restaurar = () => setTransacoes(transacoesDemo.map(t => ({...t})));
  return <DemoContext.Provider value={{ transacoes, setTransacoes, restaurar }}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider ausente");
  return value;
}

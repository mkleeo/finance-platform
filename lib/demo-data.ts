
import type { Transacao } from "@/lib/types/transacao";

export const transacoesDemo: Transacao[] = [
  {
    id: "demo-1",
    descricao: "Salário",
    valor: 6500,
    tipo: "receita",
    categoria: "Salário",
    data: "2026-11-01",
  },
  {
    id: "demo-2",
    descricao: "Freelance - Landing Page",
    valor: 2000,
    tipo: "receita",
    categoria: "Outros",
    data: "2026-11-02",
  },
  {
    id: "demo-3",
    descricao: "Aluguel",
    valor: 1800,
    tipo: "despesa",
    categoria: "Moradia",
    data: "2026-11-03",
  },
  {
    id: "demo-4",
    descricao: "Supermercado",
    valor: 850,
    tipo: "despesa",
    categoria: "Alimentação",
    data: "2026-11-03",
  },
  {
    id: "demo-5",
    descricao: "Internet e celular",
    valor: 200,
    tipo: "despesa",
    categoria: "Outros",
    data: "2026-11-03",
  },
];


export type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria?: string;
  data?: string;
};

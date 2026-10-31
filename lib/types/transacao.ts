
export type Transacao = {
  id: number | string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria?: string;
  data?: string;
};

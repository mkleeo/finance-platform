
import type { Transacao } from "@/lib/types/transacao";

// Formato de uma transação recebida do banco Neon
export type TransacaoNeon = {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  data: string;
  criadoEm: string;
};

// Converte a data do Neon para o formato YYYY-MM-DD
export function converterDataNeon(data: string): string {
  return data.slice(0, 10);
}

// Converte uma transação recebida do Neon
export function converterTransacaoNeon(
  transacao: TransacaoNeon
): Omit<Transacao, "id"> & { id: string } {
  return {
    id: transacao.id,
    descricao: transacao.descricao,
    valor: transacao.valor,
    tipo: transacao.tipo as "receita" | "despesa",
    categoria: transacao.categoria,
    data: converterDataNeon(transacao.data),
  };
}


export async function buscarTransacoesNeon(): Promise<
  TransacaoNeon[]
> {
  const resposta = await fetch("/api/transacoes", {
    cache: "no-store",
  });

  if (!resposta.ok) {
    throw new Error("Erro ao buscar transações do Neon.");
  }

  const dados: TransacaoNeon[] = await resposta.json();

  return dados;
}


import type { Transacao } from "@/lib/types/transacao";

// Cria um identificador estável para uma transação antiga.
export function criarIdMigracao(idOriginal: number | string): string {
  return `local-${idOriginal}`;
}

// Prepara uma transação antiga para a migração.
export function prepararTransacaoMigracao(transacao: Transacao) {
  return {
    id: criarIdMigracao(transacao.id),
    descricao: transacao.descricao,
    valor: transacao.valor,
    tipo: transacao.tipo,
    categoria: transacao.categoria ?? "Outros",
    data: transacao.data,
  };
}


export function selecionarTransacoesDemonstracao(
  transacoes: Transacao[]
): Transacao[] {
  const idsDemonstracao = [1, 2, 3, 4];

  return transacoes.filter((transacao) =>
    idsDemonstracao.includes(Number(transacao.id))
  );
}

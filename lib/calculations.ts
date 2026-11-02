
import type { Transacao } from "@/lib/types/transacao";

// Calcula o total de receitas
export const calcularReceitas = (transacoes: Transacao[]) => {
  return transacoes
    .filter((transacao) => transacao.tipo === "receita")
    .reduce((total, transacao) => total + transacao.valor, 0);
};

// Calcula o total de despesas
export const calcularDespesas = (transacoes: Transacao[]) => {
  return transacoes
    .filter((transacao) => transacao.tipo === "despesa")
    .reduce((total, transacao) => total + transacao.valor, 0);
};

// Calcula o saldo financeiro
export const calcularSaldo = (receitas: number, despesas: number) => {
  return receitas - despesas;
};

// Agrupa e soma as despesas por categoria
export const calcularDespesasPorCategoria = (
  transacoes: Transacao[]
): Record<string, number> => {
  return transacoes
    .filter((transacao) => transacao.tipo === "despesa")
    .reduce<Record<string, number>>((acumulador, transacao) => {
      const categoriaAtual = transacao.categoria ?? "Outros";

      acumulador[categoriaAtual] =
        (acumulador[categoriaAtual] ?? 0) + transacao.valor;

      return acumulador;
    }, {});
};

// Calcula a porcentagem de uma categoria
export const calcularPorcentagem = (
  valor: number,
  total: number
): string => {
  if (total === 0) return "0,0";

  return ((valor / total) * 100)
    .toFixed(1)
    .replace(".", ",");
};

// Prepara os dados para o gráfico de pizza
export const prepararDadosGrafico = (
  despesasPorCategoria: Record<string, number>
) => {
  return Object.entries(despesasPorCategoria).map(
    ([nome, valor]) => ({
      name: nome,
      value: valor,
    })
  );
};

export const calcularTotalGrafico = (
  dados: { name: string; value: number }[]
): number => {
  return dados.reduce((total, item) => total + item.value, 0);
};
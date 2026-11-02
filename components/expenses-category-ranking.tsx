
"use client";

import { useMemo } from "react";
import { TrendingDown, Trophy } from "lucide-react";

import type { Transacao } from "@/lib/types/transacao";
import { formatarMoeda } from "@/lib/formatters";

type Props = {
  transacoes: Transacao[];
};

const CORES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function ExpensesCategoryRanking({ transacoes }: Props) {
  const categorias = useMemo(() => {
    const totais: Record<string, number> = {};

    transacoes
      .filter((transacao) => transacao.tipo === "despesa")
      .forEach((transacao) => {
        const categoria = transacao.categoria || "Outros";

        totais[categoria] =
          (totais[categoria] ?? 0) + transacao.valor;
      });

    return Object.entries(totais)
      .map(([nome, valor]) => ({ nome, valor }))
      .filter((categoria) => categoria.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [transacoes]);

  const total = categorias.reduce(
    (soma, categoria) => soma + categoria.valor,
    0
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <TrendingDown className="h-6 w-6 text-rose-400" />

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Despesas por Categoria
          </h2>

          <p className="text-sm text-muted-foreground">
            Veja quais categorias representam seus maiores gastos.
          </p>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma despesa encontrada no período selecionado.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Categoria com maior despesa
              </span>
            </div>

            <p className="mt-2 text-lg font-bold text-foreground">
              {categorias[0].nome}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {formatarMoeda(categorias[0].valor)}
            </p>
          </div>

          <div className="space-y-5">
            {categorias.map((categoria, indice) => {
              const porcentagem =
                total > 0
                  ? (categoria.valor / total) * 100
                  : 0;

              return (
                <div key={categoria.nome}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {indice + 1}. {categoria.nome}
                    </span>

                    <span className="text-sm font-semibold text-foreground">
                      {formatarMoeda(categoria.valor)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        CORES[indice % CORES.length]
                      }`}
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {porcentagem.toFixed(1).replace(".", ",")}% das despesas
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <span className="font-semibold text-foreground">
              Total de despesas
            </span>

            <span className="text-lg font-bold text-rose-400">
              {formatarMoeda(total)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

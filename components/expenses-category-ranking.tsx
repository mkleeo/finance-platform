
"use client";

import { useMemo } from "react";
import { TrendingDown, Trophy } from "lucide-react";

import type { Transacao } from "@/lib/types/transacao";
import { formatarMoeda } from "@/lib/formatters";

type Props = {
  transacoes: Transacao[];
};

const CORES = [
  "bg-blue-600",
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
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <TrendingDown className="h-6 w-6 text-red-600" />

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Despesas por Categoria
          </h2>

          <p className="text-sm text-slate-500">
            Veja quais categorias representam seus maiores gastos.
          </p>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Nenhuma despesa encontrada no período selecionado.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Categoria com maior despesa
              </span>
            </div>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {categorias[0].nome}
            </p>

            <p className="mt-1 text-sm text-slate-600">
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
                    <span className="text-sm font-medium text-slate-800">
                      {indice + 1}. {categoria.nome}
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatarMoeda(categoria.valor)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        CORES[indice % CORES.length]
                      }`}
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-500">
                    {porcentagem
                      .toFixed(1)
                      .replace(".", ",")}
                    % das despesas
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <span className="font-semibold text-slate-700">
              Total de despesas
            </span>

            <span className="text-lg font-bold text-red-600">
              {formatarMoeda(total)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}


"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { CORES_GRAFICO } from "@/lib/chart-config";
import { calcularPorcentagem } from "@/lib/calculations";
import { formatarMoeda } from "@/lib/formatters";

type ExpensesChartProps = {
  despesasPorCategoria: Record<string, number>;
  dadosGrafico: { name: string; value: number }[];
  totalDespesasGrafico: number;
};

export function ExpensesChart({
  despesasPorCategoria,
  dadosGrafico,
  totalDespesasGrafico,
}: ExpensesChartProps) {
  return (
    <section className="mt-8">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Análise de Despesas
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Visualize como seus gastos estão distribuídos por categoria.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">
            Distribuição das Despesas
          </h3>

          {dadosGrafico.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {dadosGrafico.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={CORES_GRAFICO[index % CORES_GRAFICO.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatarMoeda(Number(value))}
                  />

                  <Legend
                    formatter={(value) => {
                      const categoria = dadosGrafico.find(
                        (item) => item.name === value
                      );

                      if (!categoria) return value;

                      return `${value}: ${formatarMoeda(categoria.value)} (${calcularPorcentagem(categoria.value, totalDespesasGrafico)}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500">
              Nenhuma despesa cadastrada.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Resumo por Categoria
          </h3>

          {Object.entries(despesasPorCategoria).length === 0 ? (
            <p className="text-slate-500">
              Nenhuma despesa cadastrada.
            </p>
          ) : (
            Object.entries(despesasPorCategoria).map(
              ([nomeCategoria, total]) => {
                const indice = dadosGrafico.findIndex(
                  (item) => item.name === nomeCategoria
                );

                return (
                  <div
                    key={nomeCategoria}
                    className="border-b py-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span>{nomeCategoria}</span>

                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatarMoeda(total)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {calcularPorcentagem(
                            total,
                            totalDespesasGrafico
                          )}% das despesas
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            totalDespesasGrafico > 0
                              ? (total / totalDespesasGrafico) * 100
                              : 0
                          }%`,
                          backgroundColor:
                            CORES_GRAFICO[
                              indice % CORES_GRAFICO.length
                            ] || "#2563eb",
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </section>
  );
}

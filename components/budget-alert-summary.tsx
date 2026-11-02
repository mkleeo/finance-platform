
"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

type Props = {
  categoriasDentro: number;
  categoriasAtencao: number;
  categoriasExcedidas: number;
};

export function BudgetAlertSummary({
  categoriasDentro,
  categoriasAtencao,
  categoriasExcedidas,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-400" />

        <p className="text-sm font-medium text-emerald-300">
          Dentro do limite
        </p>

        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {categoriasDentro}
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="mb-2 h-5 w-5 text-amber-400" />

        <p className="text-sm font-medium text-amber-300">
          Em atenção
        </p>

        <p className="mt-1 text-2xl font-bold text-amber-400">
          {categoriasAtencao}
        </p>
      </div>

      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
        <ShieldAlert className="mb-2 h-5 w-5 text-rose-400" />

        <p className="text-sm font-medium text-rose-300">
          Limite ultrapassado
        </p>

        <p className="mt-1 text-2xl font-bold text-rose-400">
          {categoriasExcedidas}
        </p>
      </div>
    </div>
  );
}

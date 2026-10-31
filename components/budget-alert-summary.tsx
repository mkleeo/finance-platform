
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
        <p className="text-sm text-emerald-700">
          Dentro do limite
        </p>
        <p className="text-2xl font-bold text-emerald-700">
          {categoriasDentro}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mb-2 h-5 w-5 text-amber-600" />
        <p className="text-sm text-amber-700">
          Em atenção
        </p>
        <p className="text-2xl font-bold text-amber-700">
          {categoriasAtencao}
        </p>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <ShieldAlert className="mb-2 h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Limite ultrapassado
        </p>
        <p className="text-2xl font-bold text-red-700">
          {categoriasExcedidas}
        </p>
      </div>
    </div>
  );
}

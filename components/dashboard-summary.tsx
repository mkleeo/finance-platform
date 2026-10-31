
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatarMoeda } from "@/lib/formatters";

type DashboardSummaryProps = {
  saldo: number;
  receitas: number;
  despesas: number;
};

export function DashboardSummary({
  saldo,
  receitas,
  despesas,
}: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Saldo Total
          </CardTitle>

          <div className="rounded-xl bg-blue-50 p-3">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {formatarMoeda(saldo)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Saldo do período selecionado
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Receitas
          </CardTitle>

          <div className="rounded-xl bg-emerald-50 p-3">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-emerald-600">
            {formatarMoeda(receitas)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Total de receitas do período
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Despesas
          </CardTitle>

          <div className="rounded-xl bg-red-50 p-3">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-red-600">
            {formatarMoeda(despesas)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Total de despesas do período
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

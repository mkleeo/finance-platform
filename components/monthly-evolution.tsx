
"use client";

import { useMemo } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

import type { Transacao } from "@/lib/types/transacao";
import { formatarMoeda } from "@/lib/formatters";
import {
  calcularReceitas,
  calcularDespesas,
  calcularSaldo,
} from "@/lib/calculations";

type Props = {
  transacoes: Transacao[];
  ano: number;
  mes: number | null;
};

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function filtrarPeriodo(
  transacoes: Transacao[],
  ano: number,
  mes: number
) {
  return transacoes.filter((transacao) => {
    if (!transacao.data) return false;

    const [anoTransacao, mesTransacao] = transacao.data
      .split("-")
      .map(Number);

    return anoTransacao === ano && mesTransacao === mes;
  });
}

function variacaoPercentual(atual: number, anterior: number) {
  if (anterior === 0) return null;

  return ((atual - anterior) / anterior) * 100;
}

function formatarPercentual(valor: number | null) {
  if (valor === null) return "Sem base anterior";

  return `${valor > 0 ? "+" : ""}${valor
    .toFixed(1)
    .replace(".", ",")}%`;
}

export function MonthlyEvolution({
  transacoes,
  ano,
  mes,
}: Props) {
  const dados = useMemo(() => {
    if (mes === null) return null;

    const dataAnterior = new Date(ano, mes - 2, 1);
    const anoAnterior = dataAnterior.getFullYear();
    const mesAnterior = dataAnterior.getMonth() + 1;

    const atuais = filtrarPeriodo(transacoes, ano, mes);
    const anteriores = filtrarPeriodo(
      transacoes,
      anoAnterior,
      mesAnterior
    );

    const receitas = calcularReceitas(atuais);
    const despesas = calcularDespesas(atuais);

    const receitasAnteriores = calcularReceitas(anteriores);
    const despesasAnteriores = calcularDespesas(anteriores);

    return {
      periodoAtual: `${MESES[mes - 1]} de ${ano}`,
      periodoAnterior: `${MESES[mesAnterior - 1]} de ${anoAnterior}`,
      receitas,
      despesas,
      saldo: calcularSaldo(receitas, despesas),
      receitasAnteriores,
      despesasAnteriores,
      saldoAnterior: calcularSaldo(
        receitasAnteriores,
        despesasAnteriores
      ),
      variacaoReceitas: variacaoPercentual(
        receitas,
        receitasAnteriores
      ),
      variacaoDespesas: variacaoPercentual(
        despesas,
        despesasAnteriores
      ),
    };
  }, [transacoes, ano, mes]);

  if (!dados) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Evolução Financeira Mensal
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          Selecione um mês no filtro acima para comparar com o mês anterior.
        </p>
      </section>
    );
  }

  const diferencaSaldo = dados.saldo - dados.saldoAnterior;

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <ArrowLeftRight className="h-6 w-6 text-blue-600" />

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Evolução Financeira Mensal
          </h2>

          <p className="text-sm text-slate-500">
            {dados.periodoAtual} comparado com{" "}
            {dados.periodoAnterior}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 p-4">
          <TrendingUp className="mb-3 h-5 w-5 text-emerald-600" />

          <p className="text-sm text-slate-500">
            Evolução das receitas
          </p>

          <p className="mt-2 text-xl font-bold text-emerald-600">
            {formatarMoeda(dados.receitas)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Mês anterior:{" "}
            {formatarMoeda(dados.receitasAnteriores)}
          </p>

          <p className="mt-2 text-sm font-medium">
            {formatarPercentual(dados.variacaoReceitas)}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 p-4">
          <TrendingDown className="mb-3 h-5 w-5 text-red-600" />

          <p className="text-sm text-slate-500">
            Evolução das despesas
          </p>

          <p className="mt-2 text-xl font-bold text-red-600">
            {formatarMoeda(dados.despesas)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Mês anterior:{" "}
            {formatarMoeda(dados.despesasAnteriores)}
          </p>

          <p className="mt-2 text-sm font-medium">
            {formatarPercentual(dados.variacaoDespesas)}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 p-4">
          <Wallet className="mb-3 h-5 w-5 text-blue-600" />

          <p className="text-sm text-slate-500">
            Evolução do saldo
          </p>

          <p
            className={`mt-2 text-xl font-bold ${
              dados.saldo >= 0
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            {formatarMoeda(dados.saldo)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Mês anterior:{" "}
            {formatarMoeda(dados.saldoAnterior)}
          </p>

          <p
            className={`mt-2 text-sm font-medium ${
              diferencaSaldo >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            Diferença: {formatarMoeda(diferencaSaldo)}
          </p>
        </div>
      </div>
    </section>
  );
}

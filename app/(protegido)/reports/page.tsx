
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExpensesCategoryRanking } from "@/components/expenses-category-ranking";
import { MonthlyEvolution } from "@/components/monthly-evolution";
import { MonthlyBudget } from "@/components/monthly-budget";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartColumnIncreasing,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  ArrowLeftRight,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import type { Transacao } from "@/lib/types/transacao";
import {
  buscarTransacoesNeon,
  converterTransacaoNeon,
} from "@/lib/transacoes-api";
import { formatarMoeda } from "@/lib/formatters";
import {
  calcularReceitas,
  calcularDespesas,
  calcularSaldo,
} from "@/lib/calculations";

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

const MESES_CURTOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function obterAnoEMes(data?: string) {
  if (!data) return null;

  const resultado = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!resultado) return null;

  const ano = Number(resultado[1]);
  const mes = Number(resultado[2]);
  const dia = Number(resultado[3]);

  const dataValidada = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    dataValidada.getUTCFullYear() !== ano ||
    dataValidada.getUTCMonth() !== mes - 1 ||
    dataValidada.getUTCDate() !== dia
  ) {
    return null;
  }

  return { ano, mes };
}

function calcularVariacao(atual: number, anterior: number) {
  if (anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

function formatarVariacao(variacao: number | null) {
  if (variacao === null) return "Sem base de comparação";

  const sinal = variacao > 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(1).replace(".", ",")}%`;
}

export default function ReportsPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState(2026);
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarTransacoes() {
      try {
        const dados = await buscarTransacoesNeon();
        const transacoesConvertidas = dados.map(converterTransacaoNeon);

        if (ativo) {
          setTransacoes(transacoesConvertidas);
        }
      } catch (erro) {
        console.error("Erro ao carregar transações do Neon:", erro);

        if (ativo) {
          toast.error("Não foi possível carregar os relatórios.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarTransacoes();

    return () => {
      ativo = false;
    };
  }, []);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>([
      anoSelecionado - 2,
      anoSelecionado - 1,
      anoSelecionado,
      anoSelecionado + 1,
    ]);

    transacoes.forEach((transacao) => {
      const data = obterAnoEMes(transacao.data);
      if (data) anos.add(data.ano);
    });

    return [...anos].sort((a, b) => b - a);
  }, [transacoes, anoSelecionado]);

  const mesNumero =
    mesSelecionado === "todos"
      ? null
      : Number(mesSelecionado);

  const transacoesDoPeriodo = useMemo(() => {
    return transacoes.filter((transacao) => {
      const data = obterAnoEMes(transacao.data);

      if (!data || data.ano !== anoSelecionado) {
        return false;
      }

      return mesNumero === null || data.mes === mesNumero;
    });
  }, [transacoes, anoSelecionado, mesNumero]);

  const transacoesPeriodoAnterior = useMemo(() => {
    return transacoes.filter((transacao) => {
      const data = obterAnoEMes(transacao.data);

      if (!data || data.ano !== anoSelecionado - 1) {
        return false;
      }

      return mesNumero === null || data.mes === mesNumero;
    });
  }, [transacoes, anoSelecionado, mesNumero]);

  const receitas = calcularReceitas(transacoesDoPeriodo);
  const despesas = calcularDespesas(transacoesDoPeriodo);
  const saldo = calcularSaldo(receitas, despesas);

  const receitasAnteriores = calcularReceitas(
    transacoesPeriodoAnterior
  );
  const despesasAnteriores = calcularDespesas(
    transacoesPeriodoAnterior
  );
  const saldoAnterior = calcularSaldo(
    receitasAnteriores,
    despesasAnteriores
  );

  const variacaoReceitas = calcularVariacao(
    receitas,
    receitasAnteriores
  );
  const variacaoDespesas = calcularVariacao(
    despesas,
    despesasAnteriores
  );

  const dadosMensais = useMemo(() => {
    return MESES_CURTOS.map((mes, indice) => {
      const transacoesDoMes = transacoesDoPeriodo.filter(
        (transacao) =>
          obterAnoEMes(transacao.data)?.mes === indice + 1
      );

      return {
        mes,
        receitas: calcularReceitas(transacoesDoMes),
        despesas: calcularDespesas(transacoesDoMes),
      };
    }).filter(
      (_, indice) =>
        mesNumero === null || indice + 1 === mesNumero
    );
  }, [transacoesDoPeriodo, mesNumero]);

  const periodoTexto =
    mesNumero === null
      ? `Ano de ${anoSelecionado}`
      : `${MESES[mesNumero - 1]} de ${anoSelecionado}`;

  const periodoAnteriorTexto =
    mesNumero === null
      ? `Ano de ${anoSelecionado - 1}`
      : `${MESES[mesNumero - 1]} de ${anoSelecionado - 1}`;

  const quantidadeSemData = transacoes.filter(
    (transacao) => !obterAnoEMes(transacao.data)
  ).length;

  return (
    <main className="min-h-screen min-w-0 flex-1 bg-background text-foreground p-4 md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
              <ChartColumnIncreasing className="h-5 w-5" />
              <span className="text-sm font-medium">
                Análise Financeira
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground">
              Relatórios
            </h1>

            <p className="mt-2 text-muted-foreground">
              Acompanhe o desempenho das suas finanças.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label
                htmlFor="ano-relatorio"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <CalendarDays className="h-4 w-4" />
                Ano
              </label>

              <select
                id="ano-relatorio"
                value={anoSelecionado}
                onChange={(evento) =>
                  setAnoSelecionado(Number(evento.target.value))
                }
                className="h-11 min-w-32 rounded-xl border border-input bg-secondary px-3 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="mes-relatorio"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Mês
              </label>

              <select
                id="mes-relatorio"
                value={mesSelecionado}
                onChange={(evento) =>
                  setMesSelecionado(evento.target.value)
                }
                className="h-11 min-w-44 rounded-xl border border-input bg-secondary px-3 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="todos">Todos os meses</option>

                {MESES.map((mes, indice) => (
                  <option key={mes} value={indice + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {carregando && (
          <p role="status" className="mb-5 text-sm text-muted-foreground">Carregando dados financeiros...</p>
        )}
        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <TrendingUp className="mb-4 h-6 w-6 text-emerald-400" />
            <p className="text-sm text-muted-foreground">
              Receitas — {periodoTexto}
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {formatarMoeda(receitas)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {
                transacoesDoPeriodo.filter(
                  (transacao) => transacao.tipo === "receita"
                ).length
              }{" "}
              receitas registradas
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <TrendingDown className="mb-4 h-6 w-6 text-rose-400" />
            <p className="text-sm text-muted-foreground">
              Despesas — {periodoTexto}
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-400">
              {formatarMoeda(despesas)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {
                transacoesDoPeriodo.filter(
                  (transacao) => transacao.tipo === "despesa"
                ).length
              }{" "}
              despesas registradas
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <Wallet className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              Saldo — {periodoTexto}
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${
                saldo >= 0 ? "text-primary" : "text-rose-400"
              }`}
            >
              {formatarMoeda(saldo)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Receitas menos despesas
            </p>
          </div>
        </div>
        <div className="mb-7 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Receitas x Despesas por Mês
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Período selecionado: {periodoTexto}.
          </p>

          <div className="mt-8 h-80 min-w-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={72} />
                <Tooltip
  cursor={{ fill: "transparent" }}
  contentStyle={{
    backgroundColor: "#182338",
    border: "1px solid #334155",
    borderRadius: 12,
    color: "#f8fafc",
  }}
  labelStyle={{ color: "#f8fafc" }}
  itemStyle={{ color: "#f8fafc" }}
  formatter={(valor) =>
    formatarMoeda(Number(valor))
  }
/>
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                <Bar
                  dataKey="receitas"
                  name="Receitas"
                  fill="#4ade80"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="#fb7185"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {transacoesDoPeriodo.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada para este período.
            </p>
          )}
        </div>

        <div className="mb-7">
  <ExpensesCategoryRanking transacoes={transacoesDoPeriodo} />
</div>

<div className="mb-7">
  <MonthlyEvolution
    transacoes={transacoes}
    ano={anoSelecionado}
    mes={mesNumero}
  />
</div>
<div className="mb-7">
  <MonthlyBudget
    transacoes={transacoes}
    ano={anoSelecionado}
    mes={mesNumero}
  />
</div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <ArrowLeftRight className="h-6 w-6 text-primary" />

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Comparação de Períodos
              </h2>
              <p className="text-sm text-muted-foreground">
                {periodoTexto} comparado com{" "}
                {periodoAnteriorTexto}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">Indicador</th>
                  <th className="pb-3 font-medium">
                    {anoSelecionado - 1}
                  </th>
                  <th className="pb-3 font-medium">
                    {anoSelecionado}
                  </th>
                  <th className="pb-3 font-medium">Variação</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 font-medium">Receitas</td>
                  <td className="py-4">
                    {formatarMoeda(receitasAnteriores)}
                  </td>
                  <td className="py-4 text-emerald-400">
                    {formatarMoeda(receitas)}
                  </td>
                  <td className="py-4">
                    {formatarVariacao(variacaoReceitas)}
                  </td>
                </tr>

                <tr className="border-b border-border">
                  <td className="py-4 font-medium">Despesas</td>
                  <td className="py-4">
                    {formatarMoeda(despesasAnteriores)}
                  </td>
                  <td className="py-4 text-rose-400">
                    {formatarMoeda(despesas)}
                  </td>
                  <td className="py-4">
                    {formatarVariacao(variacaoDespesas)}
                  </td>
                </tr>

                <tr>
                  <td className="py-4 font-medium">Saldo</td>
                  <td className="py-4">
                    {formatarMoeda(saldoAnterior)}
                  </td>
                  <td className="py-4">
                    {formatarMoeda(saldo)}
                  </td>
                  <td className="py-4 text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            A variação percentual utiliza o mesmo período
            do ano anterior como referência. Quando o valor
            anterior é zero, não há base de comparação.
          </p>
        </div>

        {quantidadeSemData > 0 && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Atenção: {quantidadeSemData}{" "}
            {quantidadeSemData === 1
              ? "transação não possui data válida"
              : "transações não possuem data válida"}{" "}
            e não entram nos relatórios por período.</span>
          </p>
        )}
      </div>
    </main>
  );
}

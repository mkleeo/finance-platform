"use client";

import { BudgetAlertSummary } from "@/components/budget-alert-summary";

import { useEffect, useMemo, useState } from "react";
import { PiggyBank, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";


import type { Transacao } from "@/lib/types/transacao";
import { formatarMoeda } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIAS } from "@/lib/categories";

type Props = {
  transacoes: Transacao[];
  ano: number;
  mes: number | null;
};

type Orcamentos = Record<string, number>;

const CHAVE_STORAGE = "finance-monthly-budgets";

export function MonthlyBudget({
  transacoes,
  ano,
  mes,
}: Props) {
  const [orcamentos, setOrcamentos] = useState<Orcamentos>({});
  const [valores, setValores] = useState<Record<string, string>>({});
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvos = localStorage.getItem(CHAVE_STORAGE);

      if (salvos) {
        const dados = JSON.parse(salvos);

        if (
          dados &&
          typeof dados === "object" &&
          !Array.isArray(dados)
        ) {
          const validos: Orcamentos = {};

          Object.entries(dados).forEach(([categoria, valor]) => {
            if (
              typeof valor === "number" &&
              Number.isFinite(valor) &&
              valor > 0
            ) {
              validos[categoria] = valor;
            }
          });

          setOrcamentos(validos);

          setValores(
            Object.fromEntries(
              Object.entries(validos).map(([categoria, valor]) => [
                categoria,
                String(valor),
              ])
            )
          );
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar orçamentos:", erro);
    } finally {
      setCarregado(true);
    }
  }, []);

  const despesasPorCategoria = useMemo(() => {
    const totais: Record<string, number> = {};

    if (mes === null) return totais;

    transacoes.forEach((transacao) => {
      if (
        transacao.tipo !== "despesa" ||
        !transacao.data
      ) {
        return;
      }

      const [anoTransacao, mesTransacao] =
        transacao.data.split("-").map(Number);

      if (anoTransacao !== ano || mesTransacao !== mes) {
        return;
      }

      const categoria = transacao.categoria || "Outros";

      totais[categoria] =
        (totais[categoria] ?? 0) + transacao.valor;
    });

    return totais;
  }, [transacoes, ano, mes]);

  const resumoAlertas = useMemo(() => {
  let categoriasDentro = 0;
  let categoriasAtencao = 0;
  let categoriasExcedidas = 0;

  for (const [categoria, limite] of Object.entries(orcamentos)) {
    if (limite <= 0) continue;

    const gasto = despesasPorCategoria[categoria] ?? 0;
    const percentual = (gasto / limite) * 100;

    if (percentual >= 100) {
      categoriasExcedidas++;
    } else if (percentual >= 80) {
      categoriasAtencao++;
    } else {
      categoriasDentro++;
    }
  }

  return {
    categoriasDentro,
    categoriasAtencao,
    categoriasExcedidas,
  };
}, [orcamentos, despesasPorCategoria]);

  
function salvarOrcamentos() {
  const atualizados: Orcamentos = {};

  for (const [categoria, texto] of Object.entries(valores)) {
    if (texto.trim() === "") continue;

    const numero = Number(texto);

    if (!Number.isFinite(numero) || numero < 0) {
      toast.error(`Limite inválido para ${categoria}.`);
      return;
    }

    if (numero > 0) {
      atualizados[categoria] = numero;
    }
  }

  try {
    localStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(atualizados)
    );

    setOrcamentos(atualizados);

    const excedidas: string[] = [];
    const emAtencao: string[] = [];

    for (const [categoria, limite] of Object.entries(atualizados)) {
      const gasto = despesasPorCategoria[categoria] ?? 0;
      const percentual = (gasto / limite) * 100;

      if (percentual >= 100) {
        excedidas.push(categoria);
      } else if (percentual >= 80) {
        emAtencao.push(categoria);
      }
    }

    if (excedidas.length > 0) {
      toast.error("Orçamento atingido ou ultrapassado!", {
        description: excedidas
          .map((categoria) => {
            const gasto = despesasPorCategoria[categoria] ?? 0;
            const limite = atualizados[categoria];

            return `${categoria}: ${formatarMoeda(gasto)} de ${formatarMoeda(limite)}`;
          })
          .join(" | "),
        duration: 6000,
      });
    } else if (emAtencao.length > 0) {
      toast.warning("Atenção ao seu orçamento!", {
        description: emAtencao
          .map((categoria) => {
            const gasto = despesasPorCategoria[categoria] ?? 0;
            const limite = atualizados[categoria];
            const percentual = (gasto / limite) * 100;

            return `${categoria}: ${percentual.toFixed(1).replace(".", ",")}% utilizado`;
          })
          .join(" | "),
        duration: 5000,
      });
    } else {
      toast.success("Orçamentos salvos com sucesso!");
    }
  } catch {
    toast.error("Não foi possível salvar os orçamentos.");
  }
}


  if (mes === null) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <PiggyBank className="h-6 w-6 text-sky-400" />

          <h2 className="text-xl font-semibold text-foreground">
            Orçamento Mensal
          </h2>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Selecione um mês para configurar e acompanhar
          seus limites de gastos.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <PiggyBank className="h-6 w-6 text-sky-400" />

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Orçamento Mensal
          </h2>

          <p className="text-sm text-muted-foreground">
            Defina limites e acompanhe seus gastos por categoria.
          </p>
        </div>
      </div>

      <div className="mb-6">
  <BudgetAlertSummary {...resumoAlertas} />
</div>

      <div className="space-y-5">
        {CATEGORIAS.map((categoria) => {
          const limite = orcamentos[categoria] ?? 0;
          const gasto = despesasPorCategoria[categoria] ?? 0;

          const percentual =
            limite > 0 ? (gasto / limite) * 100 : 0;

          const corBarra =
            percentual >= 100
              ? "bg-red-500"
              : percentual >= 80
              ? "bg-amber-500"
              : "bg-emerald-500";

          return (
            <div
              key={categoria}
              className="rounded-xl border border-border bg-muted/40 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">
                  {categoria}
                </h3>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Limite R$
                  </span>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex.: 1000"
                    className="w-36 border-input bg-background text-foreground"
                    value={valores[categoria] ?? ""}
                    onChange={(evento) =>
                      setValores((atual) => ({
                        ...atual,
                        [categoria]: evento.target.value,
                      }))
                    }
                    disabled={!carregado}
                  />
                </div>
              </div>

              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  Gasto: {formatarMoeda(gasto)}
                </span>

                <span className="font-medium text-foreground">
                  {limite > 0
                    ? `${percentual
                        .toFixed(1)
                        .replace(".", ",")}%`
                    : "Sem limite"}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${corBarra}`}
                  style={{
                    width: `${
                      limite > 0
                        ? Math.min(percentual, 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              {limite > 0 && percentual >= 80 && (
                <p
                  className={`mt-3 flex items-center gap-2 text-sm ${
                    percentual >= 100
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />

                  {percentual >= 100
                    ? "Limite atingido ou ultrapassado!"
                    : "Atenção: você utilizou 80% ou mais do limite."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={salvarOrcamentos}
          disabled={!carregado}
          className="gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400"
        >
          <Save className="h-4 w-4" />
          Salvar orçamentos
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Os limites são compartilhados entre os meses.
        Nesta versão, os mesmos valores são utilizados
        em todos os períodos.
      </p>
    </section>
  );
}

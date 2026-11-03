
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DashboardSummary } from "@/components/dashboard-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIAS } from "@/lib/categories";
import { transacoesDemo } from "@/lib/demo-data";
import { CORES_GRAFICO } from "@/lib/chart-config";
import {
  calcularReceitas,
  calcularDespesas,
  calcularSaldo,
  calcularDespesasPorCategoria,
  prepararDadosGrafico,
} from "@/lib/calculations";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import type { Transacao } from "@/lib/types/transacao";

type Tipo = "receita" | "despesa";

function dataLocal() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export default function DemoPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>(() =>
    transacoesDemo.map((item) => ({ ...item }))
  );

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<Tipo>("despesa");
  const [categoria, setCategoria] = useState<string>("Outros");
  const [data, setData] = useState(() => dataLocal());
  const [idEdicao, setIdEdicao] = useState<Transacao["id"] | null>(null);

  const [periodo, setPeriodo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busca, setBusca] = useState("");

  const periodos = Array.from(
    new Set([
      dataLocal().slice(0, 7),
      ...transacoes
        .map((item) => item.data?.slice(0, 7))
        .filter((item): item is string => Boolean(item)),
    ])
  ).sort().reverse();

  const transacoesPeriodo = transacoes.filter(
    (item) => periodo === "todos" || item.data?.startsWith(periodo)
  );

  const receitas = calcularReceitas(transacoesPeriodo);
  const despesas = calcularDespesas(transacoesPeriodo);
  const saldo = calcularSaldo(receitas, despesas);

  const despesasCategoria =
    calcularDespesasPorCategoria(transacoesPeriodo);

  const dadosGrafico = prepararDadosGrafico(despesasCategoria);

  const transacoesFiltradas = transacoesPeriodo
    .filter(
      (item) => filtroTipo === "todos" || item.tipo === filtroTipo
    )
    .filter(
      (item) =>
        filtroCategoria === "todas" ||
        (item.categoria ?? "Outros") === filtroCategoria
    )
    .filter((item) =>
      item.descricao.toLowerCase().includes(busca.trim().toLowerCase())
    )
    .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setTipo("despesa");
    setCategoria("Outros");
    setData(dataLocal());
    setIdEdicao(null);
  }

  function salvarTransacao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const descricaoLimpa = descricao.trim();
    const valorNumerico = Number(valor);

    if (!descricaoLimpa || descricaoLimpa.length > 100) {
      toast.error("Informe uma descrição de até 100 caracteres.");
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    const dataValida =
      /^\d{4}-\d{2}-\d{2}$/.test(data) &&
      !Number.isNaN(new Date(`${data}T12:00:00`).getTime()) &&
      new Date(`${data}T12:00:00`).toISOString().slice(0, 10) === data;

    if (!dataValida) {
      toast.error("Selecione uma data válida.");
      return;
    }

    const dados = {
      descricao: descricaoLimpa,
      valor: valorNumerico,
      tipo,
      categoria,
      data,
    };

    if (idEdicao !== null) {
      setTransacoes((anteriores) =>
        anteriores.map((item) =>
          item.id === idEdicao ? { ...item, ...dados } : item
        )
      );
      toast.success("Transação fictícia atualizada!");
    } else {
      const novaTransacao: Transacao = {
        id: crypto.randomUUID(),
        ...dados,
      };

      setTransacoes((anteriores) => [
        ...anteriores,
        novaTransacao,
      ]);

      toast.success("Transação fictícia adicionada!");
    }

    limparFormulario();
  }

  function editarTransacao(item: Transacao) {
    setIdEdicao(item.id);
    setDescricao(item.descricao);
    setValor(String(item.valor));
    setTipo(item.tipo);
    setCategoria(item.categoria ?? "Outros");
    setData(item.data ?? dataLocal());

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function excluirTransacao(id: Transacao["id"]) {
    if (!window.confirm("Excluir esta transação fictícia?")) return;

    setTransacoes((anteriores) =>
      anteriores.filter((item) => item.id !== id)
    );

    if (idEdicao === id) limparFormulario();

    toast.success("Transação fictícia excluída!");
  }

  function restaurarDemo() {
    if (!window.confirm("Restaurar os dados iniciais da Demo?")) return;

    setTransacoes(transacoesDemo.map((item) => ({ ...item })));
    setPeriodo("todos");
    setFiltroTipo("todos");
    setFiltroCategoria("todas");
    setBusca("");
    limparFormulario();

    toast.success("Demonstração restaurada!");
  }

  function exportarCSV() {
    const linhas = [
      ["Data", "Descrição", "Tipo", "Categoria", "Valor"],
      ...transacoesFiltradas.map((item) => [
        item.data ?? "",
        item.descricao,
        item.tipo,
        item.categoria ?? "Outros",
        item.valor.toFixed(2).replace(".", ","),
      ]),
    ];

    const conteudo = linhas
      .map((linha) =>
        linha.map((campo) => `"${campo.replace(/"/g, '""')}"`).join(";")
      )
      .join("\r\n");

    const arquivo = new Blob(["\uFEFF", conteudo], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "finance-platform-demo.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  }

  return (
    <main className="min-h-screen bg-background p-4 text-foreground md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Wallet className="h-6 w-6" />
              <span className="font-semibold">Finance Platform</span>
            </div>

            <h1 className="text-3xl font-bold">
              Dashboard — Demo
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Explore a plataforma com dados 100% fictícios.
              Nenhuma operação altera contas reais.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={restaurarDemo}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Área de login
              </Link>
            </Button>
          </div>
        </header>

        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <strong>Modo demonstração:</strong> você pode cadastrar,
          editar e excluir transações livremente. As alterações
          são temporárias e desaparecem ao recarregar a página.
        </div>

        <section className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label htmlFor="periodo" className="text-sm font-medium">
              Período
            </label>

            <select
              id="periodo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="block rounded-lg border border-input bg-background p-2.5 text-sm"
            >
              <option value="todos">Todos os períodos</option>
              {periodos.map((item) => (
                <option key={item} value={item}>
                  {item.slice(5, 7)}/{item.slice(0, 4)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <DashboardSummary
          saldo={saldo}
          receitas={receitas}
          despesas={despesas}
        />

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-semibold">
            {idEdicao !== null ? "Editar Transação" : "Nova Transação"}
          </h2>

          <form onSubmit={salvarTransacao} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="descricao" className="text-sm">
                  Descrição
                </label>
                <Input
                  id="descricao"
                  value={descricao}
                  maxLength={100}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex.: Supermercado"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="valor" className="text-sm">
                  Valor (R$)
                </label>
                <Input
                  id="valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tipo" className="text-sm">
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as Tipo)}
                  className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="categoria" className="text-sm">
                  Categoria
                </label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                >
                  {CATEGORIAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="data" className="text-sm">
                  Data
                </label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                {idEdicao !== null
                  ? "Salvar alterações"
                  : "Adicionar transação"}
              </Button>

              {idEdicao !== null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={limparFormulario}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Distribuição das Despesas
            </h2>

            {dadosGrafico.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGrafico}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma despesa neste período.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Despesas por Categoria
            </h2>

            <div className="space-y-5">
              {dadosGrafico.map((item, index) => (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span>{item.name}</span>
                    <strong>{formatarMoeda(item.value)}</strong>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / (despesas || 1)) * 100}%`,
                        backgroundColor:
                          CORES_GRAFICO[index % CORES_GRAFICO.length],
                      }}
                    />
                  </div>
                </div>
              ))}

              {dadosGrafico.length === 0 && (
                <p className="text-muted-foreground">
                  Nenhuma despesa cadastrada.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Histórico de Transações
              </h2>
              <p className="text-sm text-muted-foreground">
                {transacoesFiltradas.length} transações encontradas
              </p>
            </div>

            <Button
              variant="outline"
              onClick={exportarCSV}
              disabled={transacoesFiltradas.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Buscar pela descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              aria-label="Filtrar por tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="rounded-lg border border-input bg-background p-2 text-sm"
            >
              <option value="todos">Todos os tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>

            <select
              aria-label="Filtrar por categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="rounded-lg border border-input bg-background p-2 text-sm"
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {transacoesFiltradas.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{item.descricao}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.categoria ?? "Outros"}
                    {item.data ? ` • ${formatarData(item.data)}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <strong
                    className={
                      item.tipo === "receita"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {item.tipo === "receita" ? "+" : "-"}
                    {formatarMoeda(item.valor)}
                  </strong>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => editarTransacao(item)}
                    aria-label={`Editar ${item.descricao}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => excluirTransacao(item.id)}
                    aria-label={`Excluir ${item.descricao}`}
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              </div>
            ))}

            {transacoesFiltradas.length === 0 && (
              <p className="p-10 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </p>
            )}
          </div>
        </section>

        <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Finance Platform — Ambiente demonstrativo com dados fictícios
        </footer>
      </div>
    </main>
  );
}

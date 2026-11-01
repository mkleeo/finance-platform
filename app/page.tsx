"use client";

import { useEffect, useState } from "react";
import { DashboardSummary } from "@/components/dashboard-summary";
import { CATEGORIAS } from "@/lib/categories";
import {
  calcularReceitas,
  calcularDespesas,
  calcularSaldo,
  calcularDespesasPorCategoria,
  calcularPorcentagem,
  prepararDadosGrafico,
  calcularTotalGrafico,
} from "@/lib/calculations";

import { CORES_GRAFICO } from "@/lib/chart-config";
import {
  formatarMoeda,
  formatarData,
  obterDataAtual,
} from "@/lib/formatters";
import type { Transacao } from "@/lib/types/transacao";
import {
  buscarTransacoesNeon,
  converterTransacaoNeon,
} from "@/lib/transacoes-api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Pencil,
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Plus,
  Save,
  Search,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";



export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, descricao: "Salário", valor: 5000, tipo: "receita" },
    { id: 2, descricao: "Freelancer", valor: 7000, tipo: "receita" },
    { id: 3, descricao: "Aluguel", valor: 2000, tipo: "despesa" },
    { id: 4, descricao: "Supermercado", valor: 1500, tipo: "despesa" },
  ]);

  const [carregando, setCarregando] = useState(true);
  
const [salvandoTransacao, setSalvandoTransacao] = useState(false);

const [salvandoEdicao, setSalvandoEdicao] = useState(false);

const [excluindoTransacao, setExcluindoTransacao] = useState(false);



useEffect(() => {
  async function testarConexaoNeon() {
    try {
      const dados = await buscarTransacoesNeon();

const transacoesConvertidas = dados.map(converterTransacaoNeon);


setTransacoes(transacoesConvertidas);

    } catch (erro) {
      console.error("Erro na conexão com o Neon:", erro);
    }
  }

  testarConexaoNeon();
}, []);

  
useEffect(() => {
  setCarregando(false);
}, []);



  
  // Gravação no localStorage desativada temporariamente.
  // Os dados antigos estão preservados para a migração.
  /*
  useEffect(() => {
    if (!carregando) {
      localStorage.setItem("transacoes", JSON.stringify(transacoes));
    }
  }, [transacoes, carregando]);
  */


  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [idEmEdicao, setIdEmEdicao] = useState<number | string | null>(null);
  const [idParaExcluir, setIdParaExcluir] = useState<number | string | null>(null);
  
const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false);

  const [categoria, setCategoria] = useState("Outros");
  const [data, setData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mesSelecionado, setMesSelecionado] = useState("01");
  const [anoSelecionado, setAnoSelecionado] = useState("2026");

  useEffect(() => {
    const hoje = obterDataAtual();
    setData(hoje);
    setMesSelecionado(hoje.slice(5, 7));
    setAnoSelecionado(hoje.slice(0, 4));
  }, []);

  const transacoesDoPeriodo = transacoes.filter((transacao) => {
    if (!transacao.data) return false;

    const [ano, mes] = transacao.data.split("-");

    return ano === anoSelecionado && mes === mesSelecionado;
  });

  const receitas = calcularReceitas(transacoesDoPeriodo);

const despesas = calcularDespesas(transacoesDoPeriodo);

const saldo = calcularSaldo(receitas, despesas);

  const transacoesFiltradas = transacoesDoPeriodo
  .filter((transacao) => {
    if (filtroCategoria === "Todas") {
      return true;
    }

    return (transacao.categoria ?? "Outros") === filtroCategoria;
  })
  .filter((transacao) => {
    return transacao.descricao
      .toLowerCase()
      .includes(busca.trim().toLowerCase());
  })
  .filter((transacao) => {
    if (filtroTipo === "Todos") {
      return true;
    }

    return transacao.tipo === filtroTipo;
  })
  .sort((a, b) => {
    return (b.data ?? "").localeCompare(a.data ?? "");
  });

  const totalDespesasFiltradas = calcularDespesas(transacoesFiltradas);

const totalReceitasFiltradas = calcularReceitas(transacoesFiltradas);

  const saldoFiltrado = calcularSaldo(
  totalReceitasFiltradas,
  totalDespesasFiltradas
);

  const despesasPorCategoria =
  calcularDespesasPorCategoria(transacoesDoPeriodo);

  const coresGrafico = CORES_GRAFICO;

  const dadosGrafico = prepararDadosGrafico(despesasPorCategoria);

  const totalDespesasGrafico = calcularTotalGrafico(dadosGrafico);

  
  // Retorna true quando um alerta de orçamento já foi exibido.
  const verificarAlertaOrcamento = (
    transacao: Transacao,
    listaAtualizada: Transacao[]
  ): boolean => {
    if (transacao.tipo !== "despesa" || !transacao.data) return false;

    try {
      const dadosSalvos = localStorage.getItem("finance-monthly-budgets");
      if (!dadosSalvos) return false;

      const orcamentos: Record<string, unknown> = JSON.parse(dadosSalvos);
      const categoriaAtual = transacao.categoria ?? "Outros";
      const limite = orcamentos[categoriaAtual];

      if (typeof limite !== "number" || !Number.isFinite(limite) || limite <= 0) {
        return false;
      }

      const periodo = transacao.data.slice(0, 7);
      const totalGasto = listaAtualizada
        .filter(
          (item) =>
            item.tipo === "despesa" &&
            (item.categoria ?? "Outros") === categoriaAtual &&
            item.data?.slice(0, 7) === periodo
        )
        .reduce((total, item) => total + item.valor, 0);

      const percentual = (totalGasto / limite) * 100;

      if (percentual >= 100) {
        toast.error("Despesa salva! Orçamento atingido ou ultrapassado!", {
          description: `${categoriaAtual}: ${formatarMoeda(totalGasto)} de ${formatarMoeda(limite)} (${percentual.toFixed(1).replace(".", ",")}% utilizado).`,
          duration: 7000,
        });
        return true;
      }

      if (percentual >= 80) {
        toast.warning("Despesa salva! Atenção ao orçamento!", {
          description: `${categoriaAtual}: ${formatarMoeda(totalGasto)} de ${formatarMoeda(limite)} (${percentual.toFixed(1).replace(".", ",")}% utilizado).`,
          duration: 6000,
        });
        return true;
      }
    } catch (erro) {
      console.error("Erro ao verificar orçamento:", erro);
    }

    return false;
  };

  
const adicionarTransacao = async () => {
  if (salvandoTransacao || salvandoEdicao) return;

    const descricaoLimpa = descricao.trim();
    const valorNumerico = Number(valor);
    
    if (!descricaoLimpa) {
  toast.error("Descrição obrigatória!", {
    description: "Informe uma descrição para a transação.",
  });
  return;
}

if (
  !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
  !Number.isFinite(new Date(`${data}T12:00:00`).getTime()) ||
  new Date(`${data}T12:00:00`).toISOString().slice(0, 10) !== data
) {
  toast.error("Data inválida!", {
    description: "Selecione uma data válida para a transação.",
  });

  return;
}

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
  toast.error("Valor inválido!", {
    description: "Informe um valor maior que zero para a transação.",
  });

  return;
}

    
    if (idEmEdicao !== null) {
      setSalvandoEdicao(true);
      
      
try {
  const resposta = await fetch(
    `/api/transacoes/${encodeURIComponent(String(idEmEdicao))}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descricao: descricaoLimpa,
        valor: valorNumerico,
        tipo,
        categoria,
        data,
      }),
    }
  );

  if (!resposta.ok) {
    const erro = await resposta.json();
    toast.error(erro.erro || "Não foi possível atualizar a transação.");
    return;
  }

      
      const listaAtualizada: Transacao[] = transacoes.map((transacao) =>
        transacao.id === idEmEdicao
          ? {
              ...transacao,
              descricao: descricaoLimpa,
              valor: valorNumerico,
              tipo,
              categoria,
              data,
            }
          : transacao
      );

      setTransacoes(listaAtualizada);
      const transacaoEditada = listaAtualizada.find(
        (transacao) => transacao.id === idEmEdicao
      );
      setIdEmEdicao(null);

      const alertaExibido = transacaoEditada
        ? verificarAlertaOrcamento(transacaoEditada, listaAtualizada)
        : false;

      

if (!alertaExibido) {
  toast.success("Transação atualizada com sucesso!");
}
} catch (erro) {
  console.error("Erro ao atualizar transação:", erro);
  toast.error("Erro de conexão ao atualizar a transação.");
  return;
} finally {
  setSalvandoEdicao(false);
}
} else {


      
      
setSalvandoTransacao(true);

try {
 const resposta = await fetch("/api/transacoes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    descricao: descricaoLimpa,
    valor: valorNumerico,
    tipo,
    categoria,
    data,
  }),
});

if (!resposta.ok) {
  toast.error("Não foi possível cadastrar a transação no Neon.");
  return;
}

const transacaoCriada = await resposta.json();
const novaTransacao = converterTransacaoNeon(transacaoCriada);


      const listaAtualizada = [...transacoes, novaTransacao];
      setTransacoes(listaAtualizada);

      const alertaExibido = verificarAlertaOrcamento(
        novaTransacao,
        listaAtualizada
      );

      
if (!alertaExibido) {
  toast.success("Transação adicionada com sucesso!");
}
} catch (erro) {
  console.error("Erro ao cadastrar transação:", erro);
  toast.error("Erro de conexão ao cadastrar a transação.");
  return;
} finally {
  setSalvandoTransacao(false);
}
}


    setDescricao("");
    setValor("");
    setTipo("despesa");
    setCategoria("Outros");
    setData(obterDataAtual());
  };

  
const excluirTransacao = async (id: number | string) => {
  
if (excluindoTransacao) return;

setExcluindoTransacao(true);

  try {
    const resposta = await fetch(
      `/api/transacoes/${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.json();
      toast.error(erro.erro || "Não foi possível excluir a transação.");
      return;
    }

    setTransacoes((anteriores) =>
      anteriores.filter((transacao) => transacao.id !== id)
    );
    
setDialogoExclusaoAberto(false);
setIdParaExcluir(null);


    toast.success("Transação excluída com sucesso!");
  
} catch (erro) {
  console.error("Erro ao excluir transação:", erro);
  toast.error("Erro de conexão ao excluir a transação.");
} finally {
  setExcluindoTransacao(false);
}
};


  const editarTransacao = (id: number | string) => {
    const transacao = transacoes.find((item) => item.id === id);
    if (!transacao) return;

    setIdEmEdicao(transacao.id);
    setDescricao(transacao.descricao);
    setValor(String(transacao.valor));
    setTipo(transacao.tipo as "receita" | "despesa");
    setCategoria(transacao.categoria ?? "Outros");
    setData(transacao.data ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicao = () => {
    setIdEmEdicao(null);
    setDescricao("");
    setValor("");
    setTipo("despesa");
    setCategoria("Outros");
    setData(obterDataAtual());
    
    toast.info("Edição cancelada", {
  description: "Nenhuma alteração foi realizada na transação.",
});
  };

  const limparFiltros = () => {
  setBusca("");
  setFiltroCategoria("Todas");
  setFiltroTipo("Todos");
};

const exportarCSV = () => {
  const cabecalho = [
    "Data",
    "Descrição",
    "Tipo",
    "Categoria",
    "Valor",
  ];

  const linhas = transacoesFiltradas.map((transacao) => [
  transacao.data ?? "",
  transacao.descricao,
  transacao.tipo,
  transacao.categoria ?? "Outros",
  transacao.valor.toFixed(2).replace(".", ","),
]);

const escaparCSV = (valor: string) => {
  return `"${valor.replace(/"/g, '""')}"`;
};

const conteudoCSV = [cabecalho, ...linhas]
  .map((linha) => linha.map(escaparCSV).join(";"))
  .join("\r\n");

const blob = new Blob(["\uFEFF", conteudoCSV], {
  type: "text/csv;charset=utf-8;",
});

const url = URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = url;
link.download = `transacoes-${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}.csv`;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

URL.revokeObjectURL(url);

toast.success("Exportação iniciada!", {
  description: "Verifique seus downloads para acessar o arquivo CSV.",
});
};

  return (
    <main className="min-h-screen min-w-0 flex-1 bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-100/60 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe suas receitas, despesas e seu saldo em um só lugar.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <Label className="mb-2">Mês</Label>

            <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="01">Janeiro</SelectItem>
                <SelectItem value="02">Fevereiro</SelectItem>
                <SelectItem value="03">Março</SelectItem>
                <SelectItem value="04">Abril</SelectItem>
                <SelectItem value="05">Maio</SelectItem>
                <SelectItem value="06">Junho</SelectItem>
                <SelectItem value="07">Julho</SelectItem>
                <SelectItem value="08">Agosto</SelectItem>
                <SelectItem value="09">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Ano</Label>

            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                <SelectItem value="2029">2029</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              {idEmEdicao !== null ? (
                <Pencil className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {idEmEdicao !== null ? "Editar Transação" : "Nova Transação"}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>

              <Input
                id="descricao"
                placeholder="Ex.: Conta de luz"
                maxLength={100}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <p className="text-right text-xs text-slate-400">
                {descricao.length}/100 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 1500"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(value) =>
                  setTipo(value as "receita" | "despesa")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>

              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORIAS.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data da Transação</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          
<Button
  className="mt-5 gap-2 rounded-xl bg-blue-600 px-5 py-5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
  onClick={adicionarTransacao}
  
disabled={salvandoTransacao || salvandoEdicao}

>

            {idEmEdicao !== null ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {idEmEdicao !== null ? "Salvar Alterações" : "Adicionar Transação"}
          </Button>
          {idEmEdicao !== null && (
            <Button
              type="button"
              variant="outline"
              className="ml-3 mt-5 rounded-xl border-slate-200 px-5 py-5 font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              onClick={cancelarEdicao}
            >
              Cancelar Edição
            </Button>
          )}
        </section>

        <DashboardSummary
          saldo={saldo}
          receitas={receitas}
          despesas={despesas}
        />

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
                            fill={coresGrafico[index % coresGrafico.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => formatarMoeda(Number(value))}
                      />
                      <Legend
                        formatter={(value) => {
                          const categoria = dadosGrafico.find(
                            (item) => item.name === value,
                          );

                          if (!categoria) return value;

                          return `${value}: ${formatarMoeda(categoria.value)} (${calcularPorcentagem(categoria.value, totalDespesasGrafico)}%)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500">Nenhuma despesa cadastrada.</p>
              )}
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Resumo por Categoria
              </h3>
              {Object.entries(despesasPorCategoria).length === 0 ? (
                <p className="text-slate-500">Nenhuma despesa cadastrada.</p>
              ) : (
                Object.entries(despesasPorCategoria).map(
                  ([nomeCategoria, total]) => (
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
                            {calcularPorcentagem(total, totalDespesasGrafico)}% das despesas
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${(total / (despesas || 1)) * 100}%`,
                            backgroundColor:
                              coresGrafico[
                                dadosGrafico.findIndex(
                                  (item) => item.name === nomeCategoria,
                                ) % coresGrafico.length
                              ] || "#2563eb",
                          }}
                        />
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="text-xl font-semibold">
    Histórico de Transações
  </h2>

  <Button
    type="button"
    variant="outline"
    onClick={exportarCSV}
    disabled={transacoesFiltradas.length === 0}
    className="w-full gap-2 sm:w-auto"
  >
    <Download className="h-4 w-4" />
    Exportar CSV
  </Button>
</div>

            <p className="mt-1 text-sm text-slate-500">
  Acompanhe e gerencie suas receitas e despesas.
</p>

<p className="mt-2 text-sm font-medium text-blue-600">
  {transacoesFiltradas.length}{" "}
  {transacoesFiltradas.length === 1
    ? "transação encontrada"
    : "transações encontradas"}
</p>

<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
<div className="rounded-lg border border-green-200 bg-green-50 p-4">
  <div className="flex items-center gap-2">
  <TrendingUp className="h-5 w-5 text-green-600" />

  <p className="text-sm text-green-700">
    Receitas encontradas
  </p>
</div>

  <p className="mt-2 text-xl font-bold text-green-600">
    {formatarMoeda(totalReceitasFiltradas)}
  </p>
</div>

<div className="rounded-lg border border-red-200 bg-red-50 p-4">
  <div className="flex items-center gap-2">
  <TrendingDown className="h-5 w-5 text-red-600" />

  <p className="text-sm text-red-700">
    Despesas encontradas
  </p>
</div>

  <p className="mt-2 text-xl font-bold text-red-600">
    {formatarMoeda(totalDespesasFiltradas)}
  </p>
</div>

<div
  className={`rounded-lg border p-4 ${
    saldoFiltrado >= 0
      ? "border-blue-200 bg-blue-50"
      : "border-red-200 bg-red-50"
  }`}
>
  <div className="flex items-center gap-2">
  <Wallet
    className={`h-5 w-5 ${
      saldoFiltrado >= 0 ? "text-blue-600" : "text-red-600"
    }`}
  />

  <p
    className={`text-sm ${
      saldoFiltrado >= 0 ? "text-blue-700" : "text-red-700"
    }`}
  >
    Saldo encontrado
  </p>
</div>

  <p
    className={`mt-2 text-xl font-bold ${
      saldoFiltrado >= 0 ? "text-blue-600" : "text-red-600"
    }`}
  >
    {formatarMoeda(saldoFiltrado)}
  </p>
</div>
</div>

          </div>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

  <Input
    type="text"
    placeholder="Buscar transação pela descrição..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    className="pl-10 pr-10"
  />

  {busca && (
    <button
      type="button"
      onClick={() => setBusca("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
      aria-label="Limpar pesquisa"
      title="Limpar pesquisa"
    >
      <X className="h-4 w-4" />
    </button>
  )}
</div>
          <div className="w-full md:w-56">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>

              <SelectContent>
  <SelectItem value="Todas">
    Todas as categorias
  </SelectItem>

  {CATEGORIAS.map((categoria) => (
    <SelectItem key={categoria} value={categoria}>
      {categoria}
    </SelectItem>
  ))}
</SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-44">
  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrar por tipo" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="Todos">Todos os tipos</SelectItem>
      <SelectItem value="receita">Receitas</SelectItem>
      <SelectItem value="despesa">Despesas</SelectItem>
    </SelectContent>
  </Select>
</div>
{(busca.trim() !== "" ||
  filtroCategoria !== "Todas" ||
  filtroTipo !== "Todos") && (
  <Button
    type="button"
    variant="outline"
    onClick={limparFiltros}
    className="w-full md:w-auto"
  >
    <X className="mr-2 h-4 w-4" />
    Limpar Filtros
  </Button>
)}
         </div>

          <div className="overflow-hidden rounded-xl border bg-white">
            {transacoesFiltradas.length === 0 && (
  <div className="flex flex-col items-center justify-center p-10 text-center">
    <Wallet className="mb-3 h-10 w-10 text-slate-300" />

    <h3 className="text-lg font-semibold text-slate-700">
      Nenhuma transação encontrada
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Não existem transações para os filtros selecionados.
    </p>
  </div>
)}

            {transacoesFiltradas.map((transacao) => (
              <div
                key={transacao.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 transition-colors duration-200 hover:bg-slate-50 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{transacao.descricao}</p>
                  {transacao.data && (
                    <p className="mt-1 text-xs text-slate-500">
                      {formatarData(transacao.data)}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        transacao.tipo === "receita"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {transacao.tipo === "receita" ? "Receita" : "Despesa"}
                    </span>

                    <span className="text-xs text-slate-500">
                      {transacao.categoria ?? "Outros"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p
                    className={
                      transacao.tipo === "receita"
                        ? "font-bold text-green-600"
                        : "font-bold text-red-600"
                    }
                  >
                    {transacao.tipo === "receita" ? "+" : "-"}
                    {formatarMoeda(transacao.valor)}
                  </p>

                  <button
                    type="button"
                    onClick={() => editarTransacao(transacao.id)}
                    className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                    title="Editar transação"
                    aria-label={`Editar ${transacao.descricao}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <Button
                    className="rounded-lg bg-transparent text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
                    variant="ghost"
                    size="icon"
                    
onClick={() => {
  setIdParaExcluir(transacao.id);
  setDialogoExclusaoAberto(true);
}}

                    aria-label={`Excluir ${transacao.descricao}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      
<AlertDialog
  open={dialogoExclusaoAberto}
  onOpenChange={(aberto) => {
    if (!excluindoTransacao) {
      setDialogoExclusaoAberto(aberto);

      if (!aberto) {
        setIdParaExcluir(null);
      }
    }
  }}
>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Excluir transação?
      </AlertDialogTitle>

      <AlertDialogDescription>
  Tem certeza de que deseja excluir a transação{" "}
  <strong className="font-semibold text-slate-900">
    {transacoes.find((transacao) => transacao.id === idParaExcluir)?.descricao ??
      "selecionada"}
  </strong>
  {" "}no valor de{" "}
<strong className="font-semibold text-slate-900">
  {formatarMoeda(
    transacoes.find((transacao) => transacao.id === idParaExcluir)?.valor ?? 0
  )}
</strong>
  ? Essa ação não poderá ser desfeita.
</AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>
        Cancelar
      </AlertDialogCancel>

      
<AlertDialogAction
  className="bg-red-600 text-white hover:bg-red-700"
  disabled={excluindoTransacao}
  onClick={(evento) => {
    evento.preventDefault();

    if (idParaExcluir !== null) {
      void excluirTransacao(idParaExcluir);
    }
  }}
>
  {excluindoTransacao ? "Excluindo..." : "Excluir transação"}
</AlertDialogAction>

    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowLeftRight, PlusCircle, TrendingDown, TrendingUp,
  Search, X, Filter, Pencil, Trash2, CalendarDays, Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { CATEGORIAS } from "@/lib/categories";
import { calcularReceitas, calcularDespesas, calcularSaldo } from "@/lib/calculations";
import type { Transacao } from "@/lib/types/transacao";

import {
  buscarTransacoesNeon,
  converterTransacaoNeon,
} from "@/lib/transacoes-api";


const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
type Edicao = {
  
  id: number | string;
  descricao: string;
  valor: string;
  tipo: "receita" | "despesa";
  categoria: string;
  data: string;
};

function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  const verificada = new Date(Date.UTC(ano, mes - 1, dia));
  return verificada.getUTCFullYear() === ano && verificada.getUTCMonth() === mes - 1 && verificada.getUTCDate() === dia;
}

export default function TransactionsPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroMes, setFiltroMes] = useState("todos");
  const [filtroAno, setFiltroAno] = useState("todos");
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  
const [salvandoEdicao, setSalvandoEdicao] = useState(false);

const [excluindoTransacao, setExcluindoTransacao] = useState(false);


  const [idParaExcluir, setIdParaExcluir] = useState<number | string | null>(null);


  
useEffect(() => {
  async function carregarTransacoes() {
    try {
      const dados = await buscarTransacoesNeon();

      const transacoesConvertidas = dados.map(
        converterTransacaoNeon
      );

      setTransacoes(transacoesConvertidas);
    } catch (erro) {
      console.error("Erro ao carregar transações do Neon:", erro);
      toast.error("Não foi possível carregar as transações do Neon.");
    } finally {
      setCarregando(false);
    }
  }

  carregarTransacoes();
}, []);


  const anosDisponiveis = useMemo(() => {
    const anos = new Set<string>();
    transacoes.forEach((item) => {
      if (item.data && dataValida(item.data)) anos.add(item.data.slice(0, 4));
    });
    return [...anos].sort((a, b) => b.localeCompare(a));
  }, [transacoes]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((item) => {
      const data = item.data ?? "";
      return item.descricao.toLowerCase().includes(busca.trim().toLowerCase()) &&
        (filtroTipo === "todos" || item.tipo === filtroTipo) &&
        (filtroCategoria === "todas" || (item.categoria ?? "Outros") === filtroCategoria) &&
        (filtroMes === "todos" || data.slice(5, 7) === filtroMes) &&
        (filtroAno === "todos" || data.slice(0, 4) === filtroAno);
    
}).sort((a, b) =>
  (b.data ?? "").localeCompare(a.data ?? "") ||
  String(b.id).localeCompare(String(a.id))
);

  }, [transacoes, busca, filtroTipo, filtroCategoria, filtroMes, filtroAno]);

  const filtrosAtivos = busca.trim() !== "" || filtroTipo !== "todos" || filtroCategoria !== "todas" || filtroMes !== "todos" || filtroAno !== "todos";
  const receitas = calcularReceitas(transacoesFiltradas);
  const despesas = calcularDespesas(transacoesFiltradas);
  const saldo = calcularSaldo(receitas, despesas);
  const transacaoParaExcluir = transacoes.find((item) => item.id === idParaExcluir);

  function limparFiltros() {
    setBusca(""); setFiltroTipo("todos"); setFiltroCategoria("todas");
    setFiltroMes("todos"); setFiltroAno("todos");
  }

function iniciarEdicao(item: Transacao) {
    setEdicao({
      id: item.id, descricao: item.descricao, valor: String(item.valor),
      tipo: item.tipo === "receita" ? "receita" : "despesa",
      categoria: item.categoria ?? "Outros", data: item.data ?? "",
    });
  }

  
async function salvarEdicao() {

    
if (!edicao || salvandoEdicao) return;

    const descricao = edicao.descricao.trim();
    const valor = Number(edicao.valor);
    if (!descricao) { toast.error("Informe uma descrição."); return; }
    if (!Number.isFinite(valor) || valor <= 0) { toast.error("Informe um valor maior que zero."); return; }
    if (edicao.data && !dataValida(edicao.data)) { toast.error("Informe uma data válida."); return; }

    
setSalvandoEdicao(true);

try {

    
const resposta = await fetch(
  `/api/transacoes/${encodeURIComponent(String(edicao.id))}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      descricao,
      valor,
      tipo: edicao.tipo,
      categoria: edicao.categoria,
      data: edicao.data,
    }),
  }
);


if (!resposta.ok) {
  const erro = await resposta.json();

  toast.error(
    erro.erro || "Não foi possível atualizar a transação."
  );

  return;
}


    
const transacaoAtualizada = await resposta.json();

const transacaoConvertida = converterTransacaoNeon(
  transacaoAtualizada
);

setTransacoes((anteriores) =>
  anteriores.map((item) =>
    item.id === edicao.id ? transacaoConvertida : item
  )
);

setEdicao(null);
toast.success("Transação atualizada com sucesso!");


} catch (erro) {
  console.error("Erro ao salvar edição:", erro);
  toast.error("Erro de conexão ao atualizar a transação.");
} finally {
  setSalvandoEdicao(false);
}

}
  

async function excluirTransacao() {
  if (idParaExcluir === null || excluindoTransacao) return;

  setExcluindoTransacao(true);

  try {
    const resposta = await fetch(
      `/api/transacoes/${encodeURIComponent(String(idParaExcluir))}`,
      {
        method: "DELETE",
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.json();

      toast.error(
        erro.erro || "Não foi possível excluir a transação."
      );
      return;
    }

    setTransacoes((anteriores) =>
      anteriores.filter((item) => item.id !== idParaExcluir)
    );

    setIdParaExcluir(null);
    toast.success("Transação excluída com sucesso!");
  } catch (erro) {
    console.error("Erro ao excluir transação:", erro);
    toast.error("Erro de conexão ao excluir a transação.");
  } finally {
    setExcluindoTransacao(false);
  }
}


  function exportarCSV() {
    const linhas = [
      ["Data", "Descrição", "Tipo", "Categoria", "Valor"],
      ...transacoesFiltradas.map((item) => [
        item.data ?? "", item.descricao, item.tipo, item.categoria ?? "Outros",
        item.valor.toFixed(2).replace(".", ","),
      ]),
    ];
    const csv = linhas.map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "transacoes-filtradas.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Exportação CSV iniciada!");
  }

  return (
    <main className="min-h-screen min-w-0 flex-1 bg-background text-foreground p-4 md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Transações</h1>
            <p className="mt-2 text-sm text-muted-foreground">Consulte, filtre e gerencie suas receitas e despesas.</p>
          </div>
          <Button asChild className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/"><PlusCircle className="h-4 w-4" /> Nova Transação</Link>
          </Button>
        </div>

        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Filter className="h-4 w-4 text-sky-400" />
            <h2 className="font-semibold text-foreground">Filtrar transações</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Buscar pela descrição" placeholder="Buscar descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos os tipos</SelectItem><SelectItem value="receita">Receitas</SelectItem><SelectItem value="despesa">Despesas</SelectItem></SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent><SelectItem value="todas">Todas as categorias</SelectItem>{CATEGORIAS.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger className="w-full"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Mês" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos os meses</SelectItem>{MESES.map((mes, i) => <SelectItem key={mes} value={String(i + 1).padStart(2, "0")}>{mes}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filtroAno} onValueChange={setFiltroAno}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Ano" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos os anos</SelectItem>{anosDisponiveis.map((ano) => <SelectItem key={ano} value={ano}>{ano}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {filtrosAtivos && <Button type="button" variant="outline" onClick={limparFiltros} className="mt-4 gap-2"><X className="h-4 w-4" /> Limpar filtros</Button>}
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400"><TrendingUp className="h-5 w-5" /> Total de Receitas</div>
            <p className="text-2xl font-bold text-emerald-400">{formatarMoeda(receitas)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Receitas dos resultados filtrados</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400"><TrendingDown className="h-5 w-5" /> Total de Despesas</div>
            <p className="text-2xl font-bold text-red-400">{formatarMoeda(despesas)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Despesas dos resultados filtrados</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-300"><ArrowLeftRight className="h-5 w-5" /> Saldo</div>
            <p className={`text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatarMoeda(saldo)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Saldo dos resultados filtrados</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Histórico de Transações</h2>
              <p className="mt-1 text-sm text-muted-foreground">{transacoesFiltradas.length} de {transacoes.length} transações encontradas</p>
            </div>
            <Button type="button" variant="outline" disabled={transacoesFiltradas.length === 0} onClick={exportarCSV} className="gap-2"><Download className="h-4 w-4" /> Exportar CSV</Button>
          </div>
          {carregando ? <p className="p-10 text-center text-muted-foreground">Carregando transações...</p> : transacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center"><ArrowLeftRight className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-semibold text-foreground">Nenhuma transação encontrada</p><p className="mt-2 text-sm text-muted-foreground">{filtrosAtivos ? "Experimente alterar os filtros." : "Cadastre uma transação no Dashboard."}</p></div>
          ) : transacoesFiltradas.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-accent/60 last:border-b-0 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`rounded-xl p-3 ${item.tipo === "receita" ? "bg-emerald-500/100/10 text-emerald-400" : "bg-red-500/100/10 text-red-400"}`}>
                  {item.tipo === "receita" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </span>
                <div className="min-w-0"><p className="break-words font-semibold text-foreground">{item.descricao}</p><p className="mt-1 text-xs text-muted-foreground">{item.categoria ?? "Outros"} · {item.data ? formatarData(item.data) : "Sem data"}</p></div>
              </div>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <p className={`mr-1 whitespace-nowrap font-bold ${item.tipo === "receita" ? "text-emerald-600" : "text-red-600"}`}>{item.tipo === "receita" ? "+" : "-"}{formatarMoeda(item.valor)}</p>
                <Button type="button" size="icon" variant="ghost" onClick={() => iniciarEdicao(item)} aria-label={`Editar ${item.descricao}`} title="Editar transação" className="text-blue-600 hover:bg-accent hover:text-sky-300"><Pencil className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => setIdParaExcluir(item.id)} aria-label={`Excluir ${item.descricao}`} title="Excluir transação" className="text-red-600 hover:bg-red-500/100/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <AlertDialog open={edicao !== null} onOpenChange={(aberto) => { if (!aberto) setEdicao(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Editar transação</AlertDialogTitle><AlertDialogDescription>Atualize os dados e salve suas alterações.</AlertDialogDescription></AlertDialogHeader>
          {edicao && <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label htmlFor="editar-descricao">Descrição</Label><Input id="editar-descricao" maxLength={100} value={edicao.descricao} onChange={(e) => setEdicao({ ...edicao, descricao: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="editar-valor">Valor (R$)</Label><Input id="editar-valor" type="number" min="0.01" step="0.01" value={edicao.valor} onChange={(e) => setEdicao({ ...edicao, valor: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tipo</Label><Select value={edicao.tipo} onValueChange={(tipo) => setEdicao({ ...edicao, tipo: tipo as Edicao["tipo"] })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Categoria</Label><Select value={edicao.categoria} onValueChange={(categoria) => setEdicao({ ...edicao, categoria })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIAS.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="editar-data">Data (opcional)</Label><Input id="editar-data" type="date" value={edicao.data} onChange={(e) => setEdicao({ ...edicao, data: e.target.value })} /></div>
          </div>}
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel>
<Button
  type="button"
  onClick={salvarEdicao}
  disabled={salvandoEdicao}
  className="bg-primary text-primary-foreground hover:bg-primary/90"
>
  {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
</Button>
</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={idParaExcluir !== null} onOpenChange={(aberto) => { if (!aberto) setIdParaExcluir(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir transação?</AlertDialogTitle><AlertDialogDescription>Você está prestes a excluir <strong>{transacaoParaExcluir?.descricao ?? "esta transação"}</strong>. Esta ação não poderá ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel>
<AlertDialogAction
  onClick={(evento) => {
    evento.preventDefault();
    void excluirTransacao();
  }}
  disabled={excluindoTransacao}
  className="bg-red-600 text-white hover:bg-red-700"
>
  {excluindoTransacao ? "Excluindo..." : "Excluir transação"}
</AlertDialogAction>
</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

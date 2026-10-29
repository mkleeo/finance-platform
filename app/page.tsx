"use client";

import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria?: string;
  data?: string;
};
export default function Home() {
  
  
const [transacoes, setTransacoes] = useState<Transacao[]>([
  { id: 1, descricao: "Salário", valor: 5000, tipo: "receita" },
  { id: 2, descricao: "Freelancer", valor: 7000, tipo: "receita" },
  { id: 3, descricao: "Aluguel", valor: 2000, tipo: "despesa" },
  { id: 4, descricao: "Supermercado", valor: 1500, tipo: "despesa" },
]);

const [carregando, setCarregando] = useState(true);

useEffect(() => {
  const dadosSalvos = localStorage.getItem("transacoes");

  if (dadosSalvos) {
    try {
      const dados = JSON.parse(dadosSalvos);

      if (Array.isArray(dados)) {
        setTransacoes(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar transações:", erro);
    }
  }

  setCarregando(false);
}, []);

useEffect(() => {
  if (!carregando) {
    localStorage.setItem(
      "transacoes",
      JSON.stringify(transacoes)
    );
  }
}, [transacoes, carregando]);

const [descricao, setDescricao] = useState("");
const [valor, setValor] = useState("");
const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);
const [categoria, setCategoria] = useState("Outros");
const [data, setData] = useState("");
const [filtroCategoria, setFiltroCategoria] = useState("Todas");
const [mesSelecionado, setMesSelecionado] = useState(
  String(new Date().getMonth() + 1).padStart(2, "0")
);

const [anoSelecionado, setAnoSelecionado] = useState(
  String(new Date().getFullYear())
);

const transacoesDoPeriodo = transacoes.filter((transacao) => {
  if (!transacao.data) return false;

  const [ano, mes] = transacao.data.split("-");

  return ano === anoSelecionado && mes === mesSelecionado;
});

const receitas = transacoesDoPeriodo
  .filter((transacao) => transacao.tipo === "receita")
  .reduce((total, transacao) => total + transacao.valor, 0);

const despesas = transacoesDoPeriodo
  .filter((transacao) => transacao.tipo === "despesa")
  .reduce((total, transacao) => total + transacao.valor, 0);

  const saldo = receitas - despesas;
 
const transacoesFiltradas = transacoesDoPeriodo.filter((transacao) => {
  if (filtroCategoria === "Todas") {
    return true;
  }

  return (transacao.categoria ?? "Outros") === filtroCategoria;
});



const despesasPorCategoria = transacoesDoPeriodo
  .filter((transacao) => transacao.tipo === "despesa")
  .reduce<Record<string, number>>((acumulador, transacao) => {
    const categoriaAtual = transacao.categoria ?? "Outros";

    acumulador[categoriaAtual] =
      (acumulador[categoriaAtual] ?? 0) + transacao.valor;

    return acumulador;
  }, {});

  
const coresGrafico = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea",
  "#ef4444",
  "#06b6d4",
];

const dadosGrafico = Object.entries(despesasPorCategoria).map(
  ([nome, valor]) => ({
    name: nome,
    value: valor,
  })
);

const totalDespesasGrafico = dadosGrafico.reduce(
  (total, item) => total + item.value,
  0
);

const calcularPorcentagem = (valor: number) => {
  if (totalDespesasGrafico === 0) return "0,0";

  return ((valor / totalDespesasGrafico) * 100).toFixed(1).replace(".", ",");
};
  const formatarMoeda = (valor: number) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const adicionarTransacao = () => {
  const descricaoLimpa = descricao.trim();
  const valorNumerico = Number(valor);

  if (
    !descricaoLimpa ||
    !Number.isFinite(valorNumerico) ||
    valorNumerico <= 0
  ) {
    alert("Preencha a descrição e um valor maior que zero.");
    return;
  }

  if (idEmEdicao !== null) {
  setTransacoes((anteriores) =>
    anteriores.map((transacao) =>
      transacao.id === idEmEdicao
        ? {
            ...transacao,
            descricao: descricaoLimpa,
            valor: valorNumerico,
            tipo,
            categoria,
            data: data || transacao.data || new Date().toLocaleDateString("en-CA"),
          }
        : transacao
    )
  );

  setIdEmEdicao(null);
} else {
  const novaTransacao = {
    id: Date.now(),
    descricao: descricaoLimpa,
    valor: valorNumerico,
    tipo,
    categoria,
    data: data || new Date().toLocaleDateString("en-CA"),
  };

  setTransacoes((anteriores) => [
    ...anteriores,
    novaTransacao,
  ]);
}

  setDescricao("");
setValor("");
setTipo("despesa");
setCategoria("Outros");
setData("");
};

const excluirTransacao = (id: number) => {
  const confirmar = window.confirm(
    "Tem certeza que deseja excluir esta transação?"
  );

  if (!confirmar) {
    return;
  }

  setTransacoes((anteriores) =>
    anteriores.filter((transacao) => transacao.id !== id)
  );
};
const editarTransacao = (id: number) => {
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
  setData("");
};

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">
        Meu Painel Financeiro
      </h1>
      
<div className="mb-6 flex flex-wrap items-center gap-4">

  <div>
    <Label className="mb-2">Mês</Label>

    <Select
      value={mesSelecionado}
      onValueChange={setMesSelecionado}
    >
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

    <Select
      value={anoSelecionado}
      onValueChange={setAnoSelecionado}
    >
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

<section className="mb-8 rounded-xl border bg-white p-6">
  <h2 className="mb-4 text-xl font-bold">
    Nova Transação
  </h2>

  <div className="grid gap-4 md:grid-cols-3">
    <div className="space-y-2">
      <Label htmlFor="descricao">Descrição</Label>
      <Input
        id="descricao"
        placeholder="Ex.: Conta de luz"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
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
      <SelectItem value="Alimentação">Alimentação</SelectItem>
      <SelectItem value="Moradia">Moradia</SelectItem>
      <SelectItem value="Transporte">Transporte</SelectItem>
      <SelectItem value="Saúde">Saúde</SelectItem>
      <SelectItem value="Lazer">Lazer</SelectItem>
      <SelectItem value="Salário">Salário</SelectItem>
      <SelectItem value="Freelancer">Freelancer</SelectItem>
      <SelectItem value="Outros">Outros</SelectItem>
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
  className="mt-4"
  onClick={adicionarTransacao}
>
  {idEmEdicao !== null ? "Salvar Alterações" : "Adicionar Transação"}
</Button>
{idEmEdicao !== null && (
  <Button
    type="button"
    variant="outline"
    onClick={cancelarEdicao}
  >
    Cancelar Edição
  </Button>
)}
</section>


      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatarMoeda(saldo)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(receitas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(despesas)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <section className="mt-8">
  <h2 className="mb-4 text-2xl font-bold">
    Despesas por Categoria
  </h2>


<div className="mb-6 rounded-xl border bg-white p-6">
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

          <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
          <Legend
  formatter={(value) => {
    const categoria = dadosGrafico.find(
      (item) => item.name === value
    );

    if (!categoria) return value;

    return `${value}: ${formatarMoeda(categoria.value)} (${calcularPorcentagem(categoria.value)}%)`;
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
    {Object.entries(despesasPorCategoria).length === 0 ? (
      <p className="text-slate-500">
        Nenhuma despesa cadastrada.
      </p>
    ) : (
      Object.entries(despesasPorCategoria).map(
        ([nomeCategoria, total]) => (
          <div
            key={nomeCategoria}
            className="flex items-center justify-between border-b py-3 last:border-b-0"
          >
            <span>{nomeCategoria}</span>

            <span className="font-bold text-red-600">
              {formatarMoeda(total)}
            </span>
          </div>
        )
      )
    )}
  </div>
</section>

<section className="mt-8">
  <h2 className="mb-4 text-2xl font-bold">
    Histórico de Transações
  </h2>
  <div className="mb-4 max-w-xs">
  <Select
    value={filtroCategoria}
    onValueChange={setFiltroCategoria}
  >
    <SelectTrigger>
      <SelectValue placeholder="Filtrar por categoria" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="Todas">Todas as categorias</SelectItem>
      <SelectItem value="Alimentação">Alimentação</SelectItem>
      <SelectItem value="Moradia">Moradia</SelectItem>
      <SelectItem value="Transporte">Transporte</SelectItem>
      <SelectItem value="Saúde">Saúde</SelectItem>
      <SelectItem value="Lazer">Lazer</SelectItem>
      <SelectItem value="Salário">Salário</SelectItem>
      <SelectItem value="Freelancer">Freelancer</SelectItem>
      <SelectItem value="Outros">Outros</SelectItem>
    </SelectContent>
  </Select>
</div>

  <div className="overflow-hidden rounded-xl border bg-white">
    {transacoesFiltradas.map((transacao) => (
      <div
        key={transacao.id}
        className="flex items-center justify-between border-b p-4 last:border-b-0"
      >
        <div>
          <p className="font-medium">
            {transacao.descricao}
          </p>

          <p className="text-sm text-slate-500">
  {transacao.tipo === "receita"
    ? "Receita"
    : "Despesa"}

  {" • "}

  {transacao.categoria ?? "Outros"}
</p>
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
  className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
  title="Editar transação"
>
  Editar
</button>

  <Button
    variant="ghost"
    size="icon"
    onClick={() => excluirTransacao(transacao.id)}
    aria-label={`Excluir ${transacao.descricao}`}
  >
    <Trash2 className="h-4 w-4 text-red-600" />
  </Button>
</div>

      </div>
    ))}
  </div>
</section>

    </main>
  );
}

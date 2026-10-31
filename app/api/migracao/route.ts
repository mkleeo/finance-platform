
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verificarAmbienteDesenvolvimento(): boolean {
  return process.env.NODE_ENV === "development";
}


export async function GET() {
  if (!verificarAmbienteDesenvolvimento()) {
    return NextResponse.json(
      { erro: "Rota disponível apenas em desenvolvimento." },
      { status: 403 }
    );
  }

  try {

    const transacoes = await prisma.transacao.findMany({
      where: {
        id: {
          startsWith: "local-",
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      idsMigrados: transacoes.map((transacao) => transacao.id),
    });
  } catch (erro) {
    console.error("Erro ao verificar migração:", erro);

    return NextResponse.json(
      { erro: "Não foi possível verificar as transações migradas." },
      { status: 500 }
    );
  }
}


async function salvarTransacaoMigrada(dados: {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  data?: string;
}) {
  return prisma.transacao.upsert({
    where: {
      id: dados.id,
    },
    update: {},
    create: {
      id: dados.id,
      descricao: dados.descricao,
      valor: dados.valor,
      tipo: dados.tipo,
      categoria: dados.categoria,
      ...(dados.data
        ? { data: new Date(`${dados.data}T12:00:00.000Z`) }
        : {}),
    },
  });
}


function validarTransacaoMigracao(dados: {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  data?: string;
}): boolean {
  return (
    typeof dados.id === "string" &&
    /^local-\d+$/.test(dados.id) &&
    typeof dados.descricao === "string" &&
    dados.descricao.trim().length > 0 &&
    typeof dados.valor === "number" &&
    Number.isFinite(dados.valor) &&
    dados.valor > 0 &&
    (dados.tipo === "receita" || dados.tipo === "despesa") &&
    typeof dados.categoria === "string" &&
    (!dados.data ||
      (/^\d{4}-\d{2}-\d{2}$/.test(dados.data) &&
        !Number.isNaN(new Date(`${dados.data}T12:00:00.000Z`).getTime())))
  );
}


function transacaoPermitidaNaMigracao(id: string): boolean {
  const idsPermitidos = ["local-1", "local-2", "local-3", "local-4"];

  return idsPermitidos.includes(id);
}


export async function POST(request: Request) {
  if (!verificarAmbienteDesenvolvimento()) {
    return NextResponse.json(
      { erro: "Migração disponível apenas em desenvolvimento." },
      { status: 403 }
    );
  }

  try {
    const dados: unknown = await request.json();

    if (
      typeof dados !== "object" ||
      dados === null ||
      Array.isArray(dados)
    ) {
      return NextResponse.json(
        { erro: "Formato de dados inválido." },
        { status: 400 }
      );
    }

    const transacao = dados as Parameters<
      typeof validarTransacaoMigracao
    >[0];

    if (
      !validarTransacaoMigracao(transacao) ||
      !transacaoPermitidaNaMigracao(transacao.id)
    ) {
      return NextResponse.json(
        { erro: "Transação inválida ou não permitida." },
        { status: 400 }
      );
    }

    const resultado = await salvarTransacaoMigrada(transacao);

    return NextResponse.json({
      sucesso: true,
      id: resultado.id,
    });
  } catch (erro) {
    console.error("Erro durante a migração:", erro);

    return NextResponse.json(
      { erro: "Não foi possível migrar a transação." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


export async function GET() {
  try {
    
const session = await auth();

if (!session?.user?.id) {
  return NextResponse.json(
    { erro: "Você precisa estar autenticado." },
    { status: 401 }
  );
}

    
const transacoes = await prisma.transacao.findMany({
  where: {
    usuarioId: session.user.id,
  },
  orderBy: {
    data: "desc",
  },
});


    return NextResponse.json(transacoes);
  } catch (erro) {
    console.error("Erro ao buscar transações:", erro);

    return NextResponse.json(
      { erro: "Não foi possível buscar as transações." },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    
const session = await auth();

if (!session?.user?.id) {
  return NextResponse.json(
    { erro: "Você precisa estar autenticado." },
    { status: 401 }
  );
}

    const dados = await request.json();

    const { descricao, valor, tipo, categoria, data } = dados;

    if (
      typeof descricao !== "string" ||
      !descricao.trim() ||
      typeof valor !== "number" ||
      !Number.isFinite(valor) ||
      valor <= 0 ||
      !["receita", "despesa"].includes(tipo)
    ) {
      return NextResponse.json(
        { erro: "Dados da transação inválidos." },
        { status: 400 }
      );
    }

    
if (
  data !== undefined &&
  (
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    Number.isNaN(new Date(`${data}T12:00:00.000Z`).getTime()) ||
    new Date(`${data}T12:00:00.000Z`).toISOString().slice(0, 10) !== data
  )
) {
  return NextResponse.json(
    { erro: "Data inválida." },
    { status: 400 }
  );
}

const dataTransacao = data
  ? new Date(`${data}T12:00:00.000Z`)
  : new Date();


    const novaTransacao = await prisma.transacao.create({
      data: {
        usuarioId: session.user.id,
        descricao: descricao.trim(),
        valor,
        tipo,
        categoria:
          typeof categoria === "string" && categoria.trim()
            ? categoria.trim()
            : "Outros",
        data: dataTransacao,
      },
    });

    return NextResponse.json(novaTransacao, { status: 201 });
  } catch (erro) {
    console.error("Erro ao cadastrar transação:", erro);

    return NextResponse.json(
      { erro: "Não foi possível cadastrar a transação." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
if (!id || id.trim() === "") {
  return NextResponse.json(
    { erro: "ID da transação não informado." },
    { status: 400 }
  );
}


let dados: unknown;

try {
  dados = await request.json();
} catch {
  return NextResponse.json(
    { erro: "Os dados enviados não são um JSON válido." },
    { status: 400 }
  );
}


if (
  typeof dados !== "object" ||
  dados === null ||
  Array.isArray(dados)
) {
  return NextResponse.json(
    { erro: "Os dados da transação são inválidos." },
    { status: 400 }
  );
}


const { descricao } = dados as Record<string, unknown>;

if (
  typeof descricao !== "string" ||
  descricao.trim() === ""
) {
  return NextResponse.json(
    { erro: "Informe uma descrição válida." },
    { status: 400 }
  );
}


const { valor } = dados as Record<string, unknown>;

if (
  typeof valor !== "number" ||
  !Number.isFinite(valor) ||
  valor <= 0
) {
  return NextResponse.json(
    { erro: "Informe um valor numérico maior que zero." },
    { status: 400 }
  );
}


const { tipo } = dados as Record<string, unknown>;

if (tipo !== "receita" && tipo !== "despesa") {
  return NextResponse.json(
    { erro: "O tipo deve ser receita ou despesa." },
    { status: 400 }
  );
}


const { categoria } = dados as Record<string, unknown>;

if (
  categoria !== undefined &&
  (typeof categoria !== "string" || categoria.trim() === "")
) {
  return NextResponse.json(
    { erro: "Informe uma categoria válida." },
    { status: 400 }
  );
}

const { data } = dados as Record<string, unknown>;

if (data !== undefined && data !== "") {
  if (typeof data !== "string") {
    return NextResponse.json(
      { erro: "A data deve ser um texto válido." },
      { status: 400 }
    );
  }

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);

  if (!partes) {
    return NextResponse.json(
      { erro: "Use o formato de data AAAA-MM-DD." },
      { status: 400 }
    );
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const verificada = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    verificada.getUTCFullYear() !== ano ||
    verificada.getUTCMonth() !== mes - 1 ||
    verificada.getUTCDate() !== dia
  ) {
    return NextResponse.json(
      { erro: "A data informada não existe." },
      { status: 400 }
    );
  }
}


const transacaoExistente = await prisma.transacao.findUnique({
  where: {
    id,
  },
});

if (!transacaoExistente) {
  return NextResponse.json(
    { erro: "Transação não encontrada." },
    { status: 404 }
  );
}


const dadosAtualizados = {
  descricao: descricao.trim(),
  valor,
  tipo,
  categoria:
    typeof categoria === "string"
      ? categoria.trim()
      : transacaoExistente.categoria,
  ...(typeof data === "string" && data !== ""
    ? { data: new Date(`${data}T12:00:00.000Z`) }
    : {}),
};


  
try {
  const transacaoAtualizada = await prisma.transacao.update({
    where: {
      id,
    },
    data: dadosAtualizados,
  });

  return NextResponse.json(transacaoAtualizada);
} catch (erro) {
  console.error("Erro ao atualizar transação:", erro);

  return NextResponse.json(
    { erro: "Não foi possível atualizar a transação." },
    { status: 500 }
  );
}

}


export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id.trim() === "") {
      return NextResponse.json(
        { erro: "ID da transação não informado." },
        { status: 400 }
      );
    }

    const transacao = await prisma.transacao.findUnique({
      where: { id },
    });

    if (!transacao) {
      return NextResponse.json(
        { erro: "Transação não encontrada." },
        { status: 404 }
      );
    }

    await prisma.transacao.delete({
      where: { id },
    });

    return NextResponse.json({
      mensagem: "Transação excluída com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao excluir transação:", erro);

    return NextResponse.json(
      { erro: "Não foi possível excluir a transação." },
      { status: 500 }
    );
  }
}

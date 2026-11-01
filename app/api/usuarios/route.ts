import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    const { nome, email, senha } = dados ?? {};

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string"
    ) {
      return NextResponse.json(
        { erro: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
      return NextResponse.json(
        { erro: "O nome deve ter entre 2 e 100 caracteres." },
        { status: 400 }
      );
    }

    if (
      emailLimpo.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)
    ) {
      return NextResponse.json(
        { erro: "Informe um e-mail válido." },
        { status: 400 }
      );
    }

    if (senha.length < 12 || senha.length > 72) {
      return NextResponse.json(
        { erro: "A senha deve ter entre 12 e 72 caracteres." },
        { status: 400 }
      );
    }

    
const usuarioExistente = await prisma.usuario.findUnique({
  where: {
    email: emailLimpo,
  },
});

if (usuarioExistente) {
  return NextResponse.json(
    { erro: "Não foi possível cadastrar este e-mail." },
    { status: 409 }
  );
}


const senhaHash = await bcrypt.hash(senha, 12);

const novoUsuario = await prisma.usuario.create({
  data: {
    nome: nomeLimpo,
    email: emailLimpo,
    senhaHash,
  },
});

    
return NextResponse.json(
  {
    mensagem: "Usuário cadastrado com sucesso!",
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    },
  },
  { status: 201 }
);

  
} catch (erro) {
  
if (
  typeof erro === "object" &&
  erro !== null &&
  "code" in erro &&
  erro.code === "P2002"
) {
  return NextResponse.json(
    { erro: "Não foi possível cadastrar este e-mail." },
    { status: 409 }
  );
}

  console.error("Erro ao cadastrar usuário:", erro);

  return NextResponse.json(
    { erro: "Não foi possível cadastrar o usuário." },
    { status: 500 }
  );
}

}


import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (typeof token.id === "string") {
        session.user.id = token.id;
      }

      return session;
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "E-mail",
          type: "email",
        },
        password: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const senha = credentials?.password;

        if (
          typeof email !== "string" ||
          typeof senha !== "string"
        ) {
          return null;
        }

        const emailLimpo = email.trim().toLowerCase();

        const usuario = await prisma.usuario.findUnique({
          where: {
            email: emailLimpo,
          },
        });

        if (!usuario) {
          return null;
        }

        const senhaCorreta = await bcrypt.compare(
          senha,
          usuario.senhaHash
        );

        if (!senhaCorreta) {
          return null;
        }

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
        };
      },
    }),
  ],
});

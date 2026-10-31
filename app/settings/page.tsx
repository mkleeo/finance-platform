"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Download,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Preferencias = {
  nome: string;
  moeda: string;
};

const CHAVE_PREFERENCIAS = "finance-preferences";
const CHAVE_TRANSACOES = "transacoes";
const CHAVE_ORCAMENTOS = "finance-monthly-budgets";

const preferenciasIniciais: Preferencias = {
  nome: "",
  moeda: "BRL",
};

export default function SettingsPage() {
  const [preferencias, setPreferencias] =
    useState<Preferencias>(preferenciasIniciais);
  const [carregado, setCarregado] = useState(false);
  const [quantidadeTransacoes, setQuantidadeTransacoes] = useState(0);
  const [quantidadeOrcamentos, setQuantidadeOrcamentos] = useState(0);

  useEffect(() => {
    try {
      const salvas = localStorage.getItem(CHAVE_PREFERENCIAS);
      if (salvas) {
        const dados: unknown = JSON.parse(salvas);
        if (dados && typeof dados === "object" && !Array.isArray(dados)) {
          const objeto = dados as Record<string, unknown>;
          setPreferencias({
            nome: typeof objeto.nome === "string" ? objeto.nome : "",
            moeda: "BRL",
          });
        }
      }

      const transacoesSalvas = localStorage.getItem(CHAVE_TRANSACOES);
      if (transacoesSalvas) {
        const dados: unknown = JSON.parse(transacoesSalvas);
        if (Array.isArray(dados)) setQuantidadeTransacoes(dados.length);
      }

      const orcamentosSalvos = localStorage.getItem(CHAVE_ORCAMENTOS);
      if (orcamentosSalvos) {
        const dados: unknown = JSON.parse(orcamentosSalvos);
        if (dados && typeof dados === "object" && !Array.isArray(dados)) {
          const limites = Object.values(dados).filter(
            (valor) => typeof valor === "number" && Number.isFinite(valor) && valor > 0
          );
          setQuantidadeOrcamentos(limites.length);
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar configurações:", erro);
      toast.error("Não foi possível carregar todas as configurações.");
    } finally {
      setCarregado(true);
    }
  }, []);

  function salvarPreferencias() {
    const atualizadas: Preferencias = {
      nome: preferencias.nome.trim(),
      moeda: "BRL",
    };

    try {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(atualizadas));
      setPreferencias(atualizadas);
      toast.success("Preferências salvas com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar preferências:", erro);
      toast.error("Não foi possível salvar as preferências.");
    }
  }

  function exportarBackup() {
    try {
      const lerJSON = (chave: string): unknown => {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : null;
      };

      const backup = {
        formato: "finance-platform-backup",
        versao: 1,
        exportadoEm: new Date().toISOString(),
        transacoes: lerJSON(CHAVE_TRANSACOES) ?? [],
        orcamentos: lerJSON(CHAVE_ORCAMENTOS) ?? {},
        preferencias: lerJSON(CHAVE_PREFERENCIAS) ?? preferencias,
      };

      const conteudo = JSON.stringify(backup, null, 2);
      const url = URL.createObjectURL(
        new Blob([conteudo], { type: "application/json;charset=utf-8" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "finance-platform-backup.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Backup exportado com sucesso!");
    } catch (erro) {
      console.error("Erro ao exportar backup:", erro);
      toast.error("Não foi possível exportar o backup.");
    }
  }

  return (
    <main className="min-h-screen min-w-0 flex-1 bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-100/60 p-4 md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Preferências da plataforma</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Personalize sua experiência e gerencie seus dados financeiros.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-3">
                <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Perfil</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Informações de exibição da plataforma.
                  </p>
                </div>
              </div>

              <label htmlFor="nome" className="mb-2 block text-sm font-medium text-slate-700">
                Nome de exibição
              </label>
              <Input
                id="nome"
                placeholder="Digite seu nome"
                value={preferencias.nome}
                onChange={(evento) =>
                  setPreferencias((atual) => ({ ...atual, nome: evento.target.value }))
                }
                disabled={!carregado}
                maxLength={80}
                className="max-w-xl"
              />
              <p className="mt-2 text-xs text-slate-500">
                Essa preferência fica salva neste navegador.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-3">
                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Preferências financeiras
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Configurações monetárias do sistema.
                  </p>
                </div>
              </div>
              <label htmlFor="moeda" className="mb-2 block text-sm font-medium text-slate-700">
                Moeda
              </label>
              <Input id="moeda" value="Real brasileiro (BRL)" disabled className="max-w-xl" />
              <p className="mt-2 text-xs text-slate-500">
                Nesta versão, a plataforma utiliza apenas o real brasileiro.
              </p>
            </section>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={salvarPreferencias}
                disabled={!carregado}
                className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" /> Salvar configurações
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Seus dados</h2>
                  <p className="text-xs text-slate-500">Armazenamento local</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-600">Transações</span>
                  <span className="font-semibold text-slate-900">{quantidadeTransacoes}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-600">Limites configurados</span>
                  <span className="font-semibold text-slate-900">{quantidadeOrcamentos}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={exportarBackup}
                disabled={!carregado}
                className="mt-5 w-full gap-2 rounded-xl"
              >
                <Download className="h-4 w-4" /> Exportar backup JSON
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                O backup inclui transações, orçamentos e preferências. Guarde o arquivo em local seguro.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Armazenamento</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Os dados são armazenados no navegador deste dispositivo, sem sincronização com uma conta.
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Exportação disponível
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

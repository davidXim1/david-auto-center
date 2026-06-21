import Image from "next/image";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { companySettings } from "@/lib/config";
import { Button, Card, FieldLabel, Input, LinkButton, Pill } from "@/components/ui";

interface LoginPageProps {
  searchParams: Promise<{
    erro?: string;
    config?: string;
    saida?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirect = params.redirect?.startsWith("/") ? params.redirect : "/admin";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center">
            <Image src={companySettings.logoUrl} alt="Logo David Auto Center" width={82} height={82} className="rounded-lg" priority />
            <Pill tone="red">Acesso protegido</Pill>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Painel administrativo David Auto Center</h1>
            <p className="mt-3 max-w-md text-zinc-300">Entre com login e senha para gerenciar campanhas, premios, clientes, agenda e resgates.</p>
          </div>

          <Card className="bg-white p-5 text-zinc-950 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-red text-white">
                <LockKeyhole size={22} />
              </span>
              <div>
                <h2 className="text-xl font-black">Entrar no administrador</h2>
                <p className="text-sm text-zinc-500">Sessao segura por 8 horas.</p>
              </div>
            </div>

            {params.erro ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-brand-red">
                Login ou senha incorretos.
              </div>
            ) : null}

            {params.config ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-brand-red">
                Configure ADMIN_LOGIN, ADMIN_PASSWORD e AUTH_SECRET antes de usar em producao.
              </div>
            ) : null}

            {params.saida ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                Voce saiu do painel com seguranca.
              </div>
            ) : null}

            <form action="/api/auth/login" method="post" className="grid gap-4">
              <input type="hidden" name="redirect" value={redirect} />
              <div>
                <FieldLabel required>Login</FieldLabel>
                <Input name="login" type="text" autoComplete="username" placeholder="DAVIDAUTOCENTER" required />
              </div>
              <div>
                <FieldLabel required>Senha</FieldLabel>
                <Input name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" required />
              </div>
              <Button type="submit" className="w-full">
                <ShieldCheck size={18} />
                Entrar
              </Button>
            </form>

            <div className="mt-4 border-t border-zinc-100 pt-4">
              <LinkButton href="/" variant="secondary" className="w-full">Voltar para o site</LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

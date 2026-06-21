import Image from "next/image";
import { ArrowDown, CalendarDays, Gift, MapPinned, MessageCircle, ShieldCheck, TicketCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BrandHeader, BusinessStrip, FloatingWhatsapp } from "@/components/brand";
import { RouletteExperience } from "@/components/roulette";
import { Card, LinkButton, Pill } from "@/components/ui";
import { getActiveCampaign, readDb } from "@/lib/local-db";
import { getPublicCampaignUrl } from "@/lib/site-url";
import { formatCurrency, whatsappUrl } from "@/lib/utils";

export async function PublicCampaignPage() {
  const state = await readDb();
  const activeCampaign = getActiveCampaign(state);
  const companySettings = state.companySettings;
  const prizes = state.prizes.filter((prize) => prize.campanhaId === activeCampaign.id && prize.status === "ativo" && prize.estoqueDisponivel > 0);
  const publicCampaignUrl = getPublicCampaignUrl(companySettings);

  return (
    <main className="min-h-screen bg-zinc-100">
      <BrandHeader settings={companySettings} />

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <Image
          src={companySettings.fachadaUrl || activeCampaign.bannerUrl}
          alt="Fachada da David Auto Center"
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.92)_42%,rgba(9,9,11,0.58)_100%)]" />
        <div className="relative mx-auto grid min-h-[560px] max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <Image src={companySettings.logoUrl} alt="Logo David Auto Center Club" width={104} height={104} className="rounded-full border border-white/20 object-cover shadow-2xl" />
              <div>
                <Pill tone="red">Cliente oficial</Pill>
                <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">David Auto Center Club</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-zinc-100">{activeCampaign.texto}</p>
            <div className="mt-6 grid gap-3 text-sm text-zinc-100 sm:grid-cols-3">
              <div className="flex items-center gap-2"><MapPinned size={18} className="text-brand-red" />{companySettings.endereco}</div>
              <div className="flex items-center gap-2"><MessageCircle size={18} className="text-brand-red" />{companySettings.whatsapp}</div>
              <div className="flex items-center gap-2"><CalendarDays size={18} className="text-brand-red" />Campanha ativa</div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton href="#participar">
                Participar agora <ArrowDown size={18} />
              </LinkButton>
              <LinkButton href={activeCampaign.vipGroupUrl || companySettings.vipGroupUrl} variant="secondary" className="text-zinc-950">
                <MessageCircle size={18} /> Grupo VIP
              </LinkButton>
              <LinkButton href={whatsappUrl(companySettings.whatsappDigits, companySettings.defaultWhatsappMessage)} variant="secondary" className="text-zinc-950">
                Falar no WhatsApp
              </LinkButton>
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/95 p-5 text-zinc-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Pill tone="dark">Campanha</Pill>
                <h2 className="mt-3 text-2xl font-black">{activeCampaign.nome}</h2>
                <p className="mt-2 text-sm text-zinc-600">{activeCampaign.descricao}</p>
              </div>
              <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
                <QRCodeSVG value={publicCampaignUrl} size={92} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-zinc-100 p-3">
                <p className="text-xs font-bold text-zinc-500">Premios</p>
                <p className="mt-1 text-2xl font-black">{prizes.length}</p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3">
                <p className="text-xs font-bold text-zinc-500">Giro</p>
                <p className="mt-1 text-2xl font-black">1x</p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3">
                <p className="text-xs font-bold text-zinc-500">Status</p>
                <p className="mt-1 text-sm font-black text-emerald-700">{activeCampaign.ativa ? "Ativa" : "Pausada"}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-brand-red">
              <TicketCheck size={18} />
              Cadastre seus dados, entre no grupo VIP e gire a roleta.
            </div>
          </div>
        </div>
      </section>

      <BusinessStrip settings={companySettings} />

      <section id="participar" className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Pill tone="dark">Participacao do cliente</Pill>
            <h2 className="mt-3 text-3xl font-black">Cadastro, Grupo VIP e roleta</h2>
          </div>
          <Pill tone={activeCampaign.ativa ? "green" : "neutral"}>{activeCampaign.ativa ? "Campanha liberada" : "Campanha pausada"}</Pill>
        </div>
        <RouletteExperience
          vipGroupUrl={activeCampaign.vipGroupUrl || companySettings.vipGroupUrl}
          googleMapsUrl={companySettings.googleMapsUrl}
        />
      </section>

      <section id="premios" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-5 flex items-center gap-2">
            <Gift className="text-brand-red" />
            <h2 className="text-2xl font-black">Premios disponiveis</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {prizes.map((prize) => (
              <Card key={prize.id} className="p-0">
                <Image src={prize.imagemUrl} alt={prize.nome} width={480} height={320} className="aspect-[1.5] rounded-t-lg object-cover" />
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Pill tone={prize.categoria === "Premium" ? "red" : "neutral"}>{prize.categoria}</Pill>
                    <span className="text-xs font-bold text-zinc-500">Restam {prize.estoqueDisponivel}</span>
                  </div>
                  <h3 className="font-black">{prize.nome}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{prize.descricao}</p>
                  <p className="mt-3 text-sm font-bold">{formatCurrency(prize.valorEstimado)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="text-brand-red" />
            <h2 className="text-xl font-black">Regras principais</h2>
          </div>
          <div className="grid gap-2 text-sm text-zinc-600">
            {activeCampaign.regras.map((rule) => <p key={rule}>- {rule}</p>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/termos" variant="secondary">Termos de Uso</LinkButton>
            <LinkButton href="/privacidade" variant="secondary">Politica de Privacidade</LinkButton>
            <LinkButton href="/regulamento" variant="secondary">Regulamento</LinkButton>
            <LinkButton href={companySettings.googleMapsUrl} variant="dark">Como chegar</LinkButton>
          </div>
        </Card>
      </section>

      <FloatingWhatsapp settings={companySettings} />
    </main>
  );
}

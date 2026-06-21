import { QRCodeSVG } from "qrcode.react";
import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/brand";
import { Card, LinkButton, Pill } from "@/components/ui";
import { readDb } from "@/lib/local-db";
import { whatsappUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResgatePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const state = await readDb();
  const companySettings = state.companySettings;
  const item = state.redemptions.find((redemption) => redemption.codigo === codigo);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <BrandHeader />
      <section className="mx-auto max-w-2xl px-4 py-8">
        <Card className="border-brand-red">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Pill tone="red">Comprovante digital</Pill>
            <Pill tone="dark">{item.status}</Pill>
          </div>
          <h1 className="mt-4 text-3xl font-black">{item.premio}</h1>
          <p className="mt-2 text-zinc-600">Codigo: <strong>{item.codigo}</strong></p>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_170px]">
            <div className="rounded-lg bg-zinc-50 p-4 text-sm">
              <p><strong>Cliente:</strong> {item.cliente}</p>
              <p><strong>Telefone:</strong> {item.telefone}</p>
              <p><strong>Placa:</strong> {item.placa}</p>
              <p><strong>Campanha:</strong> {item.campanha}</p>
              <p><strong>Validade:</strong> {item.validade}</p>
              <p><strong>Endereco:</strong> {companySettings.endereco}, {companySettings.cidade}</p>
            </div>
            <div className="flex justify-center rounded-lg border border-zinc-200 bg-white p-4">
              <QRCodeSVG value={`DAC:${item.codigo}:${item.placa}:${item.status}`} size={142} />
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <LinkButton href={whatsappUrl(companySettings.whatsappDigits, `Ola, quero resgatar o premio ${item.codigo}.`)}>WhatsApp</LinkButton>
            <LinkButton href={companySettings.googleMapsUrl} variant="secondary">Como chegar</LinkButton>
            <LinkButton href="/" variant="dark">Voltar ao inicio</LinkButton>
          </div>
        </Card>
      </section>
    </main>
  );
}

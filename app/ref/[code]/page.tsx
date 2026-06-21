import { BrandHeader } from "@/components/brand";
import { Card, LinkButton, Pill } from "@/components/ui";

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <main>
      <BrandHeader />
      <section className="mx-auto max-w-xl px-4 py-10">
        <Card>
          <Pill tone="red">Indicacao registrada</Pill>
          <h1 className="mt-4 text-3xl font-black">Voce foi convidado para o David Auto Center Club</h1>
          <p className="mt-2 text-zinc-600">Codigo do indicador: <strong>{code}</strong>. Ao participar, a indicacao sera vinculada no painel.</p>
          <LinkButton href="/participar" className="mt-5 w-full">Participar da campanha</LinkButton>
        </Card>
      </section>
    </main>
  );
}

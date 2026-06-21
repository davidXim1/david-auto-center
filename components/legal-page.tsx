import { BrandHeader } from "@/components/brand";
import { Card, Pill } from "@/components/ui";
import { getActiveCampaign, readDb } from "@/lib/local-db";

const content = {
  terms: [
    "O participante declara que forneceu dados verdadeiros e autoriza a David Auto Center a registrar sua participacao.",
    "O premio somente tem validade quando gerado pelo sistema, com codigo unico DAC e QR Code de conferencia.",
    "A oficina pode cancelar participacoes em caso de fraude, duplicidade ou inconsistencia de placa e telefone."
  ],
  privacy: [
    "Os dados sao usados para campanhas, agendamentos, resgates, comunicacao via WhatsApp e historico de relacionamento.",
    "O cliente pode solicitar revisao, correcao ou exclusao de dados conforme a LGPD.",
    "O painel administrativo deve registrar logs de acesso, alteracoes e resgates para auditoria."
  ],
  rules: [
    "Uma participacao por telefone ou placa.",
    "Premios dependem de estoque e status ativo.",
    "O comprovante com codigo DAC deve ser apresentado no resgate."
  ]
};

export async function LegalPage({ title, kind }: { title: string; kind: keyof typeof content }) {
  const state = await readDb();
  const companySettings = state.companySettings;
  const activeCampaign = getActiveCampaign(state);
  const legalTexts = state.legalTexts;
  const dynamicContent = {
    terms: legalTexts?.terms ? [legalTexts.terms] : content.terms,
    privacy: legalTexts?.privacy ? [legalTexts.privacy] : content.privacy,
    rules: legalTexts?.rules ? [legalTexts.rules] : activeCampaign.regras
  };

  return (
    <main>
      <BrandHeader />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <Pill tone="red">Documento editavel no painel</Pill>
          <h1 className="mt-4 text-3xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600">{companySettings.nome} - {activeCampaign.nome}</p>
          <div className="mt-6 grid gap-4 text-zinc-700">
            {dynamicContent[kind].map((item, index) => (
              <p key={item}><strong>{index + 1}.</strong> {item}</p>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}

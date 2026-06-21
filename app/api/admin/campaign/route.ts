import { NextRequest } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { getActiveCampaign, updateDb } from "@/lib/local-db";
import { sanitizeText } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();
  await updateDb((state) => {
    const campaign = getActiveCampaign(state);
    campaign.nome = sanitizeText(String(formData.get("nome") || campaign.nome));
    campaign.descricao = sanitizeText(String(formData.get("descricao") || campaign.descricao));
    campaign.slug = sanitizeText(String(formData.get("slug") || campaign.slug)).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    campaign.dataInicial = String(formData.get("dataInicial") || campaign.dataInicial);
    campaign.dataFinal = String(formData.get("dataFinal") || campaign.dataFinal);
    campaign.maxParticipantes = Number(formData.get("maxParticipantes") || campaign.maxParticipantes);
    campaign.maxGiros = Number(formData.get("maxGiros") || campaign.maxGiros);
    campaign.texto = sanitizeText(String(formData.get("texto") || campaign.texto));
    campaign.vipGroupUrl = sanitizeText(String(formData.get("vipGroupUrl") || campaign.vipGroupUrl));
    campaign.regras = String(formData.get("regras") || "")
      .split(/\r?\n/)
      .map((rule) => sanitizeText(rule))
      .filter(Boolean);
    campaign.ativa = formData.get("ativa") === "on";

    state.companySettings.nome = sanitizeText(String(formData.get("companyNome") || state.companySettings.nome));
    state.companySettings.slogan = sanitizeText(String(formData.get("slogan") || state.companySettings.slogan));
    state.companySettings.endereco = sanitizeText(String(formData.get("endereco") || state.companySettings.endereco));
    state.companySettings.whatsapp = sanitizeText(String(formData.get("whatsapp") || state.companySettings.whatsapp));
    state.companySettings.whatsappDigits = state.companySettings.whatsapp.replace(/\D/g, "");
    state.companySettings.vipGroupUrl = campaign.vipGroupUrl;

    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: "campanha_atualizada",
      entity: "campaigns",
      entityId: campaign.id,
      actor: guard.session?.email,
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#campanhas");
}

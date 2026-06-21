import { NextRequest } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { updateDb } from "@/lib/local-db";
import { sanitizeText } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();

  await updateDb((state) => {
    state.companySettings.nome = sanitizeText(String(formData.get("nome") || state.companySettings.nome));
    state.companySettings.whatsapp = sanitizeText(String(formData.get("whatsapp") || state.companySettings.whatsapp));
    state.companySettings.whatsappDigits = state.companySettings.whatsapp.replace(/\D/g, "");
    state.companySettings.endereco = sanitizeText(String(formData.get("endereco") || state.companySettings.endereco));
    state.companySettings.googleMapsUrl = String(formData.get("googleMapsUrl") || state.companySettings.googleMapsUrl).trim();
    state.companySettings.googleReviewsUrl = String(formData.get("googleReviewsUrl") || state.companySettings.googleReviewsUrl).trim();
    state.companySettings.vipGroupUrl = String(formData.get("vipGroupUrl") || state.companySettings.vipGroupUrl).trim();
    state.companySettings.publicSiteUrl = String(formData.get("publicSiteUrl") || "").trim();
    state.companySettings.defaultWhatsappMessage = sanitizeText(String(formData.get("defaultWhatsappMessage") || state.companySettings.defaultWhatsappMessage));
    state.legalTexts = {
      terms: sanitizeText(String(formData.get("terms") || state.legalTexts?.terms || "")),
      privacy: sanitizeText(String(formData.get("privacy") || state.legalTexts?.privacy || "")),
      rules: sanitizeText(String(formData.get("rules") || state.legalTexts?.rules || ""))
    };
    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: "configuracoes_atualizadas",
      entity: "settings",
      actor: guard.session?.email,
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#configuracoes");
}

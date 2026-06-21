import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { createId, getActiveCampaign, updateDb } from "@/lib/local-db";
import type { PrizeCategory, PrizeStatus } from "@/lib/types";
import { sanitizeText } from "@/lib/validators";

export const runtime = "nodejs";

function asPrizeStatus(value: FormDataEntryValue | null): PrizeStatus {
  return value === "inativo" || value === "esgotado" ? value : "ativo";
}

function asCategory(value: FormDataEntryValue | null): PrizeCategory {
  const text = String(value || "Comum");
  return ["Comum", "Intermediario", "Premium", "Especial", "Personalizado"].includes(text) ? text as PrizeCategory : "Comum";
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();
  const action = String(formData.get("action") || "update");

  await updateDb((state) => {
    const campaign = getActiveCampaign(state);

    if (action === "create") {
      state.prizes.push({
        id: createId("pre"),
        campanhaId: campaign.id,
        nome: sanitizeText(String(formData.get("nome") || "Novo premio")),
        descricao: sanitizeText(String(formData.get("descricao") || "")),
        categoria: asCategory(formData.get("categoria")),
        valorEstimado: Number(formData.get("valorEstimado") || 0),
        estoqueDisponivel: Number(formData.get("estoqueDisponivel") || 0),
        probabilidade: Number(formData.get("probabilidade") || 1),
        validadeDias: Number(formData.get("validadeDias") || 30),
        observacoes: sanitizeText(String(formData.get("observacoes") || "")),
        status: asPrizeStatus(formData.get("status")),
        imagemUrl: "/brand/prize-gift.svg",
        limiteEspecial: "ilimitado"
      });
    } else if (action === "delete") {
      const id = String(formData.get("id") || "");
      state.prizes = state.prizes.filter((prize) => prize.id !== id);
    } else {
      const id = String(formData.get("id") || "");
      const prize = state.prizes.find((item) => item.id === id);
      if (!prize) {
        return;
      }

      prize.nome = sanitizeText(String(formData.get("nome") || prize.nome));
      prize.descricao = sanitizeText(String(formData.get("descricao") || prize.descricao));
      prize.categoria = asCategory(formData.get("categoria"));
      prize.valorEstimado = Number(formData.get("valorEstimado") || prize.valorEstimado);
      prize.estoqueDisponivel = Number(formData.get("estoqueDisponivel") || prize.estoqueDisponivel);
      prize.probabilidade = Number(formData.get("probabilidade") || prize.probabilidade);
      prize.validadeDias = Number(formData.get("validadeDias") || prize.validadeDias);
      prize.status = asPrizeStatus(formData.get("status"));
    }

    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: `premio_${action}`,
      entity: "prizes",
      actor: guard.session?.email,
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#premios");
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Informe o premio." }, { status: 400 });
  }

  await updateDb((state) => {
    state.prizes = state.prizes.filter((prize) => prize.id !== id);
  });

  return NextResponse.json({ ok: true });
}

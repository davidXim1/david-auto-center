import { NextRequest } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { updateDb } from "@/lib/local-db";
import type { RedemptionStatus } from "@/lib/types";
import { sanitizeText } from "@/lib/validators";

export const runtime = "nodejs";

function asStatus(value: FormDataEntryValue | null): RedemptionStatus {
  const text = String(value || "pendente").toLowerCase();
  if (text === "resgatado") return "resgatado";
  if (text === "cancelado") return "cancelado";
  return "pendente";
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "update");
  const confirmedDelete = formData.get("confirmDelete") === "on";

  await updateDb((state) => {
    const redemption = state.redemptions.find((item) => item.id === id);
    if (!redemption) return;

    if (action === "delete") {
      if (!confirmedDelete) return;

      const linkedParticipations = state.participations.filter((participation) => participation.redemptionId === redemption.id);
      const linkedPrizeId = redemption.prizeId || linkedParticipations[0]?.prizeId;
      let stockRestored = false;

      if (linkedPrizeId && redemption.status !== "resgatado") {
        const prize = state.prizes.find((item) => item.id === linkedPrizeId);
        if (prize) {
          prize.estoqueDisponivel += 1;
          if (prize.status === "esgotado") {
            prize.status = "ativo";
          }
          stockRestored = true;
        }
      }

      state.redemptions = state.redemptions.filter((item) => item.id !== redemption.id);
      state.participations = state.participations.filter((participation) => participation.redemptionId !== redemption.id);

      state.auditLogs.push({
        id: crypto.randomUUID(),
        action: "resgate_excluido",
        entity: "redemptions",
        entityId: redemption.id,
        actor: guard.session?.email,
        oldValue: {
          codigo: redemption.codigo,
          cliente: redemption.cliente,
          placa: redemption.placa,
          premio: redemption.premio,
          status: redemption.status,
          participationIds: linkedParticipations.map((participation) => participation.id),
          stockRestored
        },
        createdAt: new Date().toISOString()
      });
      return;
    }

    redemption.status = asStatus(formData.get("status"));
    redemption.observacao = sanitizeText(String(formData.get("observacao") || redemption.observacao || ""));
    redemption.placaConferida = formData.get("placaConferida") === "on";
    if (redemption.status === "resgatado") {
      redemption.redeemedAt = new Date().toISOString();
    }

    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: "resgate_atualizado",
      entity: "redemptions",
      entityId: redemption.id,
      actor: guard.session?.email,
      newValue: { status: redemption.status, placaConferida: redemption.placaConferida },
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#resgates");
}

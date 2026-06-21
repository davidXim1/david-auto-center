import { NextRequest } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { updateDb } from "@/lib/local-db";
import type { ScheduleStatus } from "@/lib/types";

export const runtime = "nodejs";

function asStatus(value: FormDataEntryValue | null): ScheduleStatus {
  const text = String(value || "Aguardando aprovacao");
  return ["Aguardando aprovacao", "Aprovado", "Recusado", "Cancelado", "Concluido"].includes(text) ? text as ScheduleStatus : "Aguardando aprovacao";
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "update");

  await updateDb((state) => {
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) return;

    if (action === "delete") {
      state.appointments = state.appointments.filter((item) => item.id !== id);
      state.auditLogs.push({
        id: crypto.randomUUID(),
        action: "agendamento_excluido",
        entity: "appointments",
        entityId: appointment.id,
        actor: guard.session?.email,
        oldValue: appointment,
        createdAt: new Date().toISOString()
      });
      return;
    }

    appointment.status = asStatus(formData.get("status"));
    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: "agendamento_atualizado",
      entity: "appointments",
      entityId: appointment.id,
      actor: guard.session?.email,
      newValue: { status: appointment.status },
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#agendamentos");
}

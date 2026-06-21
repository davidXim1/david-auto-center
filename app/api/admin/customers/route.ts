import { NextRequest } from "next/server";
import { requireAdmin, redirectBack } from "@/lib/admin-auth";
import { updateDb } from "@/lib/local-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const formData = await request.formData();
  const action = String(formData.get("action") || "");
  const customerId = String(formData.get("id") || "");
  const confirmed = formData.get("confirm") === "on";

  if (action !== "delete" || !customerId || !confirmed) {
    return redirectBack(request, "#clientes");
  }

  await updateDb((state) => {
    const customer = state.customers.find((item) => item.id === customerId);
    if (!customer) {
      return;
    }

    const customerVehicles = state.vehicles.filter((vehicle) => vehicle.customerId === customerId);
    const vehicleIds = new Set(customerVehicles.map((vehicle) => vehicle.id));
    const vehiclePlates = new Set(customerVehicles.map((vehicle) => vehicle.placa));
    const redemptionPrizeIds = state.redemptions
      .filter((redemption) => redemption.customerId === customerId || (redemption.vehicleId && vehicleIds.has(redemption.vehicleId)))
      .map((redemption) => redemption.prizeId)
      .filter(Boolean);

    for (const prizeId of redemptionPrizeIds) {
      const prize = state.prizes.find((item) => item.id === prizeId);
      if (prize) {
        prize.estoqueDisponivel += 1;
        if (prize.status === "esgotado") {
          prize.status = "ativo";
        }
      }
    }

    state.customers = state.customers.filter((item) => item.id !== customerId);
    state.vehicles = state.vehicles.filter((vehicle) => vehicle.customerId !== customerId);
    state.participations = state.participations.filter((participation) => participation.customerId !== customerId && !vehicleIds.has(participation.vehicleId));
    state.redemptions = state.redemptions.filter((redemption) => redemption.customerId !== customerId && !(redemption.vehicleId && vehicleIds.has(redemption.vehicleId)));
    state.appointments = state.appointments.filter((appointment) => !vehiclePlates.has(appointment.placa));

    state.auditLogs.push({
      id: crypto.randomUUID(),
      action: "cliente_excluido",
      entity: "customers",
      entityId: customerId,
      actor: guard.session?.email,
      oldValue: { nome: customer.nome, telefone: customer.telefone, vehicleIds: Array.from(vehicleIds) },
      createdAt: new Date().toISOString()
    });
  });

  return redirectBack(request, "#clientes");
}

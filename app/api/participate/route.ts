import { NextRequest, NextResponse } from "next/server";
import { decrementPrizeStock, getActiveCampaign, normalizePhone, normalizePlate, readDb, updateDb, createId } from "@/lib/local-db";
import { drawPrize } from "@/lib/prize-engine";
import { generatePrizeCode } from "@/lib/utils";
import { isBrazilianPhone, isBrazilianPlate, sanitizeText } from "@/lib/validators";

export const runtime = "nodejs";

const requiredTerms = [
  "Aceito os Termos de Uso.",
  "Aceito a Politica de Privacidade.",
  "Aceito o Regulamento da Campanha.",
  "Autorizo contato por WhatsApp.",
  "Confirmo que meus dados sao verdadeiros."
];

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function generateUniqueCode(existingCodes: Set<string>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generatePrizeCode(new Date().getFullYear());
    if (!existingCodes.has(code)) {
      return code;
    }
  }

  return `DAC-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const nome = sanitizeText(String(body.nome || ""));
  const telefoneRaw = sanitizeText(String(body.telefone || ""));
  const whatsappRaw = sanitizeText(String(body.whatsapp || telefoneRaw));
  const placaRaw = sanitizeText(String(body.placa || ""));
  const marca = sanitizeText(String(body.marca || ""));
  const modelo = sanitizeText(String(body.modelo || ""));
  const kmAtual = Number(body.km || body.kmAtual || 0);
  const acceptedTerms = Array.isArray(body.acceptedTerms) ? body.acceptedTerms.map(String) : [];
  const joinedVipGroup = body.joinedVipGroup === true;

  if (
    nome.length < 4 ||
    !isBrazilianPhone(telefoneRaw) ||
    !isBrazilianPhone(whatsappRaw) ||
    !isBrazilianPlate(placaRaw) ||
    marca.length < 2 ||
    modelo.length < 2 ||
    !Number.isFinite(kmAtual) ||
    kmAtual <= 0
  ) {
    return NextResponse.json({ error: "Preencha corretamente nome, telefone, WhatsApp, placa, marca, modelo e KM." }, { status: 400 });
  }

  const missingTerms = requiredTerms.filter((term) => !acceptedTerms.includes(term));
  if (missingTerms.length > 0) {
    return NextResponse.json({ error: "Aceite todos os termos obrigatorios para liberar a roleta." }, { status: 400 });
  }

  if (!joinedVipGroup) {
    return NextResponse.json({ error: "Entre no Grupo VIP antes de girar a roleta." }, { status: 400 });
  }

  const telefone = normalizePhone(telefoneRaw);
  const whatsapp = normalizePhone(whatsappRaw);
  const placa = normalizePlate(placaRaw);

  try {
    const result = await updateDb(async (state) => {
      const campaign = getActiveCampaign(state);

      if (!campaign?.ativa) {
        throw new Error("Nenhuma campanha ativa no momento.");
      }

      const duplicate = state.participations.find((participation) => {
        return participation.campaignId === campaign.id && (participation.placa === placa || participation.telefone === telefone);
      }) || state.redemptions.find((redemption) => {
        return redemption.campaignId === campaign.id && (redemption.placa === placa || normalizePhone(redemption.telefone) === telefone);
      });

      if (duplicate) {
        const error = new Error("Esta placa ou telefone ja participou desta campanha.");
        error.name = "DUPLICATE_PARTICIPATION";
        throw error;
      }

      const campaignPrizes = state.prizes.filter((prize) => prize.campanhaId === campaign.id);
      const draw = drawPrize(campaignPrizes);
      const prize = state.prizes.find((item) => item.id === draw.prize.id);
      if (!prize) {
        throw new Error("Premio nao encontrado.");
      }

      let customer = state.customers.find((item) => normalizePhone(item.telefone) === telefone || normalizePhone(item.whatsapp || "") === whatsapp);
      if (!customer) {
        customer = {
          id: createId("cli"),
          nome,
          telefone,
          whatsapp,
          email: "",
          cidade: "",
          nivel: "Bronze",
          totalGasto: 0,
          indicacoes: 0,
          ultimaVisita: "",
          referralCode: crypto.randomUUID().slice(0, 6).toUpperCase(),
          createdAt: new Date().toISOString()
        };
        state.customers.push(customer);
      } else {
        customer.nome = nome;
        customer.telefone = telefone;
        customer.whatsapp = whatsapp;
      }

      let vehicle = state.vehicles.find((item) => normalizePlate(item.placa) === placa);
      if (!vehicle) {
        vehicle = {
          id: createId("vei"),
          customerId: customer.id,
          placa,
          marca,
          modelo,
          ano: 0,
          kmAtual,
          ultimaVisita: "",
          ultimaTrocaOleo: "",
          proximaRevisao: "",
          createdAt: new Date().toISOString()
        };
        state.vehicles.push(vehicle);
      } else {
        vehicle.customerId = customer.id;
        vehicle.marca = marca;
        vehicle.modelo = modelo;
        vehicle.kmAtual = kmAtual;
      }

      const existingCodes = new Set(state.redemptions.map((redemption) => redemption.codigo));
      const codigo = await generateUniqueCode(existingCodes);
      const redemptionId = createId("res");
      const participationId = createId("par");
      const validade = addDays(prize.validadeDias);
      const createdAt = new Date().toISOString();

      const redemption = {
        id: redemptionId,
        codigo,
        customerId: customer.id,
        vehicleId: vehicle.id,
        prizeId: prize.id,
        campaignId: campaign.id,
        cliente: customer.nome,
        telefone: customer.telefone,
        placa: vehicle.placa,
        premio: prize.nome,
        campanha: campaign.nome,
        data: createdAt,
        validade,
        status: "pendente" as const,
        placaConferida: false
      };

      state.redemptions.push(redemption);
      state.participations.push({
        id: participationId,
        campaignId: campaign.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        telefone,
        placa,
        acceptedTerms,
        prizeId: prize.id,
        redemptionId,
        createdAt
      });
      decrementPrizeStock(prize);
      state.auditLogs.push({
        id: createId("log"),
        action: "participacao_criada",
        entity: "participations",
        entityId: participationId,
        newValue: { customerId: customer.id, vehicleId: vehicle.id, prizeId: prize.id, codigo },
        createdAt
      });

      return {
        prize,
        redemption,
        customer,
        vehicle,
        campaign,
        rotation: draw.rotation
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel registrar a participacao.";
    const status = error instanceof Error && error.name === "DUPLICATE_PARTICIPATION" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  const state = await readDb();
  const campaign = getActiveCampaign(state);
  return NextResponse.json({
    campaign,
    prizes: state.prizes.filter((prize) => prize.campanhaId === campaign.id && prize.status === "ativo" && prize.estoqueDisponivel > 0)
  });
}

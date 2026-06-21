import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { appointments, activeCampaign, companySettings, customers, loyaltyLevels, prizes, redemptions, vehicles } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Appointment, Campaign, Customer, DatabaseState, Participation, Prize, Redemption, Vehicle } from "@/lib/types";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "db.json");
const supabaseStateKey = "main";
let writeQueue = Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedState(): DatabaseState {
  return {
    companySettings: clone(companySettings),
    campaigns: [clone(activeCampaign)],
    prizes: clone(prizes),
    customers: clone(customers).map((customer) => ({
      ...customer,
      whatsapp: customer.telefone,
      referralCode: customer.id.toUpperCase(),
      createdAt: nowIso()
    })),
    vehicles: clone(vehicles).map((vehicle) => ({
      ...vehicle,
      ultimaVisita: vehicle.ultimaTrocaOleo,
      createdAt: nowIso()
    })),
    redemptions: clone(redemptions).map((redemption) => ({
      ...redemption,
      status: normalizeRedemptionStatus(redemption.status)
    })),
    appointments: clone(appointments),
    participations: [],
    auditLogs: [],
    legalTexts: {
      terms: "O participante declara que forneceu dados verdadeiros e aceita as regras da campanha.",
      privacy: "Os dados serao usados para campanhas, contato via WhatsApp, premios, resgates e relacionamento com a oficina.",
      rules: "Uma participacao por telefone ou placa. O premio so e valido com codigo DAC e comprovante gerado pelo sistema."
    },
    loyaltyLevels: clone(loyaltyLevels)
  };
}

export function normalizeRedemptionStatus(status: unknown) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "resgatado") return "resgatado" as const;
  if (value === "cancelado" || value === "cancelado por fraude" || value === "expirado") return "cancelado" as const;
  return "pendente" as const;
}

function normalizeState(state: Partial<DatabaseState>): DatabaseState {
  const normalized: DatabaseState = {
    ...seedState(),
    ...state,
    companySettings: {
      ...companySettings,
      ...(state.companySettings ?? {})
    },
    campaigns: state.campaigns?.length ? state.campaigns : [clone(activeCampaign)],
    prizes: state.prizes ?? clone(prizes),
    customers: state.customers ?? [],
    vehicles: state.vehicles ?? [],
    redemptions: (state.redemptions ?? []).map((redemption) => ({
      ...redemption,
      status: normalizeRedemptionStatus(redemption.status)
    })),
    appointments: state.appointments ?? [],
    participations: state.participations ?? [],
    auditLogs: state.auditLogs ?? [],
    legalTexts: {
      terms: state.legalTexts?.terms || "O participante declara que forneceu dados verdadeiros e aceita as regras da campanha.",
      privacy: state.legalTexts?.privacy || "Os dados serao usados para campanhas, contato via WhatsApp, premios, resgates e relacionamento com a oficina.",
      rules: state.legalTexts?.rules || "Uma participacao por telefone ou placa. O premio so e valido com codigo DAC e comprovante gerado pelo sistema."
    },
    loyaltyLevels: state.loyaltyLevels?.length ? state.loyaltyLevels : clone(loyaltyLevels)
  };

  return normalized;
}

async function ensureDbFile() {
  await mkdir(dbDir, { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify(seedState(), null, 2), "utf8");
  }
}

async function readLocalStateOrSeed() {
  await ensureDbFile();
  const raw = await readFile(dbPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<DatabaseState>;
  return normalizeState(parsed);
}

async function readSupabaseState() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", supabaseStateKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao ler app_state no Supabase: ${error.message}`);
  }

  if (!data?.value) {
    const initialState = await readLocalStateOrSeed();
    const { error: seedError } = await supabase
      .from("app_state")
      .upsert({
        key: supabaseStateKey,
        value: initialState,
        updated_at: new Date().toISOString()
      });

    if (seedError) {
      throw new Error(`Erro ao criar app_state no Supabase: ${seedError.message}`);
    }

    return initialState;
  }

  return normalizeState(data.value as Partial<DatabaseState>);
}

export async function readDb(): Promise<DatabaseState> {
  const supabaseState = await readSupabaseState();
  if (supabaseState) {
    return supabaseState;
  }

  return readLocalStateOrSeed();
}

export async function writeDb(state: DatabaseState) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    writeQueue = writeQueue.then(async () => {
      const { error } = await supabase
        .from("app_state")
        .upsert({
          key: supabaseStateKey,
          value: state,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Erro ao salvar app_state no Supabase: ${error.message}`);
      }
    });
    await writeQueue;
    return;
  }

  await mkdir(dbDir, { recursive: true });
  writeQueue = writeQueue.then(() => writeFile(dbPath, JSON.stringify(state, null, 2), "utf8"));
  await writeQueue;
}

export async function updateDb<T>(updater: (state: DatabaseState) => T | Promise<T>) {
  const state = await readDb();
  const result = await updater(state);
  await writeDb(state);
  return result;
}

export function getActiveCampaign(state: DatabaseState): Campaign {
  return state.campaigns.find((campaign) => campaign.ativa) ?? state.campaigns[0];
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function getDashboardMetrics(state: DatabaseState) {
  const activeCampaign = getActiveCampaign(state);
  const pendingRedemptions = state.redemptions.filter((redemption) => redemption.status === "pendente").length;
  const redeemed = state.redemptions.filter((redemption) => redemption.status === "resgatado").length;
  const totalStock = state.prizes.reduce((sum, prize) => sum + Math.max(0, prize.estoqueDisponivel), 0);

  return [
    { label: "Participantes", value: String(state.customers.length), hint: "clientes cadastrados" },
    { label: "Veiculos", value: String(state.vehicles.length), hint: "placas registradas" },
    { label: "Participacoes", value: String(state.participations.length), hint: "giros validos" },
    { label: "Premios entregues", value: String(redeemed), hint: "resgatados" },
    { label: "Premios pendentes", value: String(pendingRedemptions), hint: "aguardando resgate" },
    { label: "Estoque total", value: String(totalStock), hint: "premios restantes" },
    { label: "Campanha ativa", value: activeCampaign?.ativa ? "Sim" : "Nao", hint: activeCampaign?.nome || "sem campanha" }
  ];
}

export function sortNewest<T extends Customer | Redemption | Appointment | Vehicle | Participation>(items: T[]) {
  return [...items].reverse();
}

export function activePrizesForCampaign(state: DatabaseState, campaignId: string) {
  return state.prizes.filter((prize) => prize.campanhaId === campaignId && prize.status === "ativo" && prize.estoqueDisponivel > 0);
}

export function decrementPrizeStock(prize: Prize) {
  prize.estoqueDisponivel = Math.max(0, prize.estoqueDisponivel - 1);
  if (prize.estoqueDisponivel === 0) {
    prize.status = "esgotado";
  }
}

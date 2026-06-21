export type VipGroupMode = "obrigatorio" | "opcional" | "desativado";
export type CampaignAudience =
  | "todos"
  | "clientes_cadastrados"
  | "vip"
  | "ouro"
  | "diamante"
  | "servico_realizado"
  | "convidados"
  | "clientes_novos"
  | "clientes_antigos";

export type PrizeCategory = "Comum" | "Intermediario" | "Premium" | "Especial" | "Personalizado";
export type PrizeStatus = "ativo" | "inativo" | "esgotado";
export type RedemptionStatus = "pendente" | "resgatado" | "cancelado";
export type UserRole = "Administrador" | "Gerente" | "Atendente";
export type ScheduleStatus = "Aguardando aprovacao" | "Aprovado" | "Recusado" | "Cancelado" | "Concluido";

export type FieldKey =
  | "nomeCompleto"
  | "telefone"
  | "whatsapp"
  | "email"
  | "dataNascimento"
  | "placa"
  | "marca"
  | "modelo"
  | "ano"
  | "kmAtual"
  | "endereco"
  | "cidade"
  | "cep";

export interface CompanySettings {
  nome: string;
  slogan: string;
  endereco: string;
  cidade: string;
  whatsapp: string;
  whatsappDigits: string;
  logoUrl: string;
  fachadaUrl: string;
  googleMapsUrl: string;
  googleReviewsUrl: string;
  vipGroupUrl: string;
  publicSiteUrl?: string;
  defaultWhatsappMessage: string;
}

export interface Campaign {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  texto: string;
  dataInicial: string;
  dataFinal: string;
  horarioInicial: string;
  horarioFinal: string;
  ativa: boolean;
  maxParticipantes: number;
  maxGiros: number;
  umGiroPorPlaca: boolean;
  umGiroPorTelefone: boolean;
  regras: string[];
  camposObrigatorios: FieldKey[];
  camposVisiveis: FieldKey[];
  bannerUrl: string;
  linkCompartilhamento: string;
  vipGroupMode: VipGroupMode;
  vipGroupUrl: string;
  publico: CampaignAudience[];
}

export interface Prize {
  id: string;
  campanhaId: string;
  nome: string;
  descricao: string;
  categoria: PrizeCategory;
  valorEstimado: number;
  estoqueDisponivel: number;
  probabilidade: number;
  validadeDias: number;
  observacoes: string;
  status: PrizeStatus;
  imagemUrl: string;
  limiteEspecial: "12h" | "diario" | "semanal" | "campanha" | "ilimitado";
}

export interface Customer {
  id: string;
  nome: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  dataNascimento?: string;
  endereco?: string;
  cidade: string;
  cep?: string;
  nivel: string;
  totalGasto: number;
  indicacoes: number;
  ultimaVisita: string;
  referralCode?: string;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  kmAtual: number;
  ultimaVisita?: string;
  ultimaTrocaOleo: string;
  proximaRevisao: string;
  createdAt?: string;
}

export interface Redemption {
  id: string;
  codigo: string;
  customerId?: string;
  vehicleId?: string;
  prizeId?: string;
  campaignId?: string;
  cliente: string;
  telefone: string;
  placa: string;
  premio: string;
  campanha: string;
  data: string;
  validade: string;
  status: RedemptionStatus;
  observacao?: string;
  placaConferida?: boolean;
  redeemedAt?: string;
}

export interface Appointment {
  id: string;
  cliente: string;
  telefone: string;
  placa: string;
  servico: string;
  data: string;
  periodo: string;
  status: ScheduleStatus;
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface Participation {
  id: string;
  campaignId: string;
  customerId: string;
  vehicleId: string;
  telefone: string;
  placa: string;
  acceptedTerms: string[];
  prizeId: string;
  redemptionId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  actor?: string;
  createdAt: string;
}

export interface DatabaseState {
  companySettings: CompanySettings;
  campaigns: Campaign[];
  prizes: Prize[];
  customers: Customer[];
  vehicles: Vehicle[];
  redemptions: Redemption[];
  appointments: Appointment[];
  participations: Participation[];
  auditLogs: AuditLog[];
  legalTexts?: {
    terms: string;
    privacy: string;
    rules: string;
  };
  loyaltyLevels: Array<{
    nivel: string;
    gastoMinimo: number;
    visitas: number;
    beneficios: string;
  }>;
}

import type { Appointment, Campaign, CompanySettings, Customer, DashboardMetric, Prize, Redemption, Vehicle } from "./types";

export const companySettings: CompanySettings = {
  nome: "David Auto Center",
  slogan: "Carro bom e carro revisado.",
  endereco: "Av. Nicola Capucci, 111 - Cidade Jardim",
  cidade: "Jacarei - SP",
  whatsapp: "+55 12 3953-2792",
  whatsappDigits: "551239532792",
  logoUrl: "/brand/logo-david-auto-center-clube.jpeg",
  fachadaUrl: "/brand/fachada-david-auto-center.jpeg",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.%20Nicola%20Capucci%20111%20Cidade%20Jardim%20Jacarei%20SP",
  googleReviewsUrl: "https://www.google.com/search?q=David+Auto+Center+Jacarei+avaliar",
  vipGroupUrl: "https://chat.whatsapp.com/KIB4APmc6j17ori8BrndQ7?s=sw&p=i&ilr=0",
  publicSiteUrl: "https://david-auto-center.vercel.app",
  defaultWhatsappMessage: "Ola, participei da campanha da David Auto Center e gostaria de mais informacoes."
};

export const activeCampaign: Campaign = {
  id: "camp-revisao-premiada-2026",
  slug: "revisao-premiada",
  nome: "Revisao Premiada 2026",
  descricao: "Cadastre seu veiculo, aceite o regulamento e gire para ganhar beneficios reais na oficina.",
  texto: "Todo participante ganha um cupom. Premios especiais respeitam estoque, validade e regras da campanha.",
  dataInicial: "2026-06-01",
  dataFinal: "2026-12-31",
  horarioInicial: "08:00",
  horarioFinal: "18:00",
  ativa: true,
  maxParticipantes: 5000,
  maxGiros: 1,
  umGiroPorPlaca: true,
  umGiroPorTelefone: true,
  regras: [
    "Uma participacao por placa e telefone nesta campanha.",
    "O premio so e valido com codigo DAC e QR Code gerados pelo sistema.",
    "O resgate depende de conferencia da placa na oficina."
  ],
  camposObrigatorios: ["nomeCompleto", "telefone", "whatsapp", "placa", "marca", "modelo", "kmAtual"],
  camposVisiveis: [
    "nomeCompleto",
    "telefone",
    "whatsapp",
    "email",
    "dataNascimento",
    "placa",
    "marca",
    "modelo",
    "ano",
    "kmAtual",
    "cidade",
    "cep"
  ],
  bannerUrl: "/brand/fachada-david-auto-center.jpeg",
  linkCompartilhamento: "https://david-auto-center.vercel.app/participar",
  vipGroupMode: "opcional",
  vipGroupUrl: "https://chat.whatsapp.com/KIB4APmc6j17ori8BrndQ7?s=sw&p=i&ilr=0",
  publico: ["todos"]
};

export const prizes: Prize[] = [
  {
    id: "p1",
    campanhaId: activeCampaign.id,
    nome: "Check-up gratuito",
    descricao: "Inspecao visual com checklist de seguranca.",
    categoria: "Premium",
    valorEstimado: 120,
    estoqueDisponivel: 12,
    probabilidade: 8,
    validadeDias: 30,
    observacoes: "Valido mediante agendamento e conferencia da placa.",
    status: "ativo",
    imagemUrl: "/brand/prize-premium.svg",
    limiteEspecial: "diario"
  },
  {
    id: "p2",
    campanhaId: activeCampaign.id,
    nome: "10% desconto mao de obra",
    descricao: "Desconto em servicos de manutencao preventiva.",
    categoria: "Intermediario",
    valorEstimado: 80,
    estoqueDisponivel: 120,
    probabilidade: 27,
    validadeDias: 45,
    observacoes: "Nao cumulativo com outras promocoes.",
    status: "ativo",
    imagemUrl: "/brand/prize-discount.svg",
    limiteEspecial: "ilimitado"
  },
  {
    id: "p3",
    campanhaId: activeCampaign.id,
    nome: "1 litro de oleo 5W30",
    descricao: "Bonus para troca de oleo realizada na oficina.",
    categoria: "Comum",
    valorEstimado: 45,
    estoqueDisponivel: 80,
    probabilidade: 35,
    validadeDias: 30,
    observacoes: "Produto sujeito a compatibilidade com o veiculo.",
    status: "ativo",
    imagemUrl: "/brand/prize-oil.svg",
    limiteEspecial: "ilimitado"
  },
  {
    id: "p4",
    campanhaId: activeCampaign.id,
    nome: "Brinde surpresa",
    descricao: "Um presente da David Auto Center para voce.",
    categoria: "Personalizado",
    valorEstimado: 25,
    estoqueDisponivel: 200,
    probabilidade: 30,
    validadeDias: 30,
    observacoes: "Retirada presencial.",
    status: "ativo",
    imagemUrl: "/brand/prize-gift.svg",
    limiteEspecial: "ilimitado"
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Clientes hoje", value: "18", hint: "+22% vs. ontem" },
  { label: "Clientes no mes", value: "384", hint: "meta 500" },
  { label: "Giros hoje", value: "43", hint: "36 validos" },
  { label: "Indicacoes", value: "71", hint: "Top cliente: 9" },
  { label: "Agendamentos pendentes", value: "12", hint: "precisam aprovacao" },
  { label: "Premios pendentes", value: "28", hint: "R$ 2.140 estimados" },
  { label: "Clientes VIP", value: "96", hint: "18 VIP Black" },
  { label: "Campanhas ativas", value: "3", hint: "2 com QR Code" }
];

export const customers: Customer[] = [
  { id: "c1", nome: "Marcos Vinicius", telefone: "(12) 99121-1188", email: "marcos@email.com", cidade: "Jacarei", nivel: "VIP Gold", totalGasto: 6200, indicacoes: 9, ultimaVisita: "2026-06-14" },
  { id: "c2", nome: "Ana Paula", telefone: "(12) 99731-4500", email: "ana@email.com", cidade: "Sao Jose dos Campos", nivel: "Ouro", totalGasto: 3400, indicacoes: 4, ultimaVisita: "2026-05-28" },
  { id: "c3", nome: "Roberto Lima", telefone: "(12) 98812-4001", email: "roberto@email.com", cidade: "Jacarei", nivel: "Bronze", totalGasto: 890, indicacoes: 1, ultimaVisita: "2025-11-12" }
];

export const vehicles: Vehicle[] = [
  { id: "v1", customerId: "c1", placa: "FWD4A21", marca: "Toyota", modelo: "Corolla", ano: 2021, kmAtual: 58200, ultimaTrocaOleo: "2026-04-10", proximaRevisao: "2026-08-10" },
  { id: "v2", customerId: "c2", placa: "DKL-4821", marca: "Honda", modelo: "Fit", ano: 2018, kmAtual: 76400, ultimaTrocaOleo: "2026-02-02", proximaRevisao: "2026-07-02" },
  { id: "v3", customerId: "c3", placa: "BRA2E19", marca: "Fiat", modelo: "Argo", ano: 2020, kmAtual: 49200, ultimaTrocaOleo: "2025-09-18", proximaRevisao: "2026-01-18" }
];

export const redemptions: Redemption[] = [
  { id: "r1", codigo: "DAC-2026-A7K92", cliente: "Marcos Vinicius", telefone: "(12) 99121-1188", placa: "FWD4A21", premio: "Check-up gratuito", campanha: activeCampaign.nome, data: "2026-06-19 10:22", validade: "2026-07-19", status: "pendente" },
  { id: "r2", codigo: "DAC-2026-Q4P81", cliente: "Ana Paula", telefone: "(12) 99731-4500", placa: "DKL-4821", premio: "10% desconto mao de obra", campanha: activeCampaign.nome, data: "2026-06-18 16:05", validade: "2026-08-02", status: "resgatado" }
];

export const appointments: Appointment[] = [
  { id: "a1", cliente: "Juliana Rocha", telefone: "(12) 98111-0901", placa: "GTR8C22", servico: "Troca de oleo", data: "2026-06-21", periodo: "Manha", status: "Aguardando aprovacao" },
  { id: "a2", cliente: "Paulo Cesar", telefone: "(12) 98222-7781", placa: "BCA-1120", servico: "Freios", data: "2026-06-22", periodo: "Tarde", status: "Aprovado" }
];

export const loyaltyLevels = [
  { nivel: "Bronze", gastoMinimo: 0, visitas: 1, beneficios: "Cupons de entrada" },
  { nivel: "Prata", gastoMinimo: 1500, visitas: 3, beneficios: "Giro extra em campanhas" },
  { nivel: "Ouro", gastoMinimo: 3000, visitas: 5, beneficios: "Prioridade em premios premium" },
  { nivel: "Diamante", gastoMinimo: 5000, visitas: 8, beneficios: "Cashback maior" },
  { nivel: "VIP Black", gastoMinimo: 10000, visitas: 12, beneficios: "Atendimento prioritario e campanhas exclusivas" }
];

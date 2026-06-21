import { CalendarDays, CheckCircle2, Download, Gift, LogOut, Search, Settings2, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { AdminNav, MobileAdminNav } from "@/components/admin-shell";
import { MarketingTools } from "@/components/marketing-tools";
import { Button, Card, FieldLabel, Input, Pill, Textarea } from "@/components/ui";
import { getActiveCampaign, getDashboardMetrics, readDb, sortNewest } from "@/lib/local-db";
import { getPublicCampaignUrl } from "@/lib/site-url";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").trim().toLowerCase();
  const state = await readDb();
  const activeCampaign = getActiveCampaign(state);
  const dashboardMetrics = getDashboardMetrics(state);
  const prizes = state.prizes.filter((prize) => prize.campanhaId === activeCampaign.id);
  const vehiclesByCustomer = new Map(state.vehicles.map((vehicle) => [vehicle.customerId, vehicle]));
  const customers = sortNewest(state.customers).filter((customer) => {
    const vehicle = vehiclesByCustomer.get(customer.id);
    const haystack = `${customer.nome} ${customer.telefone} ${customer.whatsapp || ""} ${vehicle?.placa || ""} ${vehicle?.marca || ""} ${vehicle?.modelo || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  const vehicles = sortNewest(state.vehicles);
  const redemptions = sortNewest(state.redemptions);
  const filteredRedemptions = redemptions.filter((redemption) => {
    const haystack = `${redemption.cliente} ${redemption.telefone} ${redemption.placa} ${redemption.codigo} ${redemption.premio}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  const participations = sortNewest(state.participations);
  const appointments = sortNewest(state.appointments);
  const companySettings = state.companySettings;
  const loyaltyLevels = state.loyaltyLevels;
  const publicCampaignUrl = getPublicCampaignUrl(companySettings);

  return (
    <main className="grid min-h-screen bg-zinc-50 lg:grid-cols-[250px_1fr]">
      <AdminNav />
      <section>
        <MobileAdminNav />
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Pill tone="dark">Painel administrativo</Pill>
              <h1 className="mt-2 text-3xl font-black">David Auto Center Club</h1>
              <p className="text-sm text-zinc-600">Operacao simples para campanhas, roletas, clientes, resgates e relatorios.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary"><UserCog size={18} /> Administrador</Button>
              <Button><Settings2 size={18} /> Configurar</Button>
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="dark"><LogOut size={18} /> Sair</Button>
              </form>
            </div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
            {dashboardMetrics.map((metric) => (
              <Card key={metric.label}>
                <p className="text-xs font-bold uppercase text-zinc-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-black">{metric.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{metric.hint}</p>
              </Card>
            ))}
          </section>

          <section id="campanhas" className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
            <Card>
              <form action="/api/admin/campaign" method="post">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Campanha ativa</h2>
                    <p className="text-sm text-zinc-600">Todas as regras ficam editaveis por campanha.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input name="ativa" type="checkbox" defaultChecked={activeCampaign.ativa} className="accent-brand-red" />
                    Ativa
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><FieldLabel>Nome da oficina</FieldLabel><Input name="companyNome" defaultValue={companySettings.nome} /></div>
                  <div><FieldLabel>Slogan</FieldLabel><Input name="slogan" defaultValue={companySettings.slogan} /></div>
                  <div><FieldLabel>Nome</FieldLabel><Input name="nome" defaultValue={activeCampaign.nome} /></div>
                  <div><FieldLabel>Slug</FieldLabel><Input name="slug" defaultValue={activeCampaign.slug} /></div>
                  <div className="md:col-span-2"><FieldLabel>Descricao</FieldLabel><Input name="descricao" defaultValue={activeCampaign.descricao} /></div>
                  <div><FieldLabel>Data inicial</FieldLabel><Input name="dataInicial" type="date" defaultValue={activeCampaign.dataInicial} /></div>
                  <div><FieldLabel>Data final</FieldLabel><Input name="dataFinal" type="date" defaultValue={activeCampaign.dataFinal} /></div>
                  <div><FieldLabel>Maximo de participantes</FieldLabel><Input name="maxParticipantes" type="number" defaultValue={activeCampaign.maxParticipantes} /></div>
                  <div><FieldLabel>Maximo de giros</FieldLabel><Input name="maxGiros" type="number" defaultValue={activeCampaign.maxGiros} /></div>
                  <div><FieldLabel>WhatsApp da oficina</FieldLabel><Input name="whatsapp" defaultValue={companySettings.whatsapp} /></div>
                  <div><FieldLabel>Link do Grupo VIP</FieldLabel><Input name="vipGroupUrl" defaultValue={activeCampaign.vipGroupUrl || companySettings.vipGroupUrl} /></div>
                  <div className="md:col-span-2"><FieldLabel>Endereco</FieldLabel><Input name="endereco" defaultValue={companySettings.endereco} /></div>
                  <div className="md:col-span-2"><FieldLabel>Texto da campanha</FieldLabel><Textarea name="texto" defaultValue={activeCampaign.texto} /></div>
                  <div className="md:col-span-2"><FieldLabel>Regras resumidas</FieldLabel><Textarea name="regras" defaultValue={activeCampaign.regras.join("\n")} /></div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Button type="submit">Salvar campanha</Button>
                  <Button type="button" variant="secondary">Campos obrigatorios</Button>
                  <Button type="button" variant="dark">Gerar QR Code</Button>
                </div>
              </form>
            </Card>

            <MarketingTools campaign={activeCampaign} companySettings={companySettings} campaignUrl={publicCampaignUrl} />
          </section>

          <section id="premios" className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Gerenciador de premios</h2>
              <Pill tone="dark">{prizes.length} premios</Pill>
            </div>
            {prizes.length === 0 ? (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-brand-red">
                A roleta esta sem premios. Crie pelo menos um premio ativo com estoque e probabilidade para liberar participacoes.
              </div>
            ) : null}
            <Card className="mb-3">
              <form action="/api/admin/prizes" method="post" className="grid gap-3 lg:grid-cols-6">
                <input type="hidden" name="action" value="create" />
                <div className="lg:col-span-2"><FieldLabel>Novo premio</FieldLabel><Input name="nome" placeholder="Ex: Alinhamento gratis" required /></div>
                <div className="lg:col-span-2"><FieldLabel>Descricao</FieldLabel><Input name="descricao" placeholder="Regra do premio" /></div>
                <div><FieldLabel>Estoque</FieldLabel><Input name="estoqueDisponivel" type="number" defaultValue={10} /></div>
                <div><FieldLabel>Chance %</FieldLabel><Input name="probabilidade" type="number" defaultValue={10} /></div>
                <div><FieldLabel>Categoria</FieldLabel><Input name="categoria" defaultValue="Comum" /></div>
                <div><FieldLabel>Valor R$</FieldLabel><Input name="valorEstimado" type="number" defaultValue={0} /></div>
                <div><FieldLabel>Validade dias</FieldLabel><Input name="validadeDias" type="number" defaultValue={30} /></div>
                <div><FieldLabel>Status</FieldLabel><Input name="status" defaultValue="ativo" /></div>
                <div className="lg:col-span-2"><FieldLabel>Observacoes</FieldLabel><Input name="observacoes" placeholder="Nao cumulativo, mediante agenda..." /></div>
                <div className="flex items-end"><Button type="submit" className="w-full"><Gift size={18} /> Criar</Button></div>
              </form>
            </Card>
            <div className="grid gap-3 lg:grid-cols-4">
              {prizes.map((prize) => (
                <Card key={prize.id}>
                  <form action="/api/admin/prizes" method="post" className="grid gap-2">
                    <input type="hidden" name="id" value={prize.id} />
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <Pill tone={prize.status === "ativo" ? "green" : prize.status === "esgotado" ? "red" : "neutral"}>{prize.status}</Pill>
                      <span className="text-xs font-bold text-zinc-500">{prize.probabilidade}%</span>
                    </div>
                    <div><FieldLabel>Nome</FieldLabel><Input name="nome" defaultValue={prize.nome} /></div>
                    <div><FieldLabel>Descricao</FieldLabel><Input name="descricao" defaultValue={prize.descricao} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><FieldLabel>Estoque</FieldLabel><Input name="estoqueDisponivel" type="number" defaultValue={prize.estoqueDisponivel} /></div>
                      <div><FieldLabel>Chance</FieldLabel><Input name="probabilidade" type="number" defaultValue={prize.probabilidade} /></div>
                      <div><FieldLabel>Valor</FieldLabel><Input name="valorEstimado" type="number" defaultValue={prize.valorEstimado} /></div>
                      <div><FieldLabel>Dias</FieldLabel><Input name="validadeDias" type="number" defaultValue={prize.validadeDias} /></div>
                    </div>
                    <div>
                      <FieldLabel>Categoria</FieldLabel>
                      <select name="categoria" defaultValue={prize.categoria} className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none">
                        <option>Comum</option>
                        <option>Intermediario</option>
                        <option>Premium</option>
                        <option>Especial</option>
                        <option>Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <select name="status" defaultValue={prize.status} className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none">
                        <option value="ativo">ativo</option>
                        <option value="inativo">inativo</option>
                        <option value="esgotado">esgotado</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="submit" name="action" value="update" variant="secondary">Salvar</Button>
                      <button type="submit" name="action" value="delete" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold text-white">Excluir</button>
                    </div>
                  </form>
                </Card>
              ))}
            </div>
          </section>

          <section id="clientes" className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Clientes</h2>
                <form action="/admin#clientes" className="flex gap-2">
                  <Input name="q" defaultValue={query} placeholder="Buscar nome, telefone ou placa" />
                  <Button type="submit" variant="secondary"><Search size={18} /> Buscar</Button>
                  <Button variant="dark"><Download size={18} /> Exportar</Button>
                </form>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr><th className="py-2">Nome</th><th>Telefone</th><th>Placa</th><th>Veiculo</th><th>KM</th><th>Nivel</th><th>Acao</th></tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => {
                      const vehicle = vehiclesByCustomer.get(customer.id);
                      return (
                        <tr key={customer.id} className="border-t border-zinc-100">
                          <td className="py-3 font-bold">{customer.nome}</td>
                          <td>{customer.whatsapp || customer.telefone}</td>
                          <td>{vehicle?.placa || "-"}</td>
                          <td>{vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "-"}</td>
                          <td>{vehicle?.kmAtual?.toLocaleString("pt-BR") || "-"}</td>
                          <td><Pill tone="red">{customer.nivel}</Pill></td>
                          <td>
                            <form action="/api/admin/customers" method="post">
                              <input type="hidden" name="id" value={customer.id} />
                              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-zinc-500">
                                <input name="confirm" type="checkbox" required className="accent-brand-red" />
                                Confirmar
                              </label>
                              <Button type="submit" name="action" value="delete" variant="dark" className="min-h-9 px-3">
                                <Trash2 size={15} />
                                Excluir
                              </Button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black">Carteira digital do veiculo</h2>
              <div className="mt-4 grid gap-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex items-center justify-between">
                      <strong>{vehicle.placa}</strong>
                      <Pill>{vehicle.marca} {vehicle.modelo}</Pill>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-600">
                      <span>Ano {vehicle.ano}</span>
                      <span>KM {vehicle.kmAtual.toLocaleString("pt-BR")}</span>
                      <span>Ultima troca: {vehicle.ultimaTrocaOleo}</span>
                      <span>Proxima revisao: {vehicle.proximaRevisao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section id="agendamentos" className="mt-6 grid gap-4 xl:grid-cols-2">
            <Card>
              <div className="mb-3 flex items-center gap-2"><CalendarDays className="text-brand-red" /><h2 className="text-xl font-black">Agendamento com aprovacao</h2></div>
              <div className="grid gap-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{appointment.cliente}</strong>
                      <Pill tone={appointment.status === "Aprovado" ? "green" : "red"}>{appointment.status}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{appointment.servico} - {appointment.data} - {appointment.periodo} - {appointment.placa}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      <form action="/api/admin/appointments" method="post">
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value="Aprovado" />
                        <Button type="submit"><CheckCircle2 size={18} /> Aprovar</Button>
                      </form>
                      <form action="/api/admin/appointments" method="post">
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value="Recusado" />
                        <Button type="submit" variant="secondary">Recusar</Button>
                      </form>
                      <Button type="button" variant="dark">WhatsApp</Button>
                      <form action="/api/admin/appointments" method="post">
                        <input type="hidden" name="id" value={appointment.id} />
                        <Button type="submit" name="action" value="delete" variant="dark">Excluir</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="resgates">
              <div className="mb-3 flex items-center gap-2"><ShieldCheck className="text-brand-red" /><h2 className="text-xl font-black">Participacoes e resgates</h2></div>
              <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                {participations.length} participacoes registradas. Use codigo ou placa para conferir o premio.
              </div>
              <div className="grid gap-3">
                {filteredRedemptions.map((redemption) => (
                  <div key={redemption.id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{redemption.codigo}</strong>
                      <Pill tone={redemption.status === "resgatado" ? "green" : redemption.status === "cancelado" ? "dark" : "red"}>{redemption.status}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{redemption.cliente} - {redemption.placa} - {redemption.premio} - {redemption.data}</p>
                    <form action="/api/admin/redemptions" method="post" className="mt-3 grid gap-2">
                      <input type="hidden" name="id" value={redemption.id} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <select name="status" defaultValue={redemption.status} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold">
                          <option value="pendente">pendente</option>
                          <option value="resgatado">resgatado</option>
                          <option value="cancelado">cancelado</option>
                        </select>
                        <label className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 text-sm font-bold">
                          <input name="placaConferida" type="checkbox" defaultChecked={redemption.placaConferida} className="accent-brand-red" />
                          Placa conferida
                        </label>
                      </div>
                      <Input name="observacao" placeholder="Observacao do resgate" defaultValue={redemption.observacao || ""} />
                      <label className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-brand-red">
                        <input name="confirmDelete" type="checkbox" className="accent-brand-red" />
                        Confirmar exclusao deste resgate
                      </label>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Button type="submit">Salvar status</Button>
                        <a href={`/resgate/${redemption.codigo}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-950">Conferir premio</a>
                        <Button type="submit" name="action" value="delete" variant="dark">
                          <Trash2 size={16} />
                          Excluir
                        </Button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section id="configuracoes" className="mt-6 grid gap-4 xl:grid-cols-3">
            <Card>
              <h2 className="text-xl font-black">Programa de fidelidade</h2>
              <div className="mt-3 grid gap-2">
                {loyaltyLevels.map((level) => (
                  <div key={level.nivel} className="rounded-lg bg-zinc-50 p-3 text-sm">
                    <strong>{level.nivel}</strong>
                    <p className="text-zinc-600">A partir de {formatCurrency(level.gastoMinimo)} ou {level.visitas} visitas.</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-xl font-black">WhatsApp e Google</h2>
              <form action="/api/admin/settings" method="post" className="mt-3 grid gap-3">
                <div><FieldLabel>Nome da oficina</FieldLabel><Input name="nome" defaultValue={companySettings.nome} /></div>
                <div><FieldLabel>Numero WhatsApp</FieldLabel><Input name="whatsapp" defaultValue={companySettings.whatsapp} /></div>
                <div><FieldLabel>Endereco</FieldLabel><Input name="endereco" defaultValue={companySettings.endereco} /></div>
                <div><FieldLabel>Grupo VIP</FieldLabel><Input name="vipGroupUrl" defaultValue={companySettings.vipGroupUrl} /></div>
                <div><FieldLabel>Link publico HTTPS</FieldLabel><Input name="publicSiteUrl" defaultValue={companySettings.publicSiteUrl || ""} placeholder="https://seudominio.com.br" /></div>
                <div><FieldLabel>Google Maps</FieldLabel><Input name="googleMapsUrl" defaultValue={companySettings.googleMapsUrl} /></div>
                <div><FieldLabel>Google Reviews</FieldLabel><Input name="googleReviewsUrl" defaultValue={companySettings.googleReviewsUrl} /></div>
                <div><FieldLabel>Mensagem padrao</FieldLabel><Textarea name="defaultWhatsappMessage" defaultValue={companySettings.defaultWhatsappMessage} /></div>
                <div><FieldLabel>Termos basicos</FieldLabel><Textarea name="terms" defaultValue={state.legalTexts?.terms || ""} /></div>
                <div><FieldLabel>Privacidade basica</FieldLabel><Textarea name="privacy" defaultValue={state.legalTexts?.privacy || ""} /></div>
                <div><FieldLabel>Regulamento basico</FieldLabel><Textarea name="rules" defaultValue={state.legalTexts?.rules || ""} /></div>
                <Button type="submit">Salvar configuracoes</Button>
              </form>
            </Card>
            <Card>
              <h2 className="text-xl font-black">Seguranca e permissoes</h2>
              <div className="mt-3 grid gap-2 text-sm text-zinc-700">
                <p><strong>Administrador:</strong> acesso total.</p>
                <p><strong>Gerente:</strong> aprova agenda, ve clientes, premios e resgates.</p>
                <p><strong>Atendente:</strong> consulta cliente/premio e marca resgate.</p>
                <p className="rounded-lg bg-red-50 p-3 text-brand-red">Supabase Auth, RLS, logs, rate limit e validacoes devem estar ativos antes da producao.</p>
              </div>
            </Card>
          </section>
        </div>
      </section>
    </main>
  );
}

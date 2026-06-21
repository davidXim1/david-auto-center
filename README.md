# David Auto Center Club

Plataforma web premium, mobile-first, para captacao de clientes, roleta da sorte, clube de beneficios, indicacoes, fidelidade, agendamentos com aprovacao, WhatsApp marketing, carteira de clientes e relatorios administrativos.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth + PostgreSQL
- Vercel

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis:

```bash
cp .env.example .env.local
```

3. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://club.davidautocenter.com.br
ADMIN_LOGIN=DAVIDAUTOCENTER
ADMIN_PASSWORD=troque-esta-senha-forte
AUTH_SECRET=troque-por-um-segredo-com-pelo-menos-32-caracteres
```

4. Rode:

```bash
npm run dev
```

## Estrutura de pastas

- `app/`: rotas Next.js.
- `components/`: componentes visuais, roleta, marca e painel.
- `lib/`: configuracoes, tipos, validadores, Supabase e motor de premios.
- `public/brand/`: logo, fachada e imagens substituiveis.
- `supabase/schema.sql`: banco, RLS, logs, estoque e resgates.
- `docs/`: manuais e guias operacionais.

## Rotas principais

- `/`: pagina inicial premium.
- `/participar`: cadastro, aceite LGPD e roleta.
- `/login`: entrada do administrador.
- `/admin`: painel administrativo protegido por login.
- `/termos`, `/privacidade`, `/regulamento`: documentos editaveis.
- `/ref/[code]`: entrada por indicacao.
- `/resgate/[codigo]`: comprovante digital do premio.

## Login administrativo local

Para testar agora no ambiente local, use:

- Login: `DAVIDAUTOCENTER`
- Senha: `CENTERAUTO1`

Essas credenciais estao em `.env.local`, arquivo ignorado pelo Git. Antes de publicar na Vercel, troque `ADMIN_LOGIN`, `ADMIN_PASSWORD` e `AUTH_SECRET` nas variaveis de ambiente do projeto.

O painel `/admin` redireciona automaticamente para `/login` quando nao existe sessao valida. A sessao usa cookie HTTP-only assinado e expira em 8 horas.

## Banco local funcional

Enquanto as chaves do Supabase nao forem configuradas, o sistema usa um banco local em `data/db.json`. Esse arquivo e criado automaticamente no primeiro acesso e guarda:

- clientes cadastrados;
- veiculos;
- participacoes na roleta;
- codigos de premio;
- estoque dos premios;
- resgates;
- agendamentos;
- alteracoes feitas no painel.

Esse modo serve para uso local e testes reais na oficina. Para publicar na Vercel e usar com varios computadores/celulares ao mesmo tempo, conecte o Supabase.

## Hospedagem gratis permanente

O caminho gratis recomendado e:

- Vercel gratis para gerar um link fixo com HTTPS.
- Supabase gratis para salvar dados online.

Quando `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estiverem configuradas, o sistema usa a tabela `app_state` no Supabase em vez de depender de escrita no `data/db.json`. Assim premios, clientes, participacoes, resgates e configuracoes continuam salvos online.

Veja o passo a passo em `docs/deploy-gratis-vercel-supabase.md`.

Para a roleta funcionar, a campanha precisa ter pelo menos um premio com:

- status `ativo`;
- estoque maior que zero;
- probabilidade maior que zero.

Se todos os premios forem excluidos, crie um novo em `/admin`, na area `Premios`.

## Fluxo do cliente

O cliente nao tem login nem senha nesta versao. Ele entra pelo link publico, preenche os dados, clica no grupo VIP, gira a roleta e recebe o comprovante na hora.

## Excluir cliente

No painel `/admin`, em `Clientes`, existe o botao `Excluir`. Para evitar erro, e obrigatorio marcar `Confirmar` antes de excluir.

Ao excluir cliente, o sistema remove:

- cliente;
- veiculos vinculados;
- participacoes;
- resgates;
- agendamentos da placa;
- logs da exclusao ficam registrados.

## Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute `supabase/schema.sql`.
4. Ative Auth por email/senha.
5. Crie usuarios administrativos em Auth.
6. Insira o perfil do primeiro administrador:

```sql
insert into public.profiles (id, nome, role)
values ('UUID_DO_USUARIO_AUTH', 'David Auto Center', 'Administrador');
```

## Deploy na Vercel

1. Suba o projeto para um repositorio Git.
2. Importe na Vercel.
3. Configure as variaveis de ambiente.
4. Aponte o dominio `club.davidautocenter.com.br` ou `roleta.davidautocenter.com.br`.
5. Rode o build `npm run build`.

## Observacao importante

Esta entrega inclui a base funcional e configuravel do produto. Para producao real, conecte as telas de administracao ao Supabase com operacoes CRUD, ative RLS em todos os fluxos, configure rate limit em middleware/edge e substitua os placeholders por logo e fachada oficiais.

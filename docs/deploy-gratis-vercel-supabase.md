# Deploy gratis: Vercel + Supabase

Este projeto agora esta preparado para funcionar de duas formas:

- Local: usa `data/db.json`.
- Online: usa a tabela `app_state` no Supabase quando `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estiverem configuradas.

## 1. Criar Supabase gratis

1. Acesse `https://supabase.com`.
2. Crie um projeto gratis.
3. Abra **SQL Editor**.
4. Copie e execute todo o arquivo `supabase/schema.sql`.
5. Va em **Project Settings > API** e copie:
   - Project URL;
   - anon public key;
   - service_role key.

## 2. Criar Vercel gratis

1. Acesse `https://vercel.com`.
2. Conecte com GitHub.
3. Importe o repositorio do projeto.
4. Configure as variaveis:

```env
NEXT_PUBLIC_SUPABASE_URL=URL_DO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_DO_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_DO_SUPABASE
NEXT_PUBLIC_SITE_URL=https://SEU-PROJETO.vercel.app
ADMIN_LOGIN=DAVIDAUTOCENTER
ADMIN_PASSWORD=CENTERAUTO1
AUTH_SECRET=coloque-um-texto-grande-com-mais-de-32-caracteres
```

5. Clique em **Deploy**.

## 3. Configurar link publico no painel

Depois do deploy, entre no admin:

```text
https://SEU-PROJETO.vercel.app/login
```

Em **Configuracoes > Link publico HTTPS**, coloque:

```text
https://SEU-PROJETO.vercel.app
```

Salve. O QR Code, texto de WhatsApp e artes passam a usar:

```text
https://SEU-PROJETO.vercel.app/participar
```

## Observacao

O dominio gratis da Vercel e permanente enquanto sua conta/projeto existirem. Um dominio proprio `.com.br` separado continua sendo pago.

# Manual do Administrador

## Primeiro acesso

1. Entre em `/login`.
2. Use o login e senha do administrador.
3. Apos entrar, o sistema abre `/admin`.
4. Confirme se seu usuario tem perfil `Administrador`.
5. Cadastre os dados da empresa, WhatsApp, links do Google e grupo VIP.
6. Substitua logo e foto da fachada.

Credenciais locais de teste:

- Login: `DAVIDAUTOCENTER`
- Senha: `CENTERAUTO1`

Troque essas credenciais antes de publicar.

## Uso inicial sem Supabase

O sistema salva os dados em `data/db.json` enquanto o Supabase nao estiver conectado. Voce ja pode testar cadastro, roleta, bloqueio por placa/telefone, estoque de premios, resgates e edicao de campanha/premios no painel.

Para uso publicado na internet, conecte o Supabase para que os dados fiquem em banco online.

## Acesso do cliente

O cliente nao tem login nem senha nesta versao. Ele participa pelo link publico, entra no grupo VIP, gira a roleta e ve o comprovante logo apos o sorteio.

## Excluir cliente

1. Abra `/admin`.
2. Va em `Clientes`.
3. Localize o cliente.
4. Marque `Confirmar`.
5. Clique em `Excluir`.

A exclusao remove cliente, veiculos, participacoes, resgates e agendamentos da placa. Use com cuidado.

## Criar campanha

1. Abra `Campanhas`.
2. Informe nome, descricao, datas, horarios e status.
3. Defina limite de participantes e giros.
4. Marque se havera bloqueio por placa e telefone.
5. Escolha os campos obrigatorios.
6. Configure grupo VIP como obrigatorio, opcional ou desativado.
7. Salve e gere o QR Code.

## Criar premios

1. Abra `Premios`.
2. Clique em `Novo premio`.
3. Informe nome, categoria, descricao, valor estimado e imagem.
4. Defina estoque, probabilidade, validade e observacoes.
5. Para premios premium, configure limite por tempo.

## Resgates

1. Abra `Resgates`.
2. Busque por codigo, telefone ou placa.
3. Confira a placa do veiculo presente na oficina.
4. Clique em `Marcar como resgatado`.
5. Registre observacao e usuario responsavel.

## Agendamentos

O cliente apenas solicita. Administrador ou gerente aprova, recusa, cancela ou conclui. Toda aprovacao deve registrar usuario, data, hora e observacoes.

## Indicacoes e fidelidade

Cada cliente recebe codigo unico e link exclusivo. O painel mostra ranking mensal, anual e geral. Niveis VIP sao calculados por gasto, visitas, servicos, campanhas e indicacoes.

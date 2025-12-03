# Guia Rápido: Deploy no Railway

Este guia fornece instruções passo a passo para fazer deploy do Telegram Monetag Ad Tracker no Railway.

## Pré-requisitos

- Conta no Railway (https://railway.app)
- Conta no GitHub (para conectar o repositório)
- Conta no Monetag com zona de anúncios configurada

## Passo 1: Preparar o Repositório

1. Crie um repositório no GitHub e faça push do código:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/telegram-monetag-tracker.git
git push -u origin main
```

## Passo 2: Criar Projeto no Railway

1. Acesse https://railway.app e faça login
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize o Railway a acessar seus repositórios
5. Selecione o repositório `telegram-monetag-tracker`

## Passo 3: Adicionar Banco de Dados MySQL

1. No projeto Railway, clique em "New"
2. Selecione "Database"
3. Escolha "Add MySQL"
4. O Railway criará automaticamente uma instância MySQL
5. A variável `DATABASE_URL` será configurada automaticamente

## Passo 4: Configurar Variáveis de Ambiente

As seguintes variáveis são injetadas automaticamente pelo sistema Manus:

- `DATABASE_URL` (fornecida pelo Railway MySQL)
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `OWNER_OPEN_ID`
- `OWNER_NAME`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_APP_ID`
- `VITE_APP_LOGO`
- `VITE_APP_TITLE`
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`

**Não é necessário configurar manualmente nenhuma variável de ambiente.**

## Passo 5: Configurar Build e Start

O Railway detecta automaticamente o projeto Node.js e usa os scripts do `package.json`.

Certifique-se de que seu `package.json` contém:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "pnpm db:push && NODE_ENV=production node dist/index.js"
  }
}
```

**Importante:** O comando `db:push` está no script `start`, não no `build`. Isso evita problemas de conexão com o banco de dados durante a fase de build.

## Passo 6: Criar nixpacks.toml (Opcional)

Para maior controle sobre o processo de build, crie um arquivo `nixpacks.toml` na raiz do projeto:

```toml
[phases.setup]
nixPkgs = ["nodejs-22_x", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "pnpm start"
```

## Passo 7: Deploy

1. Faça commit das alterações:

```bash
git add .
git commit -m "Configure Railway deployment"
git push
```

2. O Railway iniciará automaticamente o build e deploy
3. Aguarde o processo de build completar (3-5 minutos)
4. O Railway fornecerá uma URL pública (ex: `https://telegram-monetag-tracker-production.up.railway.app`)

## Passo 8: Verificar Deploy

1. Acesse a URL fornecida pelo Railway
2. Verifique se a página inicial carrega corretamente
3. Teste o endpoint de health check: `https://sua-url.railway.app/api/monetag/health`
4. Faça login através do sistema Manus OAuth
5. Acesse o dashboard em `/dashboard`

## Passo 9: Configurar Postback no Monetag

1. Acesse sua conta no Monetag
2. Navegue até as configurações da zona de anúncios
3. Configure a URL de postback:

```
https://sua-url.railway.app/api/monetag/postback?event_type={event_type}&zone_id={zone_id}&click_id={click_id}&sub_id={sub_id}&revenue={revenue}&currency={currency}&country={country}&ip={ip}
```

4. Substitua `sua-url.railway.app` pela URL real fornecida pelo Railway
5. Configure os parâmetros de acordo com a documentação do Monetag
6. Salve as configurações

## Passo 10: Configurar Telegram Mini App

1. Abra o Telegram e procure por @BotFather
2. Crie um novo bot ou use um existente
3. Use o comando `/newapp` para criar um Mini App
4. Configure a URL do Web App:

```
https://sua-url.railway.app/mini-app
```

5. Configure nome, descrição e ícone do Mini App
6. Publique o Mini App

## Verificação Final

Execute os seguintes testes para garantir que tudo está funcionando:

### 1. Teste o Health Check

```bash
curl https://sua-url.railway.app/api/monetag/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Postback endpoint is healthy",
  "timestamp": "2024-12-02T17:30:00.000Z"
}
```

### 2. Teste o Postback Manualmente

```bash
curl "https://sua-url.railway.app/api/monetag/postback?event_type=impression&zone_id=10269314&sub_id=test_user_123"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Event recorded"
}
```

### 3. Verifique o Dashboard

1. Acesse `https://sua-url.railway.app/dashboard`
2. Faça login através do Manus OAuth
3. Verifique se o evento de teste aparece na tabela de eventos recentes

### 4. Teste o Mini App

1. Abra o Mini App no Telegram
2. Verifique se a interface carrega corretamente
3. Clique em "Mostrar Anúncio"
4. Verifique se o evento aparece na seção de eventos recentes

## Troubleshooting

### Build Falha com Erro de Banco de Dados

**Problema:** O build falha com erro "Cannot connect to database"

**Solução:** Certifique-se de que `db:push` está no script `start`, não no script `build`.

### Postback Não Funciona

**Problema:** Eventos não aparecem no dashboard quando enviados pelo Monetag

**Solução:**
1. Verifique se a URL de postback está correta no painel do Monetag
2. Certifique-se de usar HTTPS
3. Teste o endpoint manualmente com curl
4. Verifique os logs do Railway para erros

### Mini App Não Detecta Telegram

**Problema:** O sistema não detecta o contexto do Telegram

**Solução:**
1. Certifique-se de que está acessando através do Telegram, não de um navegador
2. Verifique se a URL do Web App está configurada corretamente no BotFather
3. Teste com um usuário diferente do Telegram

### Variáveis de Ambiente Faltando

**Problema:** Erro "Environment variable not found"

**Solução:** As variáveis são injetadas automaticamente pelo sistema Manus. Se estiver testando localmente, crie um arquivo `.env` com as variáveis necessárias.

## Monitoramento

### Logs do Railway

1. Acesse o dashboard do Railway
2. Clique no seu serviço
3. Vá para a aba "Logs"
4. Monitore logs em tempo real

### Métricas do Railway

1. Na aba "Metrics" você pode ver:
   - Uso de CPU
   - Uso de memória
   - Requisições por segundo
   - Tempo de resposta

### Alertas

Configure alertas no Railway para ser notificado sobre:
- Deploy com falha
- Uso excessivo de recursos
- Downtime do serviço

## Manutenção

### Atualizar o Código

1. Faça alterações no código localmente
2. Teste localmente com `pnpm dev`
3. Commit e push para o GitHub
4. O Railway fará deploy automaticamente

### Backup do Banco de Dados

1. Acesse o serviço MySQL no Railway
2. Vá para "Data"
3. Use a opção de export para fazer backup
4. Agende backups regulares

### Rollback

Se algo der errado após um deploy:

1. Acesse o dashboard do Railway
2. Vá para "Deployments"
3. Encontre o deploy anterior que funcionava
4. Clique em "Redeploy"

## Custos

O Railway oferece um plano gratuito com limitações:
- $5 de crédito grátis por mês
- Após isso, paga-se por uso

Custos estimados para tráfego médio:
- Serviço web: ~$5-10/mês
- MySQL: ~$5-10/mês
- Total: ~$10-20/mês

Para otimizar custos:
- Use sleep mode para ambientes de desenvolvimento
- Configure auto-scaling apropriadamente
- Monitore uso de recursos regularmente

## Suporte

Para problemas específicos do Railway:
- Documentação: https://docs.railway.app
- Discord: https://discord.gg/railway
- Twitter: @Railway

Para problemas do sistema:
- Verifique a documentação em `DOCUMENTATION.md`
- Revise os logs do servidor
- Execute os testes com `pnpm test`

---

**Última atualização:** Dezembro 2024

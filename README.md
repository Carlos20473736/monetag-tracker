# Telegram Monetag Ad Tracker

Sistema completo de rastreamento de anúncios Monetag para Telegram Mini Apps com dashboard analítico, API de postback e banco de dados MySQL.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Tests](https://img.shields.io/badge/tests-13%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Características

- **Rastreamento em Tempo Real**: Registre impressões e cliques instantaneamente
- **API de Postback**: Receba notificações automáticas do Monetag via webhook
- **Dashboard Analítico**: Visualize estatísticas detalhadas com gráficos e tabelas
- **Telegram Mini App**: Interface otimizada para Telegram com detecção automática de usuários
- **Type-Safe**: API tRPC com tipos compartilhados entre frontend e backend
- **Banco de Dados MySQL**: Armazenamento confiável e escalável
- **Testes Abrangentes**: 13 testes cobrindo API e banco de dados

## 📋 Pré-requisitos

- Node.js 22+
- pnpm
- MySQL 8+
- Conta no Monetag
- Telegram Bot (para Mini App)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/telegram-monetag-tracker.git
cd telegram-monetag-tracker
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o banco de dados

Crie um banco de dados MySQL e configure a variável de ambiente:

```bash
export DATABASE_URL="mysql://user:password@localhost:3306/telegram_ads"
```

### 4. Execute as migrações

```bash
pnpm db:push
```

### 5. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## 📦 Deploy no Railway

Para instruções detalhadas de deploy no Railway, consulte [RAILWAY_SETUP.md](./RAILWAY_SETUP.md).

**Resumo rápido:**

1. Crie um projeto no Railway
2. Conecte seu repositório GitHub
3. Adicione um banco de dados MySQL
4. As variáveis de ambiente são injetadas automaticamente
5. O deploy acontece automaticamente ao fazer push

## 📖 Documentação

Documentação completa disponível em [DOCUMENTATION.md](./DOCUMENTATION.md), incluindo:

- Arquitetura do sistema
- Estrutura de dados
- Fluxo de dados
- Configuração do Monetag
- Uso do sistema
- Solução de problemas
- Testes
- Extensões futuras

## 🎯 Uso Rápido

### Mini App

Acesse o Mini App através do Telegram:

1. Configure o Web App URL no BotFather: `https://seu-dominio/mini-app`
2. Abra o Mini App no Telegram
3. O sistema detecta automaticamente seu Telegram ID
4. Clique em "Mostrar Anúncio" para exibir anúncios

### Dashboard

Acesse o dashboard administrativo:

1. Navegue para `https://seu-dominio/dashboard`
2. Faça login através do Manus OAuth
3. Visualize estatísticas globais
4. Monitore eventos recentes
5. Gerencie zonas de anúncios

### API de Postback

Configure no painel do Monetag:

```
https://seu-dominio/api/monetag/postback?event_type={event_type}&zone_id={zone_id}&click_id={click_id}&sub_id={sub_id}&revenue={revenue}&currency={currency}&country={country}&ip={ip}
```

## 🧪 Testes

Execute todos os testes:

```bash
pnpm test
```

Execute testes em modo watch:

```bash
pnpm test --watch
```

Gere relatório de cobertura:

```bash
pnpm test --coverage
```

## 📊 Estrutura do Projeto

```
telegram-monetag-tracker/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── Home.tsx    # Landing page
│   │   │   ├── MiniApp.tsx # Telegram Mini App
│   │   │   └── Dashboard.tsx # Dashboard administrativo
│   │   ├── components/     # Componentes reutilizáveis
│   │   └── lib/           # Utilitários e configurações
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # Rotas tRPC
│   ├── db.ts              # Funções de banco de dados
│   ├── postback.ts        # Endpoint de postback
│   └── _core/             # Configurações do servidor
├── drizzle/               # Schema e migrações do banco
│   └── schema.ts          # Definição das tabelas
├── DOCUMENTATION.md       # Documentação completa
├── RAILWAY_SETUP.md       # Guia de deploy no Railway
└── README.md             # Este arquivo
```

## 🔧 Tecnologias

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC Client
- Wouter (routing)
- shadcn/ui (componentes)

### Backend
- Node.js 22
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL 8

### DevOps
- Vitest (testes)
- Railway (hospedagem)
- GitHub Actions (CI/CD)

## 🔐 Variáveis de Ambiente

As seguintes variáveis são injetadas automaticamente pelo sistema Manus:

- `DATABASE_URL` - String de conexão MySQL
- `JWT_SECRET` - Segredo para assinatura de tokens
- `OAUTH_SERVER_URL` - URL do servidor OAuth
- `VITE_OAUTH_PORTAL_URL` - URL do portal de login
- `OWNER_OPEN_ID` - ID do proprietário
- `OWNER_NAME` - Nome do proprietário
- `BUILT_IN_FORGE_API_URL` - URL da API Manus
- `BUILT_IN_FORGE_API_KEY` - Chave da API Manus (backend)
- `VITE_FRONTEND_FORGE_API_KEY` - Chave da API Manus (frontend)
- `VITE_FRONTEND_FORGE_API_URL` - URL da API Manus (frontend)
- `VITE_APP_ID` - ID da aplicação
- `VITE_APP_LOGO` - Logo da aplicação
- `VITE_APP_TITLE` - Título da aplicação
- `VITE_ANALYTICS_ENDPOINT` - Endpoint de analytics
- `VITE_ANALYTICS_WEBSITE_ID` - ID do website para analytics

**Não é necessário configurar manualmente nenhuma variável de ambiente.**

## 📈 Estatísticas

O sistema rastreia as seguintes métricas:

- **Total de Impressões**: Número total de vezes que anúncios foram exibidos
- **Total de Cliques**: Número total de cliques em anúncios
- **Usuários Únicos**: Número de usuários únicos que interagiram com anúncios
- **CTR (Click-Through Rate)**: Taxa de cliques calculada como (cliques / impressões) × 100
- **Receita**: Valor total de receita gerada (quando fornecido pelo Monetag)

## 🐛 Solução de Problemas

### SDK do Monetag não carrega

- Verifique se o `zoneId` está correto
- Desative bloqueadores de anúncios
- Verifique o console do navegador para erros

### Eventos não aparecem no dashboard

- Verifique a conexão com o banco de dados
- Execute `pnpm db:push` novamente
- Verifique os logs do servidor

### Postback não funciona

- Verifique a URL de postback no painel do Monetag
- Certifique-se de usar HTTPS
- Teste o endpoint manualmente com curl

Para mais soluções, consulte [DOCUMENTATION.md](./DOCUMENTATION.md#solução-de-problemas).

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Manus AI** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- Monetag pela plataforma de monetização
- Telegram pela API de Mini Apps
- Railway pela hospedagem simplificada
- Comunidade open source pelas ferramentas incríveis

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou consulte a documentação completa.

---

**Desenvolvido com ❤️ usando Manus AI**

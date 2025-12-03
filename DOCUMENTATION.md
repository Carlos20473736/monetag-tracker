# Telegram Monetag Ad Tracker - Documentação Completa

## Visão Geral

O **Telegram Monetag Ad Tracker** é um sistema completo de rastreamento de anúncios desenvolvido especificamente para Telegram Mini Apps integrados com a plataforma Monetag. Este sistema permite monitorar impressões, cliques e receita de anúncios em tempo real, fornecendo um dashboard analítico detalhado e uma API robusta de postback para receber notificações automáticas do Monetag.

### Características Principais

O sistema foi projetado com uma arquitetura moderna e escalável, utilizando tecnologias de ponta para garantir desempenho, confiabilidade e facilidade de manutenção. A aplicação é construída sobre uma stack full-stack TypeScript, com React 19 no frontend, Express 4 no backend, tRPC 11 para comunicação type-safe entre cliente e servidor, e MySQL como banco de dados relacional.

A integração com o Telegram Mini App permite identificação automática de usuários através do Telegram WebApp API, eliminando a necessidade de sistemas de autenticação separados para usuários finais. O sistema detecta automaticamente o contexto do Telegram e extrai informações do usuário, incluindo ID único, nome e username, garantindo rastreamento preciso por usuário.

A integração com o SDK do Monetag é feita de forma transparente, carregando dinamicamente o script de anúncios e registrando eventos tanto no frontend quanto através de webhooks de postback. O sistema suporta múltiplas zonas de anúncios simultaneamente, permitindo gerenciar diferentes campanhas e formatos de anúncios em uma única plataforma.

## Arquitetura do Sistema

### Stack Tecnológica

A aplicação utiliza uma stack moderna e bem estabelecida no ecossistema JavaScript/TypeScript. No frontend, React 19 fornece a base para interfaces de usuário reativas e performáticas, enquanto Tailwind CSS 4 oferece um sistema de design utility-first altamente customizável. O Wouter é utilizado para roteamento client-side, proporcionando navegação fluida sem recarregamentos de página.

No backend, Express 4 serve como framework web, fornecendo uma API RESTful para o endpoint de postback e servindo como base para a integração tRPC. O tRPC 11 estabelece contratos type-safe entre cliente e servidor, eliminando a necessidade de manutenção manual de tipos e reduzindo drasticamente bugs relacionados a incompatibilidades de API.

O banco de dados MySQL foi escolhido por sua confiabilidade, maturidade e excelente suporte a transações ACID. O Drizzle ORM fornece uma camada de abstração type-safe sobre o MySQL, permitindo queries complexas com autocomplete completo e validação de tipos em tempo de compilação.

### Estrutura de Dados

O esquema do banco de dados foi projetado para capturar todas as informações relevantes sobre eventos de anúncios, mantendo flexibilidade para expansão futura. A tabela `users` armazena informações de usuários autenticados no sistema, incluindo campos específicos do Telegram como `telegramId` e `telegramUsername`.

A tabela `ad_zones` gerencia configurações de zonas de anúncios do Monetag, permitindo ativar ou desativar zonas individualmente e armazenar metadados como nome e tipo da zona. Cada zona possui um `zoneId` único fornecido pelo Monetag, que é usado como referência em todos os eventos.

A tabela `ad_events` é o coração do sistema de rastreamento, registrando cada impressão e clique de anúncio com timestamps precisos. Cada evento inclui o tipo (`impression` ou `click`), identificação do usuário (`telegramId`), zona do anúncio (`zoneId`), e dados adicionais do postback como `clickId`, `revenue`, `currency` e informações de geolocalização.

### Fluxo de Dados

O fluxo de dados no sistema segue um padrão bem definido que garante rastreamento preciso e confiável. Quando um usuário acessa o Mini App através do Telegram, o frontend detecta automaticamente o contexto do Telegram WebApp e extrai o ID do usuário. O SDK do Monetag é então carregado dinamicamente com o ID da zona configurado.

Quando um anúncio é exibido, dois eventos paralelos ocorrem. Primeiro, o frontend registra uma impressão através da API tRPC, enviando o `telegramId`, `zoneId` e `userAgent` para o backend. Simultaneamente, o SDK do Monetag pode enviar uma notificação para o endpoint de postback configurado no painel do Monetag.

Quando um usuário clica em um anúncio, o mesmo processo ocorre para eventos de clique. O Monetag envia um postback contendo informações adicionais como `clickId`, `revenue` e `currency`, que são armazenados no banco de dados para análise posterior.

O dashboard consome esses dados através de queries tRPC otimizadas, agregando estatísticas em tempo real e exibindo eventos recentes. As queries utilizam índices do banco de dados para garantir performance mesmo com grandes volumes de dados.

## Configuração e Deploy

### Preparação do Ambiente Local

Para desenvolvimento local, é necessário ter Node.js 22+ e pnpm instalados. Clone o repositório e instale as dependências executando `pnpm install` na raiz do projeto. Configure as variáveis de ambiente criando um arquivo `.env` baseado no template fornecido.

A variável `DATABASE_URL` deve apontar para uma instância MySQL local ou remota. Para desenvolvimento local, você pode usar Docker para executar um container MySQL com o comando `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=telegram_ads mysql:8`.

Após configurar o banco de dados, execute `pnpm db:push` para criar as tabelas necessárias. Este comando gera e aplica migrações automaticamente usando o Drizzle Kit. Em seguida, inicie o servidor de desenvolvimento com `pnpm dev`, que iniciará tanto o backend Express quanto o servidor Vite para hot-reload do frontend.

### Deploy no Railway

O Railway é uma plataforma de hospedagem moderna que simplifica o deploy de aplicações full-stack. Para fazer deploy do Telegram Monetag Ad Tracker no Railway, siga os passos abaixo.

Primeiro, crie uma conta no Railway e instale o Railway CLI executando `npm install -g @railway/cli`. Faça login com `railway login` e crie um novo projeto com `railway init`. O Railway detectará automaticamente que se trata de um projeto Node.js.

Adicione um serviço MySQL ao projeto através do dashboard do Railway. Vá em "New" → "Database" → "Add MySQL". O Railway criará automaticamente uma instância MySQL e fornecerá a variável `DATABASE_URL` com a string de conexão completa.

Configure as variáveis de ambiente no Railway através do dashboard ou CLI. As variáveis essenciais incluem `DATABASE_URL` (fornecida automaticamente pelo Railway), `JWT_SECRET` (gere uma string aleatória segura), e as variáveis de OAuth do Manus que são injetadas automaticamente pelo sistema.

Modifique o `package.json` para garantir que o comando `db:push` seja executado durante o startup, não durante o build. Isso evita problemas de conexão com o banco de dados durante a fase de build. O script `start` deve executar `pnpm db:push && node dist/index.js`.

Crie um arquivo `nixpacks.toml` na raiz do projeto para customizar o processo de build no Railway:

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

Faça commit das alterações e execute `railway up` para fazer deploy. O Railway executará o build, aplicará as migrações do banco de dados e iniciará o servidor. Após o deploy, o Railway fornecerá uma URL pública para acessar a aplicação.

### Configuração do Monetag

Para que o sistema de postback funcione corretamente, é necessário configurar a URL de postback no painel do Monetag. Acesse sua conta no Monetag e navegue até as configurações da zona de anúncios que você deseja rastrear.

Na seção de postback ou webhook, configure a URL no formato `https://seu-dominio.railway.app/api/monetag/postback`. Certifique-se de usar HTTPS, pois o Monetag requer conexões seguras para postbacks.

Configure os parâmetros do postback para incluir todas as informações relevantes. Os parâmetros recomendados são:

- `event_type`: Tipo do evento (impression ou click)
- `zone_id`: ID da zona do anúncio
- `click_id`: Identificador único do clique
- `sub_id`: ID customizado (use o telegram_id do usuário)
- `revenue`: Valor da receita
- `currency`: Moeda da receita
- `country`: Código do país
- `ip`: Endereço IP do usuário

O sistema aceita tanto requisições GET quanto POST no endpoint de postback, proporcionando flexibilidade na configuração do Monetag.

## Uso do Sistema

### Mini App do Telegram

O Mini App é a interface principal para usuários finais e deve ser acessado através do Telegram. Para configurar o Mini App no Telegram, você precisa criar um bot usando o BotFather e configurar o Web App URL para apontar para `https://seu-dominio.railway.app/mini-app`.

Quando um usuário acessa o Mini App, a interface detecta automaticamente o contexto do Telegram e exibe informações personalizadas. A tela principal mostra estatísticas globais de impressões, cliques e usuários únicos, proporcionando uma visão geral do desempenho dos anúncios.

A área de anúncios contém um botão "Mostrar Anúncio" que, quando clicado, aciona o SDK do Monetag para exibir um anúncio. O sistema registra automaticamente tanto a impressão quanto o clique, associando-os ao `telegramId` do usuário.

A seção de eventos recentes mostra os últimos 10 eventos do usuário atual, permitindo que ele veja seu próprio histórico de interações com anúncios. Cada evento exibe o tipo (impressão ou clique) e o timestamp formatado em português brasileiro.

### Dashboard Administrativo

O dashboard é acessível através da rota `/dashboard` e requer autenticação através do sistema Manus OAuth. Esta interface é projetada para administradores e proprietários do sistema que precisam monitorar o desempenho geral dos anúncios.

A tela principal do dashboard exibe quatro cards de estatísticas: total de impressões, total de cliques, usuários únicos e CTR (Click-Through Rate). O CTR é calculado automaticamente como a porcentagem de cliques em relação às impressões, fornecendo uma métrica importante de engajamento.

A seção de zonas de anúncios lista todas as zonas configuradas no sistema, mostrando o status (ativa ou inativa), nome e tipo de cada zona. Administradores podem visualizar rapidamente quais zonas estão gerando eventos.

A tabela de eventos recentes mostra os últimos 50 eventos de todos os usuários, com colunas para tipo de evento, telegram ID, zone ID, click ID, país e data/hora. Esta tabela é útil para debugging e monitoramento em tempo real do sistema.

O dashboard possui auto-refresh configurado para atualizar estatísticas a cada 30 segundos e eventos a cada 30 segundos, garantindo que as informações exibidas estejam sempre atualizadas sem necessidade de recarregar a página manualmente.

### API de Postback

O endpoint de postback está disponível em `/api/monetag/postback` e aceita tanto requisições GET quanto POST. Este endpoint é projetado para receber notificações do Monetag quando eventos de anúncios ocorrem.

Os parâmetros aceitos incluem `event_type` (obrigatório), `zone_id` (obrigatório), `click_id`, `sub_id`, `revenue`, `currency`, `country` e `ip`. O sistema valida que `event_type` seja "impression" ou "click" e que `zone_id` esteja presente.

Quando um postback é recebido, o sistema extrai o `telegram_id` do parâmetro `sub_id` se disponível, registra o evento no banco de dados com todos os parâmetros fornecidos, e retorna uma resposta JSON indicando sucesso ou falha.

O endpoint de health check em `/api/monetag/health` pode ser usado para verificar se o sistema de postback está funcionando corretamente. Este endpoint retorna um JSON com status de sucesso e timestamp atual.

Todos os postbacks são logados no console do servidor para facilitar debugging. Em produção, é recomendado configurar um sistema de logging mais robusto como Winston ou Pino para armazenar logs persistentemente.

## Solução de Problemas

### Problemas Comuns e Soluções

**Erro: SDK do Monetag não carrega**

Este problema geralmente ocorre quando o ID da zona está incorreto ou quando há bloqueadores de anúncios ativos. Verifique que o `zoneId` no código corresponde exatamente ao ID fornecido pelo Monetag. Desative temporariamente bloqueadores de anúncios para testar. Verifique o console do navegador para mensagens de erro específicas do SDK.

**Erro: Eventos não aparecem no dashboard**

Se eventos estão sendo registrados mas não aparecem no dashboard, verifique a conexão com o banco de dados. Execute `pnpm db:push` novamente para garantir que o schema está atualizado. Verifique os logs do servidor para erros de query. Teste a API tRPC diretamente usando as ferramentas de desenvolvedor do navegador.

**Erro: Postback não está sendo recebido**

Quando postbacks do Monetag não chegam ao sistema, primeiro verifique que a URL de postback está configurada corretamente no painel do Monetag, incluindo HTTPS. Teste o endpoint manualmente com curl ou Postman para garantir que está acessível. Verifique os logs do servidor para ver se requisições estão chegando mas falhando na validação.

**Erro: Telegram WebApp não detectado**

Se o sistema não detecta o contexto do Telegram, verifique que a aplicação está sendo acessada através de um Telegram Mini App configurado corretamente, não através de um navegador comum. O objeto `window.Telegram.WebApp` só está disponível quando a página é carregada dentro do Telegram. Para testes locais, o sistema usa um fallback com ID de usuário gerado.

**Erro: Conexão com banco de dados falha durante build no Railway**

Este é um problema comum quando `db:push` é executado durante a fase de build. O banco de dados pode não estar acessível durante o build. Mova o comando `db:push` do script `build` para o script `start` no `package.json`. Isso garante que migrações são aplicadas apenas quando o servidor está iniciando, não durante o build.

### Logs e Debugging

O sistema utiliza logging extensivo para facilitar debugging. Todos os eventos importantes são logados no console com prefixos identificadores como `[Postback]`, `[Database]` e `[OAuth]`. Em desenvolvimento, os logs são coloridos e formatados para fácil leitura.

Para debugging mais avançado, você pode usar o Node.js inspector. Inicie o servidor com `node --inspect dist/index.js` e conecte o Chrome DevTools para debugging interativo com breakpoints.

O tRPC fornece ferramentas de debugging excelentes através do React Query DevTools. Adicione o componente `ReactQueryDevtools` ao seu `App.tsx` para visualizar todas as queries e mutations em tempo real, incluindo seus estados de loading, erro e dados.

Para monitorar queries do banco de dados, o Drizzle ORM suporta logging de queries SQL. Configure o logger no arquivo de conexão do banco de dados para ver todas as queries executadas, útil para otimização de performance.

## Testes

### Estrutura de Testes

O projeto utiliza Vitest como framework de testes, proporcionando uma experiência de desenvolvimento rápida e integrada com o ecossistema Vite. Os testes estão localizados em arquivos `.test.ts` adjacentes aos módulos que testam.

O arquivo `server/postback.test.ts` contém testes abrangentes para toda a API de eventos e zonas. Os testes são organizados em três suítes principais: Ad Events API, Ad Zones API e Database Functions. Cada suíte testa um aspecto específico do sistema.

Os testes utilizam um contexto mock que simula um usuário autenticado com role de admin. Isso permite testar endpoints protegidos sem necessidade de autenticação real durante os testes. O contexto inclui objetos mock para `req` e `res` que simulam requisições Express.

### Executando Testes

Para executar todos os testes, use o comando `pnpm test`. O Vitest executará todos os arquivos `.test.ts` no projeto e exibirá um relatório detalhado de sucessos e falhas. O comando executa em modo CI por padrão, rodando todos os testes uma vez e saindo.

Para desenvolvimento iterativo, use `pnpm test --watch` para executar testes em modo watch. O Vitest re-executará automaticamente testes relacionados quando arquivos são modificados, proporcionando feedback instantâneo durante o desenvolvimento.

Para executar apenas um arquivo de teste específico, use `pnpm test server/postback.test.ts`. Para executar apenas um teste específico, adicione `.only` ao describe ou it: `it.only("should record an impression event", ...)`.

### Cobertura de Testes

O projeto atual possui 13 testes que cobrem os principais fluxos do sistema. Os testes verificam criação de eventos, recuperação por diferentes critérios, cálculo de estatísticas, gerenciamento de zonas e operações de banco de dados.

Para gerar um relatório de cobertura de código, execute `pnpm test --coverage`. O Vitest gerará um relatório HTML detalhado mostrando quais linhas de código estão cobertas por testes e quais não estão.

A cobertura atual foca nas camadas de API e banco de dados. Testes de integração end-to-end e testes de componentes React podem ser adicionados no futuro para aumentar a confiança no sistema como um todo.

## Extensões e Melhorias Futuras

### Funcionalidades Sugeridas

O sistema atual fornece uma base sólida para rastreamento de anúncios, mas várias melhorias podem ser implementadas para aumentar sua utilidade e robustez. Uma funcionalidade importante seria adicionar gráficos de séries temporais no dashboard, mostrando a evolução de impressões e cliques ao longo do tempo.

Implementar filtros avançados no dashboard permitiria aos administradores analisar dados por período específico, zona de anúncio, país ou usuário. Isso facilitaria identificação de padrões e otimização de campanhas.

Adicionar notificações em tempo real quando certos thresholds são atingidos (por exemplo, quando CTR cai abaixo de um valor mínimo) ajudaria administradores a reagir rapidamente a problemas. Essas notificações poderiam ser enviadas via Telegram Bot API.

Implementar um sistema de relatórios automatizados que gera e envia relatórios diários ou semanais por email ou Telegram proporcionaria visibilidade contínua sem necessidade de acessar o dashboard manualmente.

### Otimizações de Performance

Para sistemas com alto volume de eventos, várias otimizações de performance podem ser implementadas. Adicionar índices compostos no banco de dados para queries frequentes como `(telegramId, createdAt)` e `(zoneId, createdAt)` aceleraria significativamente a recuperação de dados.

Implementar caching de estatísticas agregadas usando Redis reduziria a carga no banco de dados. Estatísticas como total de impressões e cliques poderiam ser calculadas incrementalmente e armazenadas em cache, sendo atualizadas apenas quando novos eventos ocorrem.

Utilizar processamento em batch para inserção de eventos no banco de dados, em vez de inserções individuais, aumentaria o throughput do sistema. Eventos poderiam ser acumulados em memória e inseridos em lotes a cada segundo ou quando um certo número de eventos é atingido.

Implementar paginação server-side na tabela de eventos do dashboard evitaria carregar todos os eventos de uma vez, melhorando o tempo de resposta para usuários com grandes volumes de dados.

### Segurança e Compliance

Adicionar autenticação no endpoint de postback usando um token secreto compartilhado com o Monetag garantiria que apenas requisições legítimas são processadas. O token poderia ser verificado através de um header customizado ou parâmetro de query.

Implementar rate limiting no endpoint de postback protegeria contra ataques de negação de serviço. Bibliotecas como `express-rate-limit` podem ser configuradas para limitar o número de requisições por IP ou por zona.

Adicionar logs de auditoria detalhados para todas as operações administrativas (criação de zonas, mudanças de status) proporcionaria rastreabilidade e facilitaria investigações de segurança.

Implementar anonimização de dados pessoais após um período configurável garantiria compliance com regulações de privacidade como GDPR e LGPD. Telegram IDs e endereços IP poderiam ser hash-eados ou removidos após 90 dias, mantendo apenas dados agregados.

## Conclusão

O Telegram Monetag Ad Tracker representa uma solução completa e robusta para rastreamento de anúncios em Telegram Mini Apps. Com sua arquitetura moderna, API type-safe, testes abrangentes e documentação detalhada, o sistema está pronto para uso em produção.

A integração transparente com o Telegram WebApp e o SDK do Monetag torna o sistema fácil de usar tanto para usuários finais quanto para administradores. O dashboard analítico fornece insights valiosos sobre o desempenho dos anúncios, enquanto a API de postback garante rastreamento preciso de todos os eventos.

O deploy simplificado no Railway e a configuração clara de variáveis de ambiente tornam o sistema acessível mesmo para desenvolvedores com pouca experiência em DevOps. A estrutura de código bem organizada e os testes abrangentes facilitam manutenção e extensão do sistema no futuro.

Com as melhorias sugeridas e otimizações de performance, o sistema pode escalar para suportar milhões de eventos por dia, tornando-se uma ferramenta essencial para qualquer operação de monetização através de anúncios em Telegram Mini Apps.

---

**Autor:** Manus AI  
**Data:** Dezembro 2024  
**Versão:** 1.0

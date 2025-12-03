# Telegram Monetag Ad Tracker - TODO

## Fase 1: Estrutura e Banco de Dados
- [x] Configurar esquema do banco de dados (tabelas ad_events, users, zones)
- [x] Adicionar campos necessários para rastreamento de anúncios
- [x] Executar migração do banco de dados

## Fase 2: Mini App Frontend
- [x] Criar página principal do Mini App
- [x] Integrar SDK do Monetag com script de zona
- [x] Implementar detecção do Telegram WebApp
- [x] Adicionar rastreamento de impressões no frontend
- [x] Configurar User Agent para dispositivos móveis

## Fase 3: Backend e API de Postback
- [x] Criar endpoint de postback para receber eventos do Monetag
- [x] Implementar registro de impressões no banco de dados
- [x] Implementar registro de cliques no banco de dados
- [x] Adicionar validação de telegram_id nos eventos
- [x] Criar procedimentos tRPC para consulta de eventos

## Fase 4: Dashboard de Estatísticas
- [x] Criar página de dashboard com estatísticas
- [x] Implementar visualização de impressões por usuário
- [x] Implementar visualização de cliques por usuário
- [x] Adicionar gráficos de desempenho
- [x] Criar tabela de eventos recentes

## Fase 5: Testes e Validação
- [x] Escrever testes para API de postback
- [x] Escrever testes para procedimentos tRPC
- [x] Validar integração com Monetag
- [x] Testar rastreamento end-to-end

## Fase 6: Documentação e Deploy
- [x] Criar documentação de configuração do Railway
- [x] Documentar configuração de variáveis de ambiente
- [x] Adicionar instruções de configuração do Monetag
- [x] Criar guia de troubleshooting
- [x] Preparar checkpoint final

## Correções e Melhorias
- [x] Corrigir carregamento do SDK do Monetag no Mini App
- [x] Corrigir para usar função show_ZONEID do SDK oficial
- [x] Adicionar tratamento de erros robusto para carregamento do SDK
- [x] Testar exibição de anúncios em ambiente real

## Integração SDK Telegram Oficial
- [x] Adicionar script do Telegram Web App SDK ao index.html
- [x] Atualizar código para usar SDK oficial do Telegram
- [x] Testar detecção do ambiente Telegram
- [x] Validar funcionamento em produção

## HTML Standalone para Mini App
- [x] Criar arquivo HTML standalone separado do React
- [x] Integrar com backend para registro de eventos
- [x] Adicionar funcionalidade de dashboard no HTML
- [x] Testar funcionamento completo standalone

## Adicionar Scripts Telegram ao React
- [x] Adicionar modificação de User Agent ao index.html
- [x] Adicionar simulação completa do Telegram WebApp
- [x] Testar funcionamento no projeto React

## Bug: Registro Incorreto de Cliques
- [x] Investigar por que close do anúncio está sendo contabilizado como clique
- [x] Corrigir lógica para diferenciar clique real de fechamento
- [x] Atualizar MiniApp.tsx para não registrar cliques no close
- [x] Atualizar miniapp.html para não registrar cliques no close
- [x] Testar correção em ambiente real

## Ajustar Sistema de Cliques para Postback
- [x] Analisar documentação de postbacks do Monetag
- [x] Reverter lógica de validação de click_id no frontend
- [x] Registrar impressão quando anúncio é mostrado
- [x] Deixar registro de cliques apenas via postback do Monetag
- [x] Testar fluxo completo de impressão e clique

## URL de Postback Otimizada
- [ ] Criar versão curta da URL de postback
- [ ] Testar URL curta
- [ ] Atualizar documentação

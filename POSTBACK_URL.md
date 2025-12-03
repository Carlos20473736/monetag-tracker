# URL de Postback do Monetag

## 📍 URL para Configurar no Painel do Monetag

Configure esta URL no painel do Monetag (SSP) para a zona **10269314**:

```
https://monetag-tracker-production.up.railway.app/api/monetag/postback?event_type={event_type}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&ymid={ymid}&telegram_id={telegram_id}&request_var={request_var}&click_id={ymid}&revenue={estimated_price}&reward_type={reward_event_type}
```

### 🔄 Para Ambiente de Desenvolvimento (Teste Local)

```
https://3000-i98xoduepeldworlqrdp0-900b5124.manusvm.computer/api/monetag/postback?event_type={event_type}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&ymid={ymid}&telegram_id={telegram_id}&request_var={request_var}&click_id={ymid}&revenue={estimated_price}&reward_type={reward_event_type}
```

---

## 📋 Parâmetros Explicados

| Parâmetro | Macro Monetag | Descrição |
|-----------|---------------|-----------|
| `event_type` | `{event_type}` | Tipo do evento: `impression` ou `click` |
| `zone_id` | `{zone_id}` | ID da zona principal (10269314) |
| `sub_zone_id` | `{sub_zone_id}` | ID da sub-zona que entregou o anúncio |
| `ymid` | `{ymid}` | Identificador único do evento (passado pelo SDK) |
| `telegram_id` | `{telegram_id}` | ID do usuário do Telegram (auto-coletado) |
| `request_var` | `{request_var}` | Identificador do contexto (ex: "miniapp_click") |
| `click_id` | `{ymid}` | ID único do clique (usando ymid como referência) |
| `revenue` | `{estimated_price}` | Receita estimada em USD |
| `reward_type` | `{reward_event_type}` | `valued` (pago) ou `not_valued` (não pago) |

---

## 🎯 Como Configurar

1. **Acesse o painel do Monetag**: https://monetag.com/
2. **Navegue até a zona 10269314**
3. **Encontre a seção "Postback URL" ou "Server-Side Postback"**
4. **Cole a URL acima** (substitua `SEU-DOMINIO` pelo domínio real do Railway)
5. **Salve as configurações**

---

## ✅ Como Funciona

### Fluxo de Eventos:

1. **Usuário clica em "Mostrar Anúncio"** no Mini App
2. **SDK do Monetag exibe o anúncio**
3. **Frontend registra impressão** quando a Promise resolve
4. **Se usuário clicar no anúncio**:
   - Monetag detecta o clique real
   - Monetag envia postback para nosso servidor
   - Nosso endpoint `/api/monetag/postback` recebe os dados
   - Sistema registra o clique no banco de dados
   - Dashboard atualiza estatísticas automaticamente

### Diferença Importante:

- ❌ **Fechar anúncio (X)**: NÃO gera postback de clique
- ✅ **Clicar no anúncio**: Gera postback de clique com `click_id` e `revenue`

---

## 🧪 Testar Postback

Você pode testar manualmente o endpoint com curl:

```bash
curl "https://monetag-tracker-production.up.railway.app/api/monetag/postback?event_type=click&zone_id=10269314&telegram_id=123456&revenue=0.0023&ymid=test123"
```

Ou acesse diretamente no navegador para ver a resposta JSON.

---

## 📊 Verificar Logs

Após configurar, monitore os logs do servidor para ver os postbacks chegando:

```bash
# No Railway, vá em "Deployments" > "View Logs"
# Procure por linhas como:
[Postback] Received: { event_type: 'click', zone_id: '10269314', ... }
[Postback] Event recorded successfully
```

---

## 🔍 Troubleshooting

### Postbacks não estão chegando?

1. ✅ Verifique se a URL está correta no painel do Monetag
2. ✅ Confirme que o domínio está acessível publicamente
3. ✅ Verifique os logs do servidor para erros
4. ✅ Teste o endpoint manualmente com curl
5. ✅ Certifique-se de que o usuário realmente **clicou no anúncio** (não apenas fechou)

### Cliques não estão sendo registrados?

- O Monetag só envia postback quando há um **clique real no anúncio**
- Fechar o anúncio com "X" **NÃO** gera postback de clique
- Apenas **impressões** são registradas no frontend
- **Cliques** são registrados via postback do servidor

---

## 📝 Notas Importantes

- ⚠️ **Substitua `SEU-DOMINIO`** pelo domínio real do Railway após deploy
- ⚠️ O endpoint aceita tanto **GET** quanto **POST** (Monetag usa GET por padrão)
- ⚠️ Todos os parâmetros são opcionais exceto `event_type` e `zone_id`
- ⚠️ O sistema valida se `event_type` é `impression` ou `click`
- ⚠️ `telegram_id` pode estar vazio se não disponível no contexto Telegram

# Integração n8n + WhatsApp - Sistema de Comprovantes

## Visão Geral

Este documento descreve como configurar o n8n para receber comprovantes via WhatsApp e processá-los automaticamente no sistema.

## Arquitetura

```
Motorista (WhatsApp) → n8n (Webhook + Lógica) → Edge Function → Supabase
```

## Configuração do n8n

### 1. Pré-requisitos

- Conta no n8n (Cloud ou Self-hosted)
- WhatsApp Business API, Twilio, ou Evolution API configurado
- Acesso às credenciais do Supabase

### 2. URL do Webhook

```
POST https://plfpczvnqmvqpmsbjrra.supabase.co/functions/v1/processar-comprovante-whatsapp
```

### 3. Headers Necessários

```
X-Webhook-Secret: [SEU_SECRET_AQUI]
Content-Type: application/json
```

**IMPORTANTE**: Configure o secret `N8N_WEBHOOK_SECRET` nas secrets do Supabase para segurança.

### 4. Estrutura do Payload

```json
{
  "telefone": "+5511999998888",
  "imagem_url": "https://exemplo.com/imagem.jpg",
  "imagem_base64": "opcional - envie URL ou base64",
  "mensagem_texto": "opcional - texto enviado pelo motorista"
}
```

### 5. Estrutura da Resposta

#### Sucesso (200)

```json
{
  "success": true,
  "motorista_nome": "João Silva",
  "viagem_codigo": "VG-2025-001",
  "tipo_identificado": "abastecimento",
  "confianca": "alta",
  "sugestao_confirmacao": "Abastecimento de 120L por R$ 689,50 registrado!",
  "registro_id": "uuid-do-registro",
  "tipo_registro": "abastecimento",
  "comprovante_log_id": "uuid-do-log"
}
```

#### Erro (400/404/500)

```json
{
  "success": false,
  "error": "Motorista não encontrado. Verifique se o número está cadastrado."
}
```

## Fluxo Sugerido no n8n

### Diagrama do Fluxo

```
[1. WhatsApp Trigger]
    ↓
[2. IF: É imagem?]
    ↓ SIM
[3. HTTP Request] → POST para Edge Function
    ↓
[4. IF: Sucesso?]
    ↓ SIM
[5. WhatsApp: Confirmar] ✅ {{sugestao_confirmacao}}
    ↓ NÃO
[6. WhatsApp: Erro] ❌ {{error}}
```

### Detalhamento dos Nós

#### Nó 1: WhatsApp Trigger

- **Tipo**: Webhook ou WhatsApp Business
- **Evento**: Message Received
- **Filtro**: Apenas mensagens com mídia (imagem/foto)

#### Nó 2: IF Node - Validar Imagem

```javascript
// Expressão JavaScript
return items[0].json.message_type === 'image' || 
       items[0].json.media_url !== undefined;
```

#### Nó 3: HTTP Request - Processar Comprovante

- **Método**: POST
- **URL**: `https://plfpczvnqmvqpmsbjrra.supabase.co/functions/v1/processar-comprovante-whatsapp`
- **Headers**:
  ```json
  {
    "X-Webhook-Secret": "={{$env.N8N_WEBHOOK_SECRET}}",
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "telefone": "={{$json.from}}",
    "imagem_url": "={{$json.media_url}}",
    "mensagem_texto": "={{$json.text || ''}}"
  }
  ```

#### Nó 4: IF Node - Verificar Sucesso

```javascript
return items[0].json.success === true;
```

#### Nó 5: WhatsApp - Mensagem de Confirmação

- **Destino**: `={{$json.from}}`
- **Mensagem**: 
  ```
  ✅ {{$json.sugestao_confirmacao}}
  
  📦 Viagem: {{$json.viagem_codigo}}
  🚚 Motorista: {{$json.motorista_nome}}
  ```

#### Nó 6: WhatsApp - Mensagem de Erro

- **Destino**: `={{$json.from}}`
- **Mensagem**: 
  ```
  ❌ Ops! {{$json.error}}
  
  Por favor, verifique e tente novamente.
  ```

## Tipos de Comprovantes Identificados

A IA identifica automaticamente os seguintes tipos:

| Tipo | Descrição | Ação no Sistema |
|------|-----------|-----------------|
| `HODOMETRO` | Painel do veículo | Atualiza `km_inicial` ou `km_final` da viagem |
| `ABASTECIMENTO` | Nota de combustível | Cria registro em `abastecimentos` |
| `DESPESA_ALIMENTACAO` | Recibo de restaurante | Cria despesa tipo `alimentacao` |
| `DESPESA_PEDAGIO` | Ticket de pedágio | Cria despesa tipo `pedagio` |
| `DESPESA_HOSPEDAGEM` | Nota de hotel | Cria despesa tipo `hospedagem` |
| `DESPESA_MANUTENCAO` | Recibo de oficina | Cria despesa tipo `manutencao` |
| `DESPESA_OUTRAS` | Outras despesas | Cria despesa tipo `outras` |
| `RECEBIMENTO` | Comprovante de pagamento | Cria transação tipo `recebimento` |
| `ADIANTAMENTO` | Comprovante de saque | Cria transação tipo `adiantamento` |
| `DESCONHECIDO` | Não identificado | Apenas registra log |

## Níveis de Confiança

- **Alta**: Comprovante identificado com certeza (>90%)
- **Média**: Comprovante identificado com incerteza (60-90%)
- **Baixa**: Difícil identificar (<60%)

## Segurança

### 1. Configurar Secret Token

No Supabase, adicione a secret:

```
N8N_WEBHOOK_SECRET=seu_token_secreto_aqui
```

No n8n, use essa mesma secret no header `X-Webhook-Secret`.

### 2. Rate Limiting

A edge function implementa rate limiting automático para prevenir abuso.

### 3. Validação de Telefone

Apenas motoristas cadastrados com telefone válido podem enviar comprovantes.

## Monitoramento

Acesse a página de admin `/admin/comprovantes-whatsapp` para:

- ✅ Ver todos os comprovantes recebidos
- 📊 Conferir status de processamento
- 🔍 Verificar dados extraídos pela IA
- ✔️ Confirmar ou rejeitar comprovantes
- 🔄 Reprocessar comprovantes com erro

## Logs

Todos os comprovantes são registrados na tabela `comprovantes_whatsapp` com:

- Motorista e viagem associados
- Imagem original
- Tipo identificado
- Nível de confiança
- Dados extraídos pela IA
- Status (processando, confirmado, erro, rejeitado)

## Troubleshooting

### Erro: "Motorista não encontrado"

**Causa**: Telefone não cadastrado ou formatado incorretamente.

**Solução**: 
1. Verifique se o telefone está cadastrado em `motoristas.telefone`
2. Teste com o formato: `(11) 99999-8888` ou `11999998888`

### Erro: "Erro ao processar imagem com IA"

**Causa**: Créditos da IA esgotados ou imagem muito grande.

**Solução**:
1. Verifique créditos no Lovable AI
2. Reduza tamanho da imagem (<5MB)

### Erro: "Viagem não encontrada"

**Causa**: Motorista não possui viagem em andamento.

**Solução**: O comprovante será registrado no log mas não criará registro automático. Admin deve processar manualmente.

## Exemplo de Teste

1. Configure o webhook no n8n
2. Envie uma mensagem via WhatsApp: 📸 [foto de nota de abastecimento]
3. Aguarde resposta: ✅ "Abastecimento de 120L por R$ 689,50 registrado!"
4. Verifique em `/admin/comprovantes-whatsapp`

## Links Úteis

- [Documentação n8n](https://docs.n8n.io/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Evolution API](https://evolution-api.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Suporte

Para problemas ou dúvidas, consulte os logs da edge function:
- Acesse: https://supabase.com/dashboard/project/plfpczvnqmvqpmsbjrra/functions/processar-comprovante-whatsapp/logs

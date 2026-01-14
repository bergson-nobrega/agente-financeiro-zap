# Agente Financeiro WhatsApp MVP (com Gemini AI)

Este é um MVP de um bot financeiro para WhatsApp utilizando Node.js, Twilio e Inteligência Artificial do Google (Gemini).

## Funcionalidades
- Recebe mensagens de texto via WhatsApp.
- Usa IA (Gemini 1.5 Flash-latest) para entender linguagem natural.
- Identifica automaticamente se é Despesa ou Receita.
- Categoriza o gasto sozinho (ex: "Almoço" -> Categoria: Alimentação).

## Pré-requisitos
- Node.js instalado
- Conta no Twilio (WhatsApp Sandbox)
- Conta no Railway (Deploy)
- Chave de API do Google Gemini (Gratuita)

## Configuração de Variáveis de Ambiente (.env)
No Railway (ou localmente no `.env`), você precisa destas variáveis:

```
PORT=3000
GEMINI_API_KEY=SuaChaveDoGoogleAqui
```

Para pegar a chave do Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## Como Rodar Localmente
1. Instale dependências: `npm install`
2. Configure o `.env` com sua chave do Gemini.
3. Rode: `npm start`

## Deploy no Railway
1. Faça push para o GitHub.
2. O Railway fará o build automático.
3. **Importante:** Adicione a variável `GEMINI_API_KEY` nas configurações do Railway (Variables).

## Como Testar
No WhatsApp (após configurar o Sandbox do Twilio):
- "Gastei 25 reais na padaria"
- "Recebi 500 do freela"
- "Comprei um tênis de 200 reais"

O bot deve responder confirmando os valores e categorias.

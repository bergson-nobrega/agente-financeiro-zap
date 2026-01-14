require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MessagingResponse } = twilio.twiml;

const app = express();

// Verificação inicial da API Key
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'SuaChaveDoGoogleAqui') {
  console.error("CRÍTICO: A variável de ambiente GEMINI_API_KEY não está configurada corretamente no arquivo .env");
  console.error("Por favor, edite o arquivo .env e coloque sua chave real do Google AI Studio.");
  // Não encerra o processo para permitir que o servidor suba, mas avisa no log
}

// Middleware para processar dados enviados pelo Twilio (form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Rota de verificação de saúde do serviço
app.get('/', (req, res) => {
  res.send('Agente Financeiro com Gemini AI (via SDK) está ON!');
});

// Função auxiliar para chamar a API do Gemini via SDK
async function chamarGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key do Gemini não configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Webhook para receber mensagens do WhatsApp via Twilio
app.post('/twilio/whatsapp', async (req, res) => {
  const mensagemRecebida = req.body.Body;
  const remetente = req.body.From;

  console.log(`Mensagem de ${remetente}: "${mensagemRecebida}"`);

  const twiml = new MessagingResponse();

  try {
    // Prompt do sistema
    const promptSistema = `
      Você é um Assistente Financeiro Pessoal amigável e prático.
      Seu objetivo é ajudar o usuário a organizar suas finanças via WhatsApp.
      
      Regras:
      1. Se o usuário informar um gasto ou ganho (ex: "gastei 50 no almoço", "recebi 1000"), confirme que entendeu identificando:
         - Tipo (Despesa ou Receita)
         - Valor (formatado em R$)
         - Categoria (invente uma categoria curta e lógica, ex: Alimentação, Transporte, Lazer)
         - Descrição
      2. Se for conversa fiada, responda de forma simpática mas tente trazer de volta para finanças.
      3. Seja conciso (mensagens de WhatsApp não podem ser textões). Use emojis.
      4. Se não entender o valor, pergunte gentilmente.
      
      Mensagem do usuário: "${mensagemRecebida}"
    `;

    // Chama o Gemini
    const respostaIA = await chamarGemini(promptSistema);

    console.log(`Resposta da IA: ${respostaIA}`);
    twiml.message(respostaIA);

  } catch (erro) {
    console.error("Erro ao processar mensagem:", erro);
    // Se der erro, mostramos o erro técnico no log do Railway, mas pro usuário mandamos algo amigável
    twiml.message("Desculpe, tive um problema técnico momentâneo. Tente novamente em alguns segundos.");
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

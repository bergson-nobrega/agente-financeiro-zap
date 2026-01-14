const express = require('express');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware para processar dados enviados pelo Twilio (form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Rota de verificação de saúde do serviço
app.get('/', (req, res) => {
  res.send('Agente Financeiro com Gemini AI está ON!');
});

// Inicializa o Gemini
// Importante: A chave GEMINI_API_KEY deve estar nas variáveis de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Histórico simples em memória (para o bot lembrar do contexto da conversa atual)
// Em produção, isso deveria ir para um banco de dados (Redis/Supabase)
const conversas = {};

// Webhook para receber mensagens do WhatsApp via Twilio
app.post('/twilio/whatsapp', async (req, res) => {
  const mensagemRecebida = req.body.Body;
  const remetente = req.body.From;

  console.log(`Mensagem de ${remetente}: "${mensagemRecebida}"`);

  const twiml = new MessagingResponse();

  try {
    if (!process.env.GEMINI_API_KEY) {
      twiml.message("⚠️ Erro de configuração: API Key do Gemini não encontrada no servidor.");
      res.type('text/xml').send(twiml.toString());
      return;
    }

    // Prompt do sistema para guiar a personalidade e função do bot
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

    // Gera a resposta com o Gemini
    const result = await model.generateContent(promptSistema);
    const respostaIA = result.response.text();

    console.log(`Resposta da IA: ${respostaIA}`);

    // Envia a resposta da IA de volta para o WhatsApp
    twiml.message(respostaIA);

  } catch (erro) {
    console.error("Erro ao chamar Gemini:", erro);
    twiml.message("Desculpe, tive um problema cerebral momentâneo 🧠💥. Tente novamente em alguns segundos.");
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

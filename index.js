const express = require('express');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;

const app = express();

// Middleware para processar dados enviados pelo Twilio (form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Rota de verificação de saúde do serviço
app.get('/', (req, res) => {
  res.send('Agente Financeiro com Gemini AI (via REST) está ON!');
});

// Função auxiliar para chamar a API do Gemini via HTTP (sem SDK)
async function chamarGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key do Gemini não configurada");

  // Endpoint da API REST v1 para o modelo gemini-1.5-flash-latest
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API Gemini (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  
  // Extrai o texto da resposta
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Formato de resposta inesperado do Gemini");
  }
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

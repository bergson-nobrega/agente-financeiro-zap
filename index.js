const express = require('express');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;

const app = express();

// Middleware para processar dados enviados pelo Twilio (form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Rota de verificação de saúde do serviço
app.get('/', (req, res) => {
  res.send('OK');
});

// Webhook para receber mensagens do WhatsApp via Twilio
app.post('/twilio/whatsapp', (req, res) => {
  // Extrai o corpo da mensagem e o número do remetente
  const mensagemRecebida = req.body.Body;
  const remetente = req.body.From;

  console.log(`Mensagem recebida: "${mensagemRecebida}" de ${remetente}`);

  // Prepara a resposta TwiML (XML do Twilio)
  const twiml = new MessagingResponse();
  twiml.message(`Recebido: "${mensagemRecebida}" (de ${remetente})`);

  // Define o cabeçalho Content-Type e envia a resposta XML
  res.type('text/xml');
  res.send(twiml.toString());
});

// Inicia o servidor na porta definida pelo ambiente ou 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

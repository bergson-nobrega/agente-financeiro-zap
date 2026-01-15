require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;
const db = require('./db');
const ai = require('./ai');

const app = express();

// Verificação inicial da API Key
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'SuaChaveDoGoogleAqui') {
  console.error("CRÍTICO: A variável de ambiente GEMINI_API_KEY não está configurada corretamente.");
}

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Agente Financeiro V2 (com persistência SQLite) está ON!');
});

app.post('/twilio/whatsapp', async (req, res) => {
  const mensagemRecebida = req.body.Body;
  const remetente = req.body.From;

  console.log(`Mensagem de ${remetente}: "${mensagemRecebida}"`);

  const twiml = new MessagingResponse();

  try {
    // 1. Analisa a intenção do usuário usando IA (retorna JSON)
    const analise = await ai.analisarIntencao(mensagemRecebida);
    console.log("Intenção identificada:", analise);

    let respostaFinal = "";

    if (analise.intencao === 'ADICIONAR_TRANSACAO') {
      // Salva no banco de dados
      const { tipo, valor, categoria, descricao } = analise.dados;
      await db.adicionarTransacao(remetente, tipo, valor, categoria, descricao);
      
      respostaFinal = `✅ Registrado: ${tipo} de R$ ${valor} (${categoria} - ${descricao}).`;
    
    } else if (analise.intencao === 'CONSULTAR_SALDO') {
      // Busca no banco e gera relatório
      const periodo = analise.dados.periodo || 'mes';
      const transacoes = await db.consultarTransacoes(remetente, periodo);
      const resumo = await db.resumoFinanceiro(remetente);
      
      respostaFinal = await ai.gerarRespostaRelatorio(periodo, transacoes, resumo);

    } else {
      // Apenas conversa (CHAT)
      respostaFinal = analise.resposta_chat || "Desculpe, não entendi.";
    }

    twiml.message(respostaFinal);

  } catch (erro) {
    console.error("Erro ao processar mensagem:", erro);
    twiml.message("Desculpe, tive um erro técnico. Tente novamente.");
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

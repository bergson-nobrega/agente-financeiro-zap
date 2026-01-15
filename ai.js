const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });

async function analisarIntencao(mensagem) {
  const prompt = `
    Analise a seguinte mensagem de um usuário para um bot financeiro e extraia a intenção e os dados.
    
    A mensagem é: "${mensagem}"
    
    Responda APENAS com um JSON neste formato:
    {
      "intencao": "ADICIONAR_TRANSACAO" | "CONSULTAR_SALDO" | "CHAT",
      "dados": {
        "tipo": "DESPESA" | "RECEITA" (se for transação),
        "valor": numero (ex: 50.00),
        "categoria": "string" (ex: Alimentação, Transporte),
        "descricao": "string",
        "periodo": "dia" | "semana" | "mes" (se for consulta)
      },
      "resposta_chat": "string" (apenas se a intenção for CHAT, gere uma resposta curta e séria aqui)
    }

    Exemplos:
    - "Gastei 50 no almoço" -> {"intencao": "ADICIONAR_TRANSACAO", "dados": {"tipo": "DESPESA", "valor": 50, "categoria": "Alimentação", "descricao": "Almoço"}}
    - "Quanto gastei essa semana?" -> {"intencao": "CONSULTAR_SALDO", "dados": {"periodo": "semana"}}
    - "Olá, tudo bem?" -> {"intencao": "CHAT", "resposta_chat": "Olá. Sou seu assistente financeiro. Como posso ajudar nas suas contas hoje?"}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao analisar intenção:", error);
    return { intencao: "CHAT", resposta_chat: "Desculpe, não entendi. Pode repetir de forma mais clara?" };
  }
}

async function gerarRespostaRelatorio(periodo, transacoes, resumo) {
    const prompt = `
      Você é um consultor financeiro sério. O usuário pediu um relatório.
      
      Dados:
      - Período: ${periodo}
      - Total Receitas: R$ ${resumo.total_receitas || 0}
      - Total Despesas: R$ ${resumo.total_despesas || 0}
      - Saldo: R$ ${(resumo.total_receitas || 0) - (resumo.total_despesas || 0)}
      
      Lista de transações recentes:
      ${JSON.stringify(transacoes)}
      
      Gere uma resposta curta, direta e séria para o WhatsApp resumindo esses dados. 
      Se o saldo for negativo, alerte o usuário.
      Não use formatação Markdown complexa (negrito use *texto*).
    `;
    
    const modelText = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await modelText.generateContent(prompt);
    return (await result.response).text();
}

module.exports = { analisarIntencao, gerarRespostaRelatorio };

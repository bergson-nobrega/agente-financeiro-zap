require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testarGemini() {
  console.log("Iniciando teste de conexão com Gemini...");
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'SuaChaveDoGoogleAqui') {
    console.error("ERRO: GEMINI_API_KEY não configurada ou é o valor padrão no arquivo .env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Diga 'Olá, o teste funcionou!' se você estiver recebendo esta mensagem.";
    console.log(`Enviando prompt: "${prompt}"`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("---------------------------------------------------");
    console.log("SUCESSO! Resposta do Gemini:");
    console.log(text);
    console.log("---------------------------------------------------");
  } catch (error) {
    console.error("ERRO AO CHAMAR GEMINI:");
    console.error(error);
  }
}

testarGemini();

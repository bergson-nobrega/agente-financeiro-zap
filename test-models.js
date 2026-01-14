require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testarModelos() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'SuaChaveDoGoogleAqui') {
    console.error("Configure a chave no .env primeiro!");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  /*
  const modelosParaTestar = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro"
  ];
  */

  // Vamos tentar uma abordagem diferente: usando fetch direto para listar modelos
  // porque o SDK as vezes mascara o erro real
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
        console.log("✅ Conexão bem sucedida! Modelos disponíveis para sua chave:");
        data.models.forEach(m => {
             console.log(`- ${m.name.replace('models/', '')}`);
        });
    } else {
        console.log("❌ Erro ao listar modelos:");
        console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
      console.error("Erro de rede:", err);
  }
}

testarModelos();

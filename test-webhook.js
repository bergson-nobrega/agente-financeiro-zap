async function testarWebhook() {
  // A URL deve corresponder à porta definida no .env (3001)
  const url = 'http://localhost:3001/twilio/whatsapp';
  
  // Simula o corpo da requisição que o Twilio enviaria
  const body = new URLSearchParams({
    'Body': 'Gastei 50 reais no almoço',
    'From': 'whatsapp:+5511999999999',
    'ProfileName': 'Usuário Teste'
  });

  console.log(`📡 Simulando mensagem do WhatsApp para: ${url}`);
  console.log(`💬 Mensagem enviada: "Gastei 50 reais no almoço"`);
  console.log('⏳ Aguardando resposta do servidor (pode levar alguns segundos devido à IA)...');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const text = await response.text();
    
    console.log('\n--- 📩 Resposta do Servidor (XML TwiML) ---');
    console.log(text);
    console.log('------------------------------------------');

    if (response.ok && text.includes('<Response>')) {
        console.log('✅ SUCESSO TÉCNICO: O servidor recebeu a mensagem e respondeu no formato correto.');
        
        if (text.includes('Despesa') && text.includes('50,00')) {
            console.log('🤖 SUCESSO DA IA: O Gemini processou, identificou o valor e a categoria!');
        } else if (text.includes('problema técnico')) {
            console.log('⚠️ ALERTA: O servidor funcionou, mas a IA retornou erro (provavelmente API Key inválida).');
            console.log('👉 Verifique o console onde o comando "npm start" está rodando para ver o erro detalhado.');
        } else {
            console.log('❓ OBSERVAÇÃO: Resposta recebida, mas verifique se o conteúdo faz sentido.');
        }
    } else {
        console.log(`❌ ERRO: O servidor retornou status ${response.status}.`);
    }

  } catch (error) {
    console.error('\n❌ ERRO DE CONEXÃO:');
    console.error('O servidor parece estar desligado ou a porta está errada.');
    console.error('DICA: Abra outro terminal e rode "npm start" antes de rodar este teste.');
    console.error(`Detalhe: ${error.message}`);
  }
}

testarWebhook();

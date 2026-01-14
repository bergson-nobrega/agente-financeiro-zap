# Agente Financeiro WhatsApp MVP

Este é um MVP simples de um bot para WhatsApp utilizando Node.js, Express e Twilio.

## Pré-requisitos

- Node.js instalado
- Conta no Twilio (para usar o Sandbox do WhatsApp)
- Conta no Railway (para deploy)

## Instalação e Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor localmente:
   ```bash
   npm start
   ```
   O servidor rodará em `http://localhost:3000`.

3. Teste se o servidor está rodando acessando `http://localhost:3000` no navegador. Deve aparecer "OK".

## Configuração do Twilio WhatsApp Sandbox

Para testar localmente sem ngrok, você precisará fazer o deploy primeiro para ter uma URL pública, ou usar uma ferramenta de túnel (mas o foco aqui é deploy no Railway).

Após o deploy no Railway (veja abaixo):

1. Vá para o Console do Twilio > Messaging > Try it out > Send a WhatsApp message.
2. Nas configurações do Sandbox ("Sandbox Settings"), em "When a message comes in", coloque a URL do seu serviço no Railway seguida de `/twilio/whatsapp`.
   Exemplo: `https://seu-projeto-railway.up.railway.app/twilio/whatsapp`
3. Certifique-se de que o método HTTP está selecionado como **POST**.
4. Salve as configurações.

## Deploy no Railway

1. Crie um repositório no GitHub e suba este código.
2. No [Railway](https://railway.app/):
   - Clique em "New Project" > "Deploy from GitHub repo".
   - Selecione o repositório criado.
   - O Railway detectará automaticamente o Node.js e fará o deploy.
   - O comando de start será o definido no `package.json` (`node index.js`).
3. Após o deploy, vá em "Settings" > "Networking" e gere um domínio (Generate Domain) para obter a URL pública.
4. Use essa URL para configurar o Twilio (passo acima).

## Variáveis de Ambiente

Para este MVP simples, não estamos usando as variáveis no código ainda, mas o arquivo `.env.example` lista o que será necessário para futuras integrações (OpenAI, Supabase, Twilio Client).

## Troubleshooting

- **Erro 404 ao enviar mensagem:** Verifique se a URL no Twilio está correta e termina com `/twilio/whatsapp`.
- **Erro 405 Method Not Allowed:** Verifique se o Twilio está configurado para usar **POST** (não GET).
- **Servidor não inicia no Railway:** Verifique os logs de build e deploy no Railway. Certifique-se de que `package.json` está na raiz.
- **Mensagem não chega:** Verifique os logs da aplicação (`Logs` no Railway) para ver se o `console.log` da mensagem recebida aparece.

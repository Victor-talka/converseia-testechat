// Script para adicionar dados de exemplo no localStorage
// Execute este script no console do navegador para adicionar dados de teste

function adicionarDadosExemplo() {
  // Dados de exemplo para scripts
  const scriptsExemplo = {
    "exemplo-1": {
      script: `<script>
        (function() {
          // Widget de exemplo
          const widget = document.createElement('ra-chatbot-widget');
          widget.setAttribute('slug', 'exemplo');
          widget.setAttribute('data-chatbot', 'true');
          widget.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; max-width: 400px; max-height: 600px; min-height: 60px; min-width: 320px;';
          
          // Simular um widget funcional
          widget.innerHTML = \`
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;">
              <div style="background: #2563eb; color: white; padding: 16px; font-weight: 600;">
                Chat Converseia
              </div>
              <div style="padding: 20px; text-align: center;">
                <div style="margin-bottom: 16px;">
                  <div style="width: 60px; height: 60px; background: #e5e7eb; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    💬
                  </div>
                </div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937;">Olá!</h3>
                <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">Como posso ajudar você hoje?</p>
                <button style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="alert('Widget funcionando!')">
                  Iniciar conversa
                </button>
              </div>
            </div>
          \`;
          
          document.body.appendChild(widget);
          console.log('Widget de exemplo criado!');
        })();
      </script>`,
      title: "Widget de Exemplo",
      createdAt: Date.now()
    }
  };

  // Salvar no localStorage
  localStorage.setItem('chatbot-scripts', JSON.stringify(scriptsExemplo));
  
  console.log('✅ Dados de exemplo adicionados!');
  console.log('Agora você pode acessar: http://localhost:8080/preview/exemplo-1');
  
  return scriptsExemplo;
}

// Executar automaticamente
if (typeof window !== 'undefined') {
  adicionarDadosExemplo();
} else {
  console.log('Execute este código no console do navegador');
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SetupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const criarExemplo = async () => {
    setLoading(true);
    
    try {
      // Script de exemplo que funciona
      const scriptExemplo = `<script>
(function() {
  // Criar elemento do widget
  const widget = document.createElement('ra-chatbot-widget');
  widget.setAttribute('slug', 'exemplo-converseia');
  widget.setAttribute('data-chatbot', 'true');
  widget.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; max-width: 400px; max-height: 600px; min-height: 60px; min-width: 320px;';
  
  // Interface do widget
  widget.innerHTML = \`
    <div id="chatbot-container" style="background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden; font-family: system-ui;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-weight: 600; font-size: 16px;">Converseia Chat</div>
          <div style="font-size: 12px; opacity: 0.9;">Online agora</div>
        </div>
        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
      </div>
      <div style="padding: 20px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">
            💬
          </div>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937;">Olá! 👋</h3>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          Bem-vindo ao chat da Converseia!<br/>
          Como posso ajudar você hoje?
        </p>
        <button 
          id="start-chat-btn"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; transition: transform 0.2s;"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
          onclick="iniciarConversa()"
        >
          Iniciar conversa
        </button>
      </div>
    </div>
  \`;
  
  // Função para iniciar conversa
  window.iniciarConversa = function() {
    const container = document.getElementById('chatbot-container');
    if (container) {
      container.innerHTML = \`
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 600; font-size: 16px;">Converseia Chat</div>
            <div style="font-size: 12px; opacity: 0.9;">Digitando...</div>
          </div>
          <button onclick="fecharChat()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer;">×</button>
        </div>
        <div style="height: 300px; overflow-y: auto; padding: 16px;">
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;">
            <strong>Bot:</strong> Olá! Sou o assistente virtual da Converseia. Em que posso ajudar?
          </div>
        </div>
        <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; gap: 8px;">
            <input 
              type="text" 
              placeholder="Digite sua mensagem..." 
              style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"
              onkeypress="if(event.key==='Enter') enviarMensagem(this)"
            />
            <button 
              onclick="enviarMensagem(this.previousElementSibling)"
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;"
            >
              Enviar
            </button>
          </div>
        </div>
      \`;
    }
  };
  
  // Função para fechar chat
  window.fecharChat = function() {
    const widget = document.querySelector('ra-chatbot-widget');
    if (widget) widget.remove();
  };
  
  // Função para enviar mensagem
  window.enviarMensagem = function(input) {
    if (!input.value.trim()) return;
    
    const chatArea = document.querySelector('[style*="height: 300px"]');
    if (chatArea) {
      const mensagem = input.value;
      chatArea.innerHTML += \`
        <div style="text-align: right; margin-bottom: 12px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; max-width: 80%; font-size: 14px;">
            \${mensagem}
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;">
          <strong>Bot:</strong> Obrigado pela sua mensagem! Este é um widget de exemplo da Converseia funcionando perfeitamente! 🎉
        </div>
      \`;
      chatArea.scrollTop = chatArea.scrollHeight;
      input.value = '';
    }
  };
  
  // Adicionar widget ao DOM
  document.body.appendChild(widget);
  
  console.log('✅ Widget Converseia carregado com sucesso!');
})();
</script>`;

      // Dados para localStorage
      const scriptsData = {
        "exemplo-converseia": {
          script: scriptExemplo,
          title: "Widget Converseia - Exemplo",
          createdAt: Date.now()
        }
      };

      // Salvar no localStorage
      localStorage.setItem('chatbot-scripts', JSON.stringify(scriptsData));
      
      toast({
        title: "✅ Exemplo criado!",
        description: "Widget de exemplo foi configurado com sucesso.",
      });

      // Redirecionar para o preview
      setTimeout(() => {
        navigate('/preview/exemplo-converseia');
      }, 1000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao criar exemplo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuração do Chat</h1>
        <p className="text-muted-foreground">
          Configure seu widget de chat facilmente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widget de Exemplo</CardTitle>
          <CardDescription>
            Crie um widget de chat funcional para testar a funcionalidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">O que será criado:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Widget de chat interativo</li>
              <li>• Interface moderna e responsiva</li>
              <li>• Funcionalidade de mensagens</li>
              <li>• Botões de ação funcionais</li>
            </ul>
          </div>
          
          <Button 
            onClick={criarExemplo}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Criando..." : "Criar Widget de Exemplo"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Servidor Local:</span>
              <span className="text-green-600">✅ Funcionando</span>
            </div>
            <div className="flex justify-between">
              <span>LocalStorage:</span>
              <span className="text-green-600">✅ Disponível</span>
            </div>
            <div className="flex justify-between">
              <span>Baserow:</span>
              <span className="text-yellow-600">⚠️ Desabilitado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
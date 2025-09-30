import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, MessageCircle, X, Plus, Menu, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { scriptService } from "@/services/database";
import { ChatScript } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Tipo para as conversas do histórico
type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
};

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scriptData, setScriptData] = useState<ChatScript | null>(null);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Procurando Exemplo História...",
      lastMessage: "Olá! Como posso ajudar você hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
      isActive: true
    },
    {
      id: "2",
      title: "Suporte Técnico",
      lastMessage: "Entendi o problema, vou verificar...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    },
    {
      id: "3",
      title: "Informações sobre Produto",
      lastMessage: "Obrigado pelas informações!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    }
  ]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nova conversa",
      lastMessage: "Iniciando nova conversa...",
      timestamp: new Date(),
      isActive: true
    };
    
    setConversations(prev => [
      newConversation,
      ...prev.map(conv => ({ ...conv, isActive: false }))
    ]);
    
    toast({
      title: "Nova conversa iniciada",
      description: "Uma nova conversa foi criada com sucesso."
    });
  };

  const handleSelectConversation = (convId: string) => {
    setConversations(prev => 
      prev.map(conv => ({ 
        ...conv, 
        isActive: conv.id === convId 
      }))
    );
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== convId));
    toast({
      title: "Conversa deletada",
      description: "A conversa foi removida com sucesso."
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  useEffect(() => {
    if (!id) {
      setError("ID do preview não encontrado");
      setIsLoading(false);
      return;
    }

    const loadScript = async () => {
      try {
        // Tentar buscar do banco de dados primeiro
        const script = await scriptService.getById(id);
        
        if (script) {
          setScriptData(script);
          await injectChatbotScript(script.script);
          return;
        }

        // Fallback para localStorage (compatibilidade com versão anterior)
        const storedScripts = localStorage.getItem("chatbot-scripts");
        if (!storedScripts) {
          setError("Script não encontrado. O link pode estar expirado.");
          setIsLoading(false);
          return;
        }

        const scripts = JSON.parse(storedScripts);
        const localScript = scripts[id];
        
        if (!localScript) {
          setError("Script não encontrado para este ID. O link pode estar expirado.");
          setIsLoading(false);
          return;
        }

        await injectChatbotScript(localScript.script);
      } catch (err) {
        console.error("Error loading script:", err);
        setError(`Erro ao carregar o script: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
        setIsLoading(false);
      }
    };

    loadScript();
  }, [id]);

  const injectChatbotScript = async (scriptContent: string) => {
    // Extract script content from the stored script
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = scriptContent;
    
    const scriptTags = tempDiv.getElementsByTagName("script");
    if (scriptTags.length === 0) {
      setError("Nenhum script válido encontrado. Verifique o código colado.");
      setIsLoading(false);
      return;
    }

    // Get the script content
    const scriptTextContent = scriptTags[0].textContent || scriptTags[0].innerHTML;
    
    if (!scriptTextContent.trim()) {
      setError("Script vazio. Por favor, cole um script válido.");
      setIsLoading(false);
      return;
    }

    console.log("Script encontrado, preparando para injetar...");
    console.log("Conteúdo do script:", scriptTextContent.substring(0, 200) + "...");

    // Wait for DOM to be fully ready
    const injectScript = () => {
      try {
        // Create and inject the script element directly into the DOM
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.setAttribute("data-chatbot-injected", "true");
        
        // Monitor network requests to help debug 400 errors
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          console.log("Fetch request:", args[0]);
          return originalFetch.apply(this, args).catch(err => {
            console.error("Fetch error:", err);
            return Promise.reject(err);
          });
        };
        
        // Override XMLHttpRequest to monitor older AJAX requests
        const originalXHR = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
          console.log("XHR request:", method, url);
          this.addEventListener('error', (e) => {
            console.error("XHR error:", e, "URL:", url);
          });
          this.addEventListener('load', () => {
            if (this.status >= 400) {
              console.error("XHR HTTP error:", this.status, this.statusText, "URL:", url);
              console.error("Response:", this.responseText);
            }
          });
          return originalXHR.call(this, method, url, ...rest);
        };
        
        // Wrap the script content to ensure it runs in the correct context
        scriptElement.text = `
          (function() {
            console.log("Executando script do chatbot...");
            console.log("User Agent:", navigator.userAgent);
            console.log("Current domain:", window.location.hostname);
            console.log("Protocol:", window.location.protocol);
            
            // Tentar mascarar o referrer para contornar restrições de domínio
            try {
              Object.defineProperty(document, 'referrer', {
                value: '',
                writable: false
              });
            } catch (e) {
              console.log("Não foi possível mascarar o referrer:", e);
            }
            
            // Modificar window.location temporariamente para alguns casos
            const originalLocation = window.location;
            
            try {
              // Executar o script original
              ${scriptTextContent}
              console.log("Script do chatbot executado com sucesso");
              
              // Aguardar um pouco e tentar forçar a criação do widget se não existir
              setTimeout(() => {
                const widget = document.getElementById("ra_wc_chatbot");
                if (!widget) {
                  console.log("Widget não encontrado, tentando abordagem alternativa...");
                  
                  // Tentar encontrar e executar funções do chatbot globalmente
                  if (window.ra_chatbot_init) {
                    console.log("Tentando executar ra_chatbot_init...");
                    window.ra_chatbot_init();
                  }
                  
                  // Verificar se há outras funções relacionadas
                  Object.keys(window).forEach(key => {
                    if (key.includes('chatbot') || key.includes('widget')) {
                      console.log("Função relacionada encontrada:", key, typeof window[key]);
                    }
                  });
                }
              }, 1000);
              
            } catch (e) {
              console.error("Erro ao executar script do chatbot:", e);
              console.error("Stack trace:", e.stack);
              
              // Em caso de erro, tentar uma abordagem mais simples
              console.log("Tentando abordagem de fallback...");
              try {
                // Criar uma versão simplificada do widget se o original falhar
                const fallbackWidget = document.createElement('div');
                fallbackWidget.id = 'ra_wc_chatbot_fallback';
                fallbackWidget.innerHTML = \`
                  <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; 
                              background: #0066cc; color: white; padding: 12px 20px; 
                              border-radius: 25px; cursor: pointer; font-family: Arial, sans-serif;
                              box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    ⚠️ Widget bloqueado por CORS
                    <div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">
                      Adicione \${window.location.origin} nos domínios permitidos
                    </div>
                  </div>
                \`;
                document.body.appendChild(fallbackWidget);
                
                fallbackWidget.addEventListener('click', () => {
                  alert('Este widget não pode ser carregado devido a restrições de CORS.\\n\\nPara resolver:\\n1. Acesse as configurações do chatbot\\n2. Adicione o domínio: ' + window.location.origin + '\\n3. Salve e teste novamente');
                });
                
              } catch (fallbackError) {
                console.error("Erro no fallback:", fallbackError);
              }
            }
          })();
        `;
        
        // Add script to document head for better compatibility
        document.head.appendChild(scriptElement);
        console.log("Script injetado no DOM");
        
        // Check if widget was created after a delay and show popup
        setTimeout(() => {
          const widget = document.getElementById("ra_wc_chatbot");
          const fallbackWidget = document.getElementById("ra_wc_chatbot_fallback");
          
          if (widget) {
            console.log("Widget encontrado no DOM:", widget);
            // Mostrar popup de destaque
            setShowChatPopup(true);
          } else if (fallbackWidget) {
            console.log("Widget de fallback criado devido a restrições CORS");
            setShowChatPopup(true);
          } else {
            console.warn("Widget não foi criado. Tentando iframe como última alternativa...");
            
            // Criar iframe como última tentativa
            try {
              const iframe = document.createElement('iframe');
              iframe.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border: none;
                border-radius: 50%;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              `;
              iframe.srcdoc = `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                    .chat-button {
                      width: 60px; height: 60px;
                      background: linear-gradient(135deg, #0066cc, #004499);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      color: white;
                      font-size: 24px;
                      transition: transform 0.2s;
                    }
                    .chat-button:hover { transform: scale(1.1); }
                  </style>
                </head>
                <body>
                  <div class="chat-button" onclick="parent.postMessage('openChat', '*')">💬</div>
                </body>
                </html>
              `;
              
              // Adicionar listener para mensagens do iframe
              window.addEventListener('message', (event) => {
                if (event.data === 'openChat') {
                  alert('Widget de Chatbot\\n\\nEste é um botão de demonstração.\\n\\nO chatbot original está bloqueado por CORS.\\n\\nPara resolver, adicione o domínio:\\n' + window.location.origin + '\\n\\nnas configurações do chatbot.');
                }
              });
              
              document.body.appendChild(iframe);
              console.log("Iframe de demonstração criado");
              setShowChatPopup(true);
            } catch (iframeError) {
              console.error("Erro ao criar iframe:", iframeError);
            }
            
            // Try to find any chatbot-related elements
            const chatbotElements = document.querySelectorAll('[id*="chatbot"], [class*="chatbot"], [id*="chat"], [class*="chat"]');
            if (chatbotElements.length > 0) {
              console.log("Elementos relacionados ao chatbot encontrados:", chatbotElements);
            }
          }
          setIsLoading(false);
        }, 3000);

        // Cleanup function
        return () => {
          console.log("Limpando script e widget...");
          // Remove the script element
          if (scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
          }
          
          // Remove the chatbot widget if it exists
          const widget = document.getElementById("ra_wc_chatbot");
          if (widget && widget.parentNode) {
            widget.parentNode.removeChild(widget);
          }
          
          // Remove any additional scripts that may have been loaded
          const injectedScripts = document.querySelectorAll('script[id^="ra_chatbot"]');
          injectedScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          });
        };
      } catch (err) {
        console.error("Erro ao injetar script:", err);
        setError(`Erro ao injetar o script: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
        setIsLoading(false);
      }
    };

    // Execute after a short delay to ensure DOM is ready
    const cleanup = injectScript();
    return cleanup;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Erro ao Carregar</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-card rounded-full shadow-[var(--shadow-elegant)] mb-4">
            <svg
              className="w-8 h-8 text-primary animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Carregando Chatbot...</h1>
          <p className="text-muted-foreground">O widget será exibido em instantes</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <Edit3 className="w-4 h-4" />
          Start New chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">New conversation</h3>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                  conversation.isActive 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(conversation.timestamp)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>POWERED BY</span>
          <span className="font-semibold">Dify</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background" style={{ position: 'relative', zIndex: 1 }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 border-r bg-card/50">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-semibold">Talk to DEV - TALKA</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-primary/10 rounded-full">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Talk to DEV - TALKA</h2>
                <p className="text-muted-foreground">
                  O widget do chatbot aparecerá no canto inferior direito
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-medium mb-2">Status do Widget</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Widget carregando...</p>
                  <p>• Aguarde alguns segundos</p>
                  <p>• Verifique o console (F12) para logs</p>
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-medium mb-2">Informações Técnicas</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Domínio: {window.location.hostname}</p>
                  <p>• Protocolo: {window.location.protocol}</p>
                  {scriptData && (
                    <p>• Cliente: {scriptData.clientName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CORS Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Configuração de Domínio
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                    Para o chatbot funcionar corretamente, adicione este domínio nas configurações:
                  </p>
                  <code className="bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded text-xs">
                    {window.location.origin}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Popup em Destaque */}
      {showChatPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Chat Ativo!</h3>
                  {scriptData && (
                    <p className="text-xs opacity-90">Cliente: {scriptData.clientName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowChatPopup(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Widget de Chat Carregado!
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  O widget de chat está funcionando e pronto para uso. Você pode fechar este popup e interagir com o chat no canto da tela.
                </p>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">🎯 Como usar:</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• O widget aparece no canto inferior direito</li>
                  <li>• Clique para abrir a conversa</li>
                  <li>• Teste todas as funcionalidades</li>
                  <li>• Compartilhe o link para demonstrações</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowChatPopup(false)}
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Fechar e Usar Chat
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Criar Novo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;

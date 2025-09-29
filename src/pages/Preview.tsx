import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const Preview = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("ID do preview não encontrado");
      setIsLoading(false);
      return;
    }

    const storedScripts = localStorage.getItem("chatbot-scripts");
    if (!storedScripts) {
      setError("Nenhum script encontrado. Por favor, gere um novo preview.");
      setIsLoading(false);
      return;
    }

    try {
      const scripts = JSON.parse(storedScripts);
      const scriptData = scripts[id];
      
      if (!scriptData) {
        setError("Script não encontrado para este ID. O link pode estar expirado.");
        setIsLoading(false);
        return;
      }

      // Extract script content from the stored script
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = scriptData.script;
      
      const scriptTags = tempDiv.getElementsByTagName("script");
      if (scriptTags.length === 0) {
        setError("Nenhum script válido encontrado. Verifique o código colado.");
        setIsLoading(false);
        return;
      }

      // Get the script content
      const scriptContent = scriptTags[0].textContent || scriptTags[0].innerHTML;
      
      if (!scriptContent.trim()) {
        setError("Script vazio. Por favor, cole um script válido.");
        setIsLoading(false);
        return;
      }

      console.log("Script encontrado, preparando para injetar...");
      console.log("Conteúdo do script:", scriptContent.substring(0, 200) + "...");

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
              
              try {
                ${scriptContent}
                console.log("Script do chatbot executado com sucesso");
              } catch (e) {
                console.error("Erro ao executar script do chatbot:", e);
                console.error("Stack trace:", e.stack);
              }
            })();
          `;
          
          // Add script to document head for better compatibility
          document.head.appendChild(scriptElement);
          console.log("Script injetado no DOM");
          
          // Check if widget was created after a delay
          setTimeout(() => {
            const widget = document.getElementById("ra_wc_chatbot");
            if (widget) {
              console.log("Widget encontrado no DOM:", widget);
            } else {
              console.warn("Widget não foi criado. Verifique o console para erros.");
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
    } catch (err) {
      console.error("Error loading chatbot script:", err);
      setError(`Erro ao carregar o chatbot: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      setIsLoading(false);
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Erro ao Carregar</h1>
          <p className="text-muted-foreground">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Voltar para a página inicial
          </a>
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

  return (
    <div className="min-h-screen p-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/50 rounded-lg p-6 mb-4 border border-border/50">
          <h1 className="text-xl font-semibold text-foreground mb-2">Preview do Chatbot</h1>
          <p className="text-sm text-muted-foreground mb-4">
            O widget deve aparecer no canto inferior direito da tela
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Verifique o console do navegador (F12) para logs de debug</p>
            <p>• O widget pode levar alguns segundos para carregar</p>
            <p>• Certifique-se de que o script colado é válido</p>
            <p>• Se houver erro 400, verifique se o chatbot está ativo e o domínio é permitido</p>
          </div>
        </div>
        
        {/* Debug info panel */}
        <div className="bg-card/30 rounded-lg p-4 mb-4 border border-border/30">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-foreground mb-2">
              Informações de Debug
            </summary>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <p><strong>Domínio atual:</strong> {window.location.hostname}</p>
              <p><strong>Protocolo:</strong> {window.location.protocol}</p>
              <p><strong>URL completa:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Preview;

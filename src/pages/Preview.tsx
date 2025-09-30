import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, MessageCircle, Menu, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { scriptService } from "@/services/database";
import { ChatScript } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Configurações do widget
const WIDGET_SCRIPT_ID = 'ra-chatbot-widget';
const WIDGET_IFRAME_SELECTOR = 'iframe[src*="chatbot"], iframe#ra_wc_chatbot';
const CONVERSATION_STORAGE_KEY = 'chatbot_conversation_id';
const WIDGETS_STORAGE_KEY = 'preview_widgets_historico';

// Tipo para widgets arquivados
type WidgetArquivado = {
  id: string;
  titulo: string;
  criadoEm: number;
  ultimaAtualizacao: number;
  isActive?: boolean;
};

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scriptData, setScriptData] = useState<ChatScript | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [widgetsArquivados, setWidgetsArquivados] = useState<WidgetArquivado[]>([]);
  const reinjetandoRef = useRef(false);
  const [slugDetectado, setSlugDetectado] = useState<string | null>(null);
  const [debugFetches, setDebugFetches] = useState<any[]>([]);
  const [forcandoAbertura, setForcandoAbertura] = useState(false);
  const conversaAtivaRef = useRef<string | null>(null);
  const injecaoTimestampRef = useRef<number>(0);

  // Carrega widgets arquivados do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (raw) setWidgetsArquivados(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persistirWidgets = (lista: WidgetArquivado[]) => {
    setWidgetsArquivados(lista);
    try {
      localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(lista));
    } catch {
      // ignore
    }
  };

  // Remove todos os popups e elementos indesejados
  const removerPopupsEBranding = useCallback(() => {
    const remover = () => {
      // Ajuste: somente durante primeiros 5s após injeção removemos popups transitórios
      const agora = Date.now();
      const dentroJanelaInicial = (agora - injecaoTimestampRef.current) < 5000;
      if (dentroJanelaInicial) {
        document.querySelectorAll('[role="dialog"], .dialog, .modal, [class*="popup"], [class*="toast"], [class*="notify"]').forEach((el) => {
          const element = el as HTMLElement;
          const text = (element.textContent || '').toLowerCase();
          // Critérios mais específicos para não remover a janela principal do chat
          const pequeno = element.offsetHeight < 160 && element.offsetWidth < 420;
          if (pequeno && (text.includes('chat ativo') || text.includes('carregado'))) {
            element.remove();
          }
        });
      }

      // Remove backdrop/overlay dos modals
      document.querySelectorAll('[class*="backdrop"], [class*="overlay"], [class*="bg-black"]').forEach((el) => {
        const element = el as HTMLElement;
        const style = window.getComputedStyle(element);
        if (style.position === 'fixed' && (style.zIndex === '10000' || parseInt(style.zIndex) > 9999)) {
          element.style.display = 'none';
          element.remove();
        }
      });

      // Remove branding Dify
      document.querySelectorAll('*').forEach(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        if (txt === 'powered by dify' || txt === 'dify') {
          (el as HTMLElement).style.display = 'none';
        }
      });

      // Remove botões "Criar Novo" que não sejam da sidebar
      if (dentroJanelaInicial) {
        document.querySelectorAll('button').forEach(btn => {
          const text = (btn.textContent || '').toLowerCase();
          if (text === 'criar novo' && !btn.closest('.sidebar, [data-sidebar]')) {
            btn.style.display = 'none';
          }
        });
      }
    };

    remover();

    // Observer para remover popups que aparecem dinamicamente
    if (!(window as any).__popup_remover_observer__) {
      const observer = new MutationObserver(() => {
        setTimeout(remover, 50);
      });
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      (window as any).__popup_remover_observer__ = observer;
    }
  }, []);

  // Arquiva widget atual antes de criar novo
  const arquivarWidgetAtual = useCallback(() => {
    const idAtual = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (!idAtual) return;
    conversaAtivaRef.current = idAtual;
    if (widgetsArquivados.some(w => w.id === idAtual)) return;
    const novo: WidgetArquivado = {
      id: idAtual,
      titulo: `Conversa ${widgetsArquivados.length + 1}`,
      criadoEm: Date.now(),
      ultimaAtualizacao: Date.now(),
      isActive: true
    };
    const lista = [novo, ...widgetsArquivados.map(w => ({ ...w, isActive: false }))];
    persistirWidgets(lista);
  }, [widgetsArquivados]);

  // Captura mudança do ID de conversa via hook em localStorage.setItem
  useEffect(() => {
    if ((window as any).__conversationHooked) return;
    const originalSetItem = localStorage.setItem.bind(localStorage);
  (localStorage as any).setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (key === CONVERSATION_STORAGE_KEY) {
        // Novo ID detectado
        conversaAtivaRef.current = value;
        setWidgetsArquivados(prev => {
          if (prev.some(w => w.id === value)) {
            return prev.map(w => ({ ...w, isActive: w.id === value, ultimaAtualizacao: Date.now() }));
          }
          const novo: WidgetArquivado = {
            id: value,
            titulo: `Conversa ${prev.length + 1}`,
            criadoEm: Date.now(),
            ultimaAtualizacao: Date.now(),
            isActive: true
          };
            return [novo, ...prev.map(w => ({ ...w, isActive: false }))];
        });
      }
  };
    (window as any).__conversationHooked = true;
  }, []);

  // Injeta o script do widget sem mostrar popup
  const injetarWidget = useCallback(async () => {
    if (reinjetandoRef.current) return;
    reinjetandoRef.current = true;
    injecaoTimestampRef.current = Date.now();

    try {
      // Remove widgets anteriores
      const oldScript = document.getElementById(WIDGET_SCRIPT_ID);
      if (oldScript) oldScript.remove();
      document.querySelectorAll(WIDGET_IFRAME_SELECTOR).forEach(el => el.remove());
      document.querySelectorAll('[id*="ra_wc_chatbot"]').forEach(el => el.remove());

      if (!scriptData) return;

      // Extrai conteúdo do script
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = scriptData.script;
      const scriptTags = tempDiv.getElementsByTagName("script");
      
      if (scriptTags.length === 0) {
        throw new Error("Nenhum <script> encontrado no código fornecido");
      }

      const firstTag = scriptTags[0];
      const hasSrc = firstTag.getAttribute('src');
      let scriptContent = firstTag.textContent || firstTag.innerHTML || '';

      // Patch para evitar erro de redefinição do custom element
      if (scriptContent.includes("customElements.define('ra-chatbot-widget'")) {
        scriptContent = scriptContent.replace(/customElements\.define\('ra-chatbot-widget'/, "if(!customElements.get('ra-chatbot-widget')) customElements.define('ra-chatbot-widget'");
      }

      // Detectar slug no script
      try {
        const slugMatch = scriptContent.match(/slug=([a-zA-Z0-9_-]+)/) || scriptContent.match(/"slug"\s*:\s*"([^"]+)"/);
        if (slugMatch) setSlugDetectado(slugMatch[1]);
      } catch {}

      console.log("Injetando script do widget... (externo:", !!hasSrc, ")");

      const scriptElement = document.createElement('script');
      scriptElement.id = WIDGET_SCRIPT_ID;
      scriptElement.type = 'text/javascript';
      scriptElement.setAttribute('data-chatbot-injected', 'true');

      if (hasSrc) {
        // Copia atributos relevantes
        Array.from(firstTag.attributes).forEach(attr => {
          if (!['id'].includes(attr.name)) {
            scriptElement.setAttribute(attr.name, attr.value);
          }
        });
        scriptElement.onload = () => {
          console.log('Script externo carregado');
          finalizarInjecao();
        };
        scriptElement.onerror = () => {
          console.error('Falha ao carregar script externo');
          finalizarInjecao();
        };
      } else {
        if (!scriptContent.trim()) throw new Error('Script vazio');
        scriptElement.text = scriptContent;
      }

      const posicionarWidget = () => {
        const host: any = document.querySelector('ra-chatbot-widget');
        if (host) {
          host.style.position = 'fixed';
            host.style.bottom = '24px';
            host.style.right = '24px';
            host.style.zIndex = '9999';
        }
      };

      const finalizarInjecao = () => {
        setTimeout(() => {
          removerPopupsEBranding();
          posicionarWidget();
          reinjetandoRef.current = false;
          setIsLoading(false);
          const widget = document.getElementById('ra_wc_chatbot') ||
            document.querySelector('[id*="chatbot"]') ||
            document.querySelector('[class*="chatbot"]');
          if (widget) {
            console.log('Widget encontrado:', widget);
            posicionarWidget();
          } else console.warn('Widget não encontrado após injeção');
        }, 1500);
      };

      document.head.appendChild(scriptElement);
      if (!hasSrc) {
        finalizarInjecao();
      }

    } catch (err) {
      console.error("Erro ao injetar widget:", err);
      setError(`Erro ao carregar widget: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      reinjetandoRef.current = false;
      setIsLoading(false);
    }
  }, [scriptData, removerPopupsEBranding]);

  // Interceptar fetch para logar chamadas do widget
  useEffect(() => {
    if ((window as any).__widgetFetchPatched) return;
    (window as any).__widgetDebug = { fetches: [] };
    const originalFetch = window.fetch.bind(window);
  (window as any).fetch = async (...args: any[]) => {
      const started = performance.now();
      let url = args[0];
      try {
        const res = await originalFetch(...args);
        if (typeof url === 'string' && url.includes('/api/get_widget')) {
          (window as any).__widgetDebug.fetches.push({
            at: Date.now(),
            url,
            status: res.status,
            ok: res.ok,
            ms: Math.round(performance.now() - started)
          });
          window.dispatchEvent(new CustomEvent('widget-debug-update'));
        }
        return res;
      } catch (error) {
        if (typeof url === 'string' && url.includes('/api/get_widget')) {
          (window as any).__widgetDebug.fetches.push({
            at: Date.now(),
            url,
            error: String(error)
          });
          window.dispatchEvent(new CustomEvent('widget-debug-update'));
        }
        throw error;
      }
  };
    (window as any).__widgetFetchPatched = true;
  }, []);

  // Atualizar estado de logs
  useEffect(() => {
    const handler = () => {
      try {
        setDebugFetches([...(window as any).__widgetDebug.fetches].slice(-5));
      } catch {}
    };
    window.addEventListener('widget-debug-update', handler);
    return () => window.removeEventListener('widget-debug-update', handler);
  }, []);

  const forcarAbrirChat = () => {
    setForcandoAbertura(true);
    setTimeout(() => setForcandoAbertura(false), 1500);
    try {
      const el: any = document.querySelector('ra-chatbot-widget');
      if (!el) {
        console.warn('Elemento <ra-chatbot-widget> não encontrado');
        return;
      }
      const metodos = ['open', 'openChat', 'show', 'toggle', 'expand'];
      for (const m of metodos) {
        if (typeof el[m] === 'function') {
          try { el[m](); console.log('Método chamado:', m); return; } catch {}
        }
      }
      // Tentar clicar no primeiro botão do shadow root
      const root: any = el.shadowRoot;
      if (root) {
        const btn = root.querySelector('button, [role=button]') as HTMLElement | null;
        if (btn) { btn.click(); console.log('Clique forçado em botão interno'); return; }
      }
      console.warn('Nenhuma estratégia de abertura funcionou');
    } catch (e) {
      console.error('Erro ao tentar abrir chat:', e);
    }
  };

  // Cria novo widget
  const criarNovoWidget = () => {
    arquivarWidgetAtual();
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    
    // Força reload para limpar estado
    setIsLoading(true);
    injetarWidget();
    setSidebarOpen(false);
    // Removido toast verde para evitar "pop" visual
  };

  // Seleciona widget arquivado
  const selecionarWidget = (widgetId: string) => {
    const lista = widgetsArquivados.map(w => ({ 
      ...w, 
      isActive: w.id === widgetId 
    }));
    persistirWidgets(lista);
    setSidebarOpen(false);
    
    // Não mostrar toast para UX mais limpa
  };

  // Deleta widget
  const deletarWidget = (widgetId: string) => {
    const lista = widgetsArquivados.filter(w => w.id !== widgetId);
    persistirWidgets(lista);
    if (conversaAtivaRef.current === widgetId) conversaAtivaRef.current = null;
  };

  // Formata timestamp
  const formatarTempo = (timestamp: number) => {
    const agora = Date.now();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    return `${dias}d`;
  };

  useEffect(() => {
    if (!id) {
      setError("ID do preview não encontrado");
      setIsLoading(false);
      return;
    }

    const loadScript = async () => {
      try {
        const script = await scriptService.getById(id);
        
        if (script) {
          setScriptData(script);
          return;
        }

        // Fallback localStorage
        const storedScripts = localStorage.getItem("chatbot-scripts");
        if (!storedScripts) {
          setError("Script não encontrado. O link pode estar expirado.");
          setIsLoading(false);
          return;
        }

        const scripts = JSON.parse(storedScripts);
        const localScript = scripts[id];
        
        if (!localScript) {
          setError("Script não encontrado para este ID.");
          setIsLoading(false);
          return;
        }

        setScriptData({
          ...localScript,
          script: localScript.script
        });
      } catch (err) {
        console.error("Error loading script:", err);
        setError(`Erro ao carregar o script: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
        setIsLoading(false);
      }
    };

    loadScript();
  }, [id]);

  // Injeta widget quando script carrega
  useEffect(() => {
    if (scriptData && !reinjetandoRef.current) {
      injetarWidget();
    }
  }, [scriptData, injetarWidget]);

  // Aplica limpeza contínua
  useEffect(() => {
    const interval = setInterval(() => {
      removerPopupsEBranding();
    }, 1000);

    return () => clearInterval(interval);
  }, [removerPopupsEBranding]);

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
          <div className="inline-block p-4 bg-card rounded-full shadow-lg mb-4">
            <MessageCircle className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Carregando Widget...</h1>
          <p className="text-muted-foreground">Preparando chatbot</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <Button 
          onClick={criarNovoWidget}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <Edit3 className="w-4 h-4" />
          Nova conversa
        </Button>
      </div>

      {/* Widgets List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Histórico</h3>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {widgetsArquivados.length === 0 && (
              <div className="text-center text-sm text-muted-foreground p-4">
                Nenhum widget arquivado
              </div>
            )}
            {widgetsArquivados.map((widget) => (
              <div
                key={widget.id}
                className={`group relative flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                  widget.isActive 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => selecionarWidget(widget.id)}
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{widget.titulo}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    ID: {widget.id.substring(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">
                    {formatarTempo(widget.criadoEm)}
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
                          deletarWidget(widget.id);
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

      {/* Footer sem Dify */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          Preview de Chat
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
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
          <h1 className="text-lg font-semibold">Preview do Chat</h1>
          <div className="w-9" />
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
                <h2 className="text-2xl font-bold text-foreground">Preview do Chat</h2>
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
                  <p>• Widget carregado e pronto</p>
                  <p>• Popups automáticos removidos</p>
                  <p>• Interface limpa</p>
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
                  {slugDetectado && <p>• Slug detectado: <span className="font-medium">{slugDetectado}</span></p>}
                  {debugFetches.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <p className="font-semibold text-foreground">Requisições:</p>
                      {debugFetches.map((f, i) => (
                        <p key={i} className="text-xs">
                          {new Date(f.at).toLocaleTimeString()} → {f.status || 'ERR'} {f.ok === false && '❌'}
                        </p>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="mt-2" onClick={forcarAbrirChat} disabled={forcandoAbertura}>
                    {forcandoAbertura ? 'Tentando...' : 'Forçar abrir chat'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 dark:bg-amber-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 dark:text-amber-400 mt-0.5">💡</div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Como usar
                  </h3>
                  <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <p>• O widget aparece automaticamente no canto inferior direito</p>
                    <p>• Use "Nova conversa" na sidebar para reiniciar o chat</p>
                    <p>• O histórico de widgets fica salvo na sidebar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
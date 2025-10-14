import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, Code2, User, Plus, Users, Database, HardDrive } from "lucide-react";
import { clientService, scriptService, getStorageStatus } from "@/services/database";
import { Client } from "@/types/database";

const ScriptInput = () => {
  const [script, setScript] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientSlug, setClientSlug] = useState(""); // Novo campo
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isNewClient, setIsNewClient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por -
      .replace(/^-+|-+$/g, '') // Remove - no início e fim
      .substring(0, 50); // Limita tamanho
  };

  // Gerar slug automaticamente quando nome muda
  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setClientName(name);
    if (isNewClient) {
      const autoSlug = generateSlug(name);
      setClientSlug(autoSlug);
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    loadClients();
    // Atualizar status do storage
    setStorageStatus(getStorageStatus());
  }, []);

  const loadClients = async () => {
    try {
      const clientList = await clientService.getAll();
      setClients(clientList);
      
      // Atualizar status após carregar dados
      setStorageStatus(getStorageStatus());
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Aviso",
        description: "Usando armazenamento local - dados salvos no navegador",
        variant: "default",
      });
    }
  };

  const generatePreview = async () => {
    if (!script.trim()) {
      toast({
        title: "Script vazio",
        description: "Por favor, cole o script do chatbot",
        variant: "destructive",
      });
      return;
    }

    if (isNewClient && !clientName.trim()) {
      toast({
        title: "Nome do cliente obrigatório",
        description: "Por favor, informe o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    if (isNewClient && !clientSlug.trim()) {
      toast({
        title: "Slug obrigatório",
        description: "Por favor, defina um slug para a URL do cliente",
        variant: "destructive",
      });
      return;
    }

    if (!isNewClient && !selectedClientId) {
      toast({
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente existente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let finalClientId = selectedClientId;
      let finalClientName = clientName;
      let finalClientSlug = clientSlug;

      // Se for novo cliente, criar primeiro
      if (isNewClient) {
        try {
          // Verificar se slug já existe
          const existingClient = await clientService.getBySlug(clientSlug);
          if (existingClient) {
            toast({
              title: "Slug já existe",
              description: `O slug "${clientSlug}" já está em uso. Por favor, escolha outro.`,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          finalClientId = await clientService.create({
            name: clientName,
            slug: clientSlug,
            email: clientEmail || undefined,
            company: clientCompany || undefined,
          });
          finalClientName = clientName;
          finalClientSlug = clientSlug;
          // Recarregar lista de clientes
          await loadClients();
        } catch (error) {
          toast({
            title: "Erro ao criar cliente",
            description: "Não foi possível cadastrar o cliente. Verifique sua conexão ou tente novamente.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } else {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        finalClientName = selectedClient?.name || "Cliente";
        finalClientSlug = selectedClient?.slug || "cliente";
      }

      // Criar script no banco
      let scriptId: string | null = null;
      try {
        scriptId = await scriptService.create({
          clientId: finalClientId,
          clientName: finalClientName,
          clientSlug: finalClientSlug,
          script: script,
          title: `Script - ${finalClientName}`,
        });
      } catch (error) {
        toast({
          title: "Erro ao criar script",
          description: "Não foi possível cadastrar o script. Verifique sua conexão ou tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate link com slug
      if (scriptId) {
        const link = `${window.location.origin}/${finalClientSlug}`;
        setGeneratedLink(link);

        toast({
          title: "Link criado com sucesso!",
          description: `URL personalizada: /${finalClientSlug}`,
        });
      }

      // Limpar campos se for novo cliente
      if (isNewClient) {
        setClientName("");
        setClientSlug("");
        setClientEmail("");
        setClientCompany("");
      }
      
    } catch (error) {
      console.error('Erro ao criar preview:', error);
      toast({
        title: "Aviso",
        description: "Dados salvos localmente - funcionando sem banco na nuvem",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const openPreview = () => {
    window.open(generatedLink, "_blank");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Gerenciar Clientes
          </Button>
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
          <Code2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Chatbot Preview
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cole o script do seu chatbot e gere um link isolado para testar e compartilhar
        </p>
        
        {/* Indicador de Storage */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
          {storageStatus.isBaserowConnected ? (
            <Database className="w-3 h-3 text-green-600" />
          ) : (
            <HardDrive className="w-3 h-3 text-blue-600" />
          )}
          {storageStatus.storageType}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 space-y-6 border border-border/50">
        {/* Seção Cliente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Informações do Cliente
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isNewClient ? "default" : "outline"}
                size="sm"
                onClick={() => setIsNewClient(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo Cliente
              </Button>
              <Button
                type="button"
                variant={!isNewClient ? "default" : "outline"}
                size="sm"
                onClick={() => setIsNewClient(false)}
              >
                <Users className="w-4 h-4 mr-1" />
                Cliente Existente
              </Button>
            </div>
          </div>

          {isNewClient ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome do cliente *"
                value={clientName}
                onChange={handleClientNameChange}
                className="col-span-1 md:col-span-2"
              />
              
              {/* Campo de Slug */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="slug-do-cliente *"
                    value={clientSlug}
                    onChange={(e) => setClientSlug(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setClientSlug(generateSlug(clientName))}
                    disabled={!clientName}
                    title="Gerar slug automaticamente"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
                {clientSlug && (
                  <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
                    <span className="font-medium">URL do cliente:</span>{" "}
                    <span className="font-mono text-primary">
                      {window.location.origin}/{clientSlug}
                    </span>
                  </div>
                )}
              </div>

              <Input
                placeholder="Email (opcional)"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <Input
                placeholder="Empresa (opcional)"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
              />
            </div>
          ) : (
            <select
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company && `- ${client.company}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Script do Chatbot
          </label>
          <div className="text-xs text-muted-foreground mb-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium mb-1">💡 Dicas importantes:</p>
            <ul className="space-y-1">
              <li>• Certifique-se de que o chatbot está ativo na plataforma</li>
              <li>• Verifique se o domínio está autorizado nas configurações</li>
              <li>• O widget pode demorar alguns segundos para aparecer</li>
              <li>• Use F12 para verificar o console em caso de erros</li>
            </ul>
          </div>
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder='<script>
  (function(e, t, n) {
    // Cole seu script aqui
  })(document);
</script>'
            className="min-h-[300px] font-mono text-sm resize-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <Button
          onClick={generatePreview}
          size="lg"
          variant="gradient"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Preview
            </>
          )}
        </Button>
      </div>

      {generatedLink && (
        <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 space-y-6 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Link Criado com Sucesso!</h2>
            <p className="text-muted-foreground">Seu chatbot está pronto para ser testado</p>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Link do Preview</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all border border-border/50">
                {generatedLink}
              </div>
              <Button onClick={copyLink} size="lg" variant="outline" className="shrink-0">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={openPreview} size="lg" variant="default" className="w-full">
              Abrir Preview
            </Button>
            <Button
              onClick={() => {
                setScript("");
                setGeneratedLink("");
                if (isNewClient) {
                  setClientName("");
                  setClientEmail("");
                  setClientCompany("");
                }
              }}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              Gerar Novo Link
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
              <div className="flex-1 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Dicas para usar o link:</p>
                <ul className="space-y-1">
                  <li>• Compartilhe este link com seu cliente</li>
                  <li>• Cada link gera uma sessão única de chat</li>
                  <li>• Clique em "Nova Conversa" no preview para reiniciar</li>
                  <li>• O chat funciona em qualquer dispositivo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptInput;
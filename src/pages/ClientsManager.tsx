import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, Trash2, Plus, ArrowLeft, Database, HardDrive } from "lucide-react";
import { clientService, scriptService, getStorageStatus } from "@/services/database";
import { Client, ChatScript } from "@/types/database";

const ClientsManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [scripts, setScripts] = useState<ChatScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientList, scriptList] = await Promise.all([
        clientService.getAll(),
        scriptService.getAll()
      ]);
      setClients(clientList);
      setScripts(scriptList);
      setStorageStatus(getStorageStatus());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Aviso",
        description: "Usando dados locais - sem conexão com banco na nuvem",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o cliente "${clientName}"? Isso também deletará todos os scripts associados.`)) {
      return;
    }

    try {
      // Deletar scripts do cliente primeiro
      const clientScripts = scripts.filter(s => s.clientId === clientId);
      await Promise.all(clientScripts.map(script => scriptService.delete(script.id)));
      
      // Deletar cliente
      await clientService.delete(clientId);
      
      toast({
        title: "Cliente deletado",
        description: `Cliente ${clientName} e seus scripts foram removidos`,
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cliente",
        variant: "destructive",
      });
    }
  };

  const getClientScripts = (clientId: string) => {
    return scripts.filter(script => script.clientId === clientId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gerenciar Clientes</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-muted-foreground">
                  {clients.length} cliente(s) • {scripts.length} script(s)
                </p>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                  {storageStatus.isFirebaseConnected ? (
                    <Database className="w-3 h-3 text-green-600" />
                  ) : (
                    <HardDrive className="w-3 h-3 text-blue-600" />
                  )}
                  {storageStatus.storageType}
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate("/")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Lista de Clientes */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro cliente e script
              </p>
              <Button onClick={() => navigate("/")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {clients.map((client) => {
              const clientScripts = getClientScripts(client.id);
              return (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          {client.name}
                        </CardTitle>
                        <CardDescription>
                          {client.company && `${client.company} • `}
                          {client.email && `${client.email} • `}
                          Criado em {client.createdAt.toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Scripts ({clientScripts.length})
                      </h4>
                      {clientScripts.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhum script criado ainda
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {clientScripts.map((script) => (
                            <div
                              key={script.id}
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{script.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Criado em {script.createdAt.toLocaleDateString('pt-BR')} às {script.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/preview/${script.id}`, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Preview
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsManager;
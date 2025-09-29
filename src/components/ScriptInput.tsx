import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, Code2 } from "lucide-react";

const ScriptInput = () => {
  const [script, setScript] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const generatePreview = () => {
    if (!script.trim()) {
      toast({
        title: "Script vazio",
        description: "Por favor, cole o script do chatbot",
        variant: "destructive",
      });
      return;
    }

    // Generate unique ID
    const id = Math.random().toString(36).substring(2, 15);
    
    // Store script in localStorage
    const storedScripts = localStorage.getItem("chatbot-scripts");
    const scripts = storedScripts ? JSON.parse(storedScripts) : {};
    scripts[id] = {
      script: script,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("chatbot-scripts", JSON.stringify(scripts));

    // Generate link
    const link = `${window.location.origin}/preview/${id}`;
    setGeneratedLink(link);

    toast({
      title: "Link gerado!",
      description: "Seu preview está pronto para ser compartilhado",
    });
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
          <Code2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Chatbot Preview
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cole o script do seu chatbot e gere um link isolado para testar e compartilhar
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 space-y-6 border border-border/50">
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
        >
          <Sparkles className="w-5 h-5" />
          Gerar Preview
        </Button>
      </div>

      {generatedLink && (
        <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 space-y-4 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-semibold text-foreground">Link Gerado</h2>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all border border-border/50">
              {generatedLink}
            </div>
            <Button onClick={copyLink} size="lg" variant="outline">
              <Copy className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={openPreview} size="lg" variant="default" className="flex-1">
              Abrir Preview
            </Button>
            <Button
              onClick={() => {
                setScript("");
                setGeneratedLink("");
              }}
              size="lg"
              variant="secondary"
              className="flex-1"
            >
              Novo Script
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptInput;
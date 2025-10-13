import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database, HardDrive } from "lucide-react";
import { isBaserowAvailable } from "@/lib/baserow";

export function ConfigStatus() {
  const isBaserow = isBaserowAvailable();
  
  // Verificar se todas as variáveis estão configuradas
  const envVars = {
    token: !!import.meta.env.VITE_BASEROW_API_TOKEN,
    baseUrl: !!import.meta.env.VITE_BASEROW_BASE_URL,
    dbId: !!import.meta.env.VITE_BASEROW_DATABASE_ID,
    clientsTable: !!import.meta.env.VITE_BASEROW_CLIENTS_TABLE_ID,
    scriptsTable: !!import.meta.env.VITE_BASEROW_SCRIPTS_TABLE_ID
  };

  const allConfigured = Object.values(envVars).every(v => v);
  const isProduction = import.meta.env.PROD;

  // Não mostrar nada se tudo estiver OK
  if (allConfigured && isBaserow) {
    return null;
  }

  // Mostrar alerta se estiver em produção e não configurado
  if (isProduction && !allConfigured) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>⚠️ Configuração Incompleta</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            As variáveis de ambiente não estão configuradas no Vercel!
          </p>
          <p className="text-sm mb-2">
            A aplicação está usando <strong>localStorage</strong> (dados salvos localmente no navegador).
          </p>
          <div className="mt-2 text-xs">
            <p className="font-semibold mb-1">Variáveis ausentes:</p>
            <ul className="list-disc list-inside">
              {!envVars.token && <li>VITE_BASEROW_API_TOKEN</li>}
              {!envVars.baseUrl && <li>VITE_BASEROW_BASE_URL</li>}
              {!envVars.dbId && <li>VITE_BASEROW_DATABASE_ID</li>}
              {!envVars.clientsTable && <li>VITE_BASEROW_CLIENTS_TABLE_ID</li>}
              {!envVars.scriptsTable && <li>VITE_BASEROW_SCRIPTS_TABLE_ID</li>}
            </ul>
          </div>
          <p className="mt-3 text-sm font-semibold">
            📖 Solução: Leia o arquivo <code className="bg-black/10 px-1 py-0.5 rounded">VERCEL_SETUP.md</code>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar info em desenvolvimento
  if (!isProduction && !isBaserow) {
    return (
      <Alert className="mb-4">
        <HardDrive className="h-4 w-4" />
        <AlertTitle>💾 Modo Local</AlertTitle>
        <AlertDescription>
          <p className="text-sm">
            Usando <strong>localStorage</strong>. Dados salvos localmente no navegador.
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            Configure o Baserow para persistência na nuvem.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar sucesso se Baserow estiver configurado
  if (isBaserow) {
    return (
      <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          ✅ Baserow Configurado
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p className="text-sm flex items-center gap-2">
            <Database className="h-3 w-3" />
            Dados persistentes na nuvem
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

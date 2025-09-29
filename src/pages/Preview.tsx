import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Preview = () => {
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const storedScripts = localStorage.getItem("chatbot-scripts");
    if (!storedScripts) return;

    try {
      const scripts = JSON.parse(storedScripts);
      const scriptData = scripts[id];
      
      if (!scriptData) {
        console.error("Script not found for ID:", id);
        return;
      }

      // Create a container for the script to execute in
      const scriptElement = document.createElement("div");
      scriptElement.innerHTML = scriptData.script;
      
      // Extract and execute the script
      const scriptTags = scriptElement.getElementsByTagName("script");
      if (scriptTags.length > 0) {
        const scriptContent = scriptTags[0].textContent || scriptTags[0].innerHTML;
        
        // Execute the script in a safe way
        const executeScript = new Function(scriptContent);
        executeScript();
      }
    } catch (error) {
      console.error("Error loading chatbot script:", error);
    }
  }, [id]);

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
};

export default Preview;

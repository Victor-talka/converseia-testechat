import ScriptInput from "@/components/ScriptInput";
import { ConfigStatus } from "@/components/ConfigStatus";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ConfigStatus />
        <ScriptInput />
      </div>
    </div>
  );
};

export default Index;

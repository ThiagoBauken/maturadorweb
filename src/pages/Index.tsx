
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Apenas redireciona quando o carregamento estiver completo
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Adicionado div com classe min-h-screen para garantir que ocupe toda a tela
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;

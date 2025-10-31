import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, ClipboardList } from "lucide-react";
import GerenciarCompeticoes from "@/components/admin/GerenciarCompeticoes";
import GerenciarResponsaveisOrganizador from "@/components/organizador/GerenciarResponsaveisOrganizador";
import VerInscricoesOrganizador from "@/components/organizador/VerInscricoesOrganizador";

export default function Organizador() {
  const [isOrganizador, setIsOrganizador] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkOrganizadorStatus();
  }, []);

  const checkOrganizadorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.nome);
      }

      // Verificar se é organizador ou admin
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["organizador", "admin"])
        .single();

      setIsOrganizador(!!data);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isOrganizador) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trophy className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Esta página é restrita a organizadores de eventos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Painel do Organizador
        </h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo, {userName}! Gerencie suas competições, responsáveis e inscrições
        </p>
      </div>

      <Tabs defaultValue="competicoes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competicoes">
            <Trophy className="h-4 w-4 mr-2" />
            Minhas Competições
          </TabsTrigger>
          <TabsTrigger value="responsaveis">
            <Users className="h-4 w-4 mr-2" />
            Responsáveis de Equipe
          </TabsTrigger>
          <TabsTrigger value="inscricoes">
            <ClipboardList className="h-4 w-4 mr-2" />
            Inscrições Recebidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competicoes" className="mt-6">
          <GerenciarCompeticoes />
        </TabsContent>

        <TabsContent value="responsaveis" className="mt-6">
          <GerenciarResponsaveisOrganizador />
        </TabsContent>

        <TabsContent value="inscricoes" className="mt-6">
          <VerInscricoesOrganizador />
        </TabsContent>
      </Tabs>
    </div>
  );
}

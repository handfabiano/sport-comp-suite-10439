import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, ClipboardList } from "lucide-react";
import MinhaEquipeResponsavel from "@/components/responsavel/MinhaEquipeResponsavel";
import MeusAtletasResponsavel from "@/components/responsavel/MeusAtletasResponsavel";
import InscricoesResponsavel from "@/components/responsavel/InscricoesResponsavel";

export default function Responsavel() {
  const [isResponsavel, setIsResponsavel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkResponsavelStatus();
  }, []);

  const checkResponsavelStatus = async () => {
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

      // Verificar se é responsável
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "responsavel")
        .single();

      setIsResponsavel(!!data);
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

  if (!isResponsavel) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Users className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Esta página é restrita a responsáveis de equipe.
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
          <Users className="h-8 w-8 text-primary" />
          Painel do Responsável
        </h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo, {userName}! Gerencie sua equipe, atletas e inscrições
        </p>
      </div>

      <Tabs defaultValue="equipe" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipe">
            <Users className="h-4 w-4 mr-2" />
            Minha Equipe
          </TabsTrigger>
          <TabsTrigger value="atletas">
            <UserPlus className="h-4 w-4 mr-2" />
            Meus Atletas
          </TabsTrigger>
          <TabsTrigger value="inscricoes">
            <ClipboardList className="h-4 w-4 mr-2" />
            Inscrições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipe" className="mt-6">
          <MinhaEquipeResponsavel />
        </TabsContent>

        <TabsContent value="atletas" className="mt-6">
          <MeusAtletasResponsavel />
        </TabsContent>

        <TabsContent value="inscricoes" className="mt-6">
          <InscricoesResponsavel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

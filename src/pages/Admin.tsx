import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GerenciarUsuarios from "@/components/admin/GerenciarUsuarios";
import GerenciarAtletas from "@/components/admin/GerenciarAtletas";
import GerenciarResponsaveis from "@/components/admin/GerenciarResponsaveis";
import GerenciarEquipes from "@/components/admin/GerenciarEquipes";
import GerenciarCompeticoes from "@/components/admin/GerenciarCompeticoes";
import GerenciarInscricoes from "@/components/admin/GerenciarInscricoes";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!data);
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Esta página é restrita a administradores do sistema.
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
          <Shield className="h-8 w-8 text-primary" />
          Painel de Administração
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os aspectos do sistema de competições esportivas
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="atletas">Atletas</TabsTrigger>
          <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
          <TabsTrigger value="equipes">Equipes</TabsTrigger>
          <TabsTrigger value="competicoes">Competições</TabsTrigger>
          <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-6">
          <GerenciarUsuarios />
        </TabsContent>

        <TabsContent value="atletas" className="mt-6">
          <GerenciarAtletas />
        </TabsContent>

        <TabsContent value="responsaveis" className="mt-6">
          <GerenciarResponsaveis />
        </TabsContent>

        <TabsContent value="equipes" className="mt-6">
          <GerenciarEquipes />
        </TabsContent>

        <TabsContent value="competicoes" className="mt-6">
          <GerenciarCompeticoes />
        </TabsContent>

        <TabsContent value="inscricoes" className="mt-6">
          <GerenciarInscricoes />
        </TabsContent>
      </Tabs>
    </div>
  );
}

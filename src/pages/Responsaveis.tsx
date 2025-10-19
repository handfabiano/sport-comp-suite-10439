import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ResponsavelForm } from "@/components/ResponsavelForm";
import { toast } from "sonner";
import { Mail, Phone, FileText, Trash2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Responsavel {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  documento?: string;
  foto_url?: string;
  ativo: boolean;
  equipes_count?: number;
}

export default function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResponsaveis = async () => {
    try {
      const { data, error } = await supabase
        .from("responsaveis")
        .select("*")
        .order("nome");

      if (error) throw error;

      // Buscar contagem de equipes para cada responsável
      const responsaveisWithCount = await Promise.all(
        (data || []).map(async (resp) => {
          const { count } = await supabase
            .from("user_roles")
            .select("*", { count: "exact", head: true })
            .eq("user_id", resp.user_id)
            .eq("role", "responsavel")
            .not("equipe_id", "is", null);

          return { ...resp, equipes_count: count || 0 };
        })
      );

      setResponsaveis(responsaveisWithCount);
    } catch (error: any) {
      console.error("Erro ao buscar responsáveis:", error);
      toast.error("Erro ao carregar responsáveis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  const handleDelete = async (id: string, userId: string) => {
    try {
      // Remover todas as atribuições de equipes
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "responsavel");

      if (rolesError) throw rolesError;

      // Remover responsável
      const { error } = await supabase
        .from("responsaveis")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Responsável removido com sucesso");
      fetchResponsaveis();
    } catch (error: any) {
      console.error("Erro ao remover responsável:", error);
      toast.error("Erro ao remover responsável");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Responsáveis</h1>
          <p className="text-muted-foreground">
            Gerencie os responsáveis pelas equipes
          </p>
        </div>
        <ResponsavelForm onSuccess={fetchResponsaveis} />
      </div>

      {responsaveis.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum responsável cadastrado ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {responsaveis.map((responsavel) => (
            <Card key={responsavel.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {responsavel.ativo ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover este responsável? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(responsavel.id, responsavel.user_id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={responsavel.foto_url} />
                    <AvatarFallback>
                      {responsavel.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{responsavel.nome}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{responsavel.equipes_count} equipe(s)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{responsavel.email}</span>
                  </div>
                  {responsavel.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{responsavel.telefone}</span>
                    </div>
                  )}
                  {responsavel.documento && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{responsavel.documento}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

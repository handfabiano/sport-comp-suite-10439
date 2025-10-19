import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Trophy, Plus } from "lucide-react";
import EquipeForm from "@/components/EquipeForm";

interface Equipe {
  id: string;
  nome: string;
  categoria: string;
  modalidade: string;
  logo_url?: string;
  cidade?: string;
  numero_atletas: number;
  evento?: {
    nome: string;
    data_inicio: string;
    data_fim: string;
    status: string;
  };
  estatisticas?: any;
}

export default function MinhasEquipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMinhasEquipes();
  }, []);

  const fetchMinhasEquipes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        navigate("/auth");
        return;
      }

      // Buscar IDs das equipes que o usuário é responsável
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("equipe_id")
        .eq("user_id", user.id)
        .eq("role", "responsavel")
        .not("equipe_id", "is", null);

      if (rolesError) throw rolesError;

      const equipeIds = roles.map((r) => r.equipe_id);

      if (equipeIds.length === 0) {
        setEquipes([]);
        setLoading(false);
        return;
      }

      // Buscar detalhes das equipes
      const { data: equipesData, error: equipesError } = await supabase
        .from("equipes")
        .select(`
          id,
          nome,
          categoria,
          modalidade,
          logo_url,
          cidade,
          numero_atletas,
          estatisticas,
          evento:eventos(nome, data_inicio, data_fim, status)
        `)
        .in("id", equipeIds)
        .order("nome");

      if (equipesError) throw equipesError;

      setEquipes(equipesData as any || []);
    } catch (error: any) {
      console.error("Erro ao buscar equipes:", error);
      toast.error("Erro ao carregar suas equipes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Minhas Equipes</h1>
          <p className="text-muted-foreground">
            Equipes que você é responsável
          </p>
        </div>
        <EquipeForm 
          onSuccess={fetchMinhasEquipes}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Equipe
            </Button>
          }
        />
      </div>

      {equipes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Você ainda não é responsável por nenhuma equipe
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipes.map((equipe) => {
            const stats = equipe.estatisticas as any;
            return (
              <Card
                key={equipe.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/equipes/${equipe.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {equipe.logo_url && (
                      <img
                        src={equipe.logo_url}
                        alt={equipe.nome}
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{equipe.nome}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{equipe.categoria}</Badge>
                        <Badge variant="outline">{equipe.modalidade}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {equipe.evento && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>{equipe.evento.nome}</span>
                    </div>
                  )}
                  {equipe.cidade && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{equipe.cidade}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{equipe.numero_atletas} atletas</span>
                  </div>
                  {stats && (
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="font-semibold text-green-600">
                            {stats.vitorias || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">V</div>
                        </div>
                        <div>
                          <div className="font-semibold text-yellow-600">
                            {stats.empates || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">E</div>
                        </div>
                        <div>
                          <div className="font-semibold text-red-600">
                            {stats.derrotas || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">D</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

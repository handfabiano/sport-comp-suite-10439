import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, CheckCircle } from "lucide-react";

interface InscricaoEquipeEventoProps {
  eventoId: string;
  evento: any;
}

interface Equipe {
  id: string;
  nome: string;
  logo_url: string | null;
  categoria: string;
}

interface Inscricao {
  equipe_id: string;
  categoria: string;
  status: string;
}

export default function InscricaoEquipeEvento({ eventoId, evento }: InscricaoEquipeEventoProps) {
  const { toast } = useToast();
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [selectedEquipe, setSelectedEquipe] = useState<string>("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMinhasEquipes();
    fetchInscricoes();
  }, [eventoId]);

  const fetchMinhasEquipes = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("equipe_id")
        .eq("user_id", userData.user.id)
        .eq("role", "responsavel");

      if (!roles || roles.length === 0) return;

      const equipeIds = roles.map(r => r.equipe_id).filter(Boolean);

      const { data, error } = await supabase
        .from("equipes")
        .select("id, nome, logo_url, categoria")
        .in("id", equipeIds)
        .eq("ativa", true);

      if (error) throw error;
      setEquipes(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar equipes:", error);
    }
  };

  const fetchInscricoes = async () => {
    try {
      const { data, error } = await supabase
        .from("inscricoes")
        .select("equipe_id, categoria, status")
        .eq("evento_id", eventoId);

      if (error) throw error;
      setInscricoes(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar inscrições:", error);
    }
  };

  const isEquipeInscrita = (equipeId: string) => {
    return inscricoes.some(i => i.equipe_id === equipeId);
  };

  const handleInscricao = async () => {
    if (!selectedEquipe || !selectedCategoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma equipe e uma categoria.",
        variant: "destructive",
      });
      return;
    }

    if (isEquipeInscrita(selectedEquipe)) {
      toast({
        title: "Equipe já inscrita",
        description: "Esta equipe já está inscrita neste evento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("inscricoes").insert([
        {
          equipe_id: selectedEquipe,
          evento_id: eventoId,
          categoria: selectedCategoria,
          status: "pendente",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Inscrição realizada",
        description: "A equipe foi inscrita no evento com sucesso.",
      });

      setSelectedEquipe("");
      setSelectedCategoria("");
      fetchInscricoes();
    } catch (error: any) {
      toast({
        title: "Erro ao inscrever equipe",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoriasDisponiveis = evento?.categorias || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Inscrever Equipe
        </CardTitle>
        <CardDescription>
          Inscreva suas equipes neste evento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {equipes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Você ainda não é responsável por nenhuma equipe
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a Equipe</label>
                <Select value={selectedEquipe} onValueChange={setSelectedEquipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id} disabled={isEquipeInscrita(equipe.id)}>
                        <div className="flex items-center gap-2">
                          {equipe.nome}
                          {isEquipeInscrita(equipe.id) && (
                            <Badge variant="secondary" className="ml-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Inscrita
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasDisponiveis.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleInscricao}
              disabled={loading || !selectedEquipe || !selectedCategoria}
              className="w-full"
            >
              {loading ? "Inscrevendo..." : "Inscrever Equipe"}
            </Button>

            {inscricoes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Equipes Inscritas</h4>
                <div className="space-y-2">
                  {inscricoes.map((inscricao) => {
                    const equipe = equipes.find(e => e.id === inscricao.equipe_id);
                    if (!equipe) return null;
                    
                    return (
                      <div
                        key={`${inscricao.equipe_id}-${inscricao.categoria}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {equipe.logo_url && (
                            <img
                              src={equipe.logo_url}
                              alt={equipe.nome}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{equipe.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {inscricao.categoria}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            inscricao.status === "aprovada"
                              ? "default"
                              : inscricao.status === "rejeitada"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {inscricao.status === "aprovada"
                            ? "Aprovada"
                            : inscricao.status === "rejeitada"
                            ? "Rejeitada"
                            : "Pendente"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

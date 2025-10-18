import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Trophy, Calendar, MapPin, Shirt, Phone } from "lucide-react";

interface Equipe {
  id: string;
  nome: string;
  logo_url: string | null;
  categoria: string;
  modalidade: string;
  tecnico: string | null;
  contato_tecnico: string | null;
  cidade: string | null;
  estadio_casa: string | null;
  ano_fundacao: number | null;
  numero_atletas: number;
  limite_atletas: number | null;
  uniforme_principal: any;
  uniforme_alternativo: any;
  estatisticas: any;
  eventos: {
    nome: string;
    banner_url: string | null;
    data_inicio: string;
    data_fim: string;
  } | null;
}

interface Atleta {
  id: string;
  nome: string;
  foto_url: string | null;
  numero_uniforme: number | null;
  posicao: string | null;
  categoria: string;
}

const EquipeDetalhes = () => {
  const { id } = useParams();
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipe();
    fetchAtletas();
  }, [id]);

  const fetchEquipe = async () => {
    try {
      const { data, error } = await supabase
        .from("equipes")
        .select(`
          *,
          eventos:evento_id (
            nome,
            banner_url,
            data_inicio,
            data_fim
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setEquipe(data);
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtletas = async () => {
    try {
      const { data, error } = await supabase
        .from("atletas")
        .select("id, nome, foto_url, numero_uniforme, posicao, categoria")
        .eq("equipe_id", id)
        .order("numero_uniforme", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setAtletas(data || []);
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!equipe) {
    return (
      <div className="container mx-auto p-6">
        <p>Equipe não encontrada.</p>
      </div>
    );
  }

  const stats = equipe.estatisticas || {};
  const pontos = (stats.vitorias || 0) * 3 + (stats.empates || 0);
  const jogos = (stats.vitorias || 0) + (stats.empates || 0) + (stats.derrotas || 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Link to="/equipes">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={equipe.logo_url || ""} alt={equipe.nome} />
                <AvatarFallback>{equipe.nome[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl font-bold">{equipe.nome}</h1>
                <div className="flex gap-2 mt-2 justify-center flex-wrap">
                  <Badge>{equipe.categoria}</Badge>
                  <Badge variant="outline">{equipe.modalidade}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {equipe.eventos && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/eventos/${equipe.eventos.nome}`}>
                  <div className="flex items-center gap-4 hover:bg-accent p-4 rounded-lg transition-colors">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={equipe.eventos.banner_url || ""} />
                      <AvatarFallback>{equipe.eventos.nome[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{equipe.eventos.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(equipe.eventos.data_inicio).toLocaleDateString("pt-BR")} - {new Date(equipe.eventos.data_fim).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{pontos}</p>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{jogos}</p>
                  <p className="text-sm text-muted-foreground">Jogos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.vitorias || 0}</p>
                  <p className="text-sm text-muted-foreground">Vitórias</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.empates || 0}</p>
                  <p className="text-sm text-muted-foreground">Empates</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.derrotas || 0}</p>
                  <p className="text-sm text-muted-foreground">Derrotas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.gols_pro || 0}</p>
                  <p className="text-sm text-muted-foreground">Gols Pró</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.gols_contra || 0}</p>
                  <p className="text-sm text-muted-foreground">Gols Contra</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{(stats.gols_pro || 0) - (stats.gols_contra || 0)}</p>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipe.tecnico && (
                <div>
                  <p className="text-sm text-muted-foreground">Técnico</p>
                  <p className="font-semibold">{equipe.tecnico}</p>
                </div>
              )}
              {equipe.contato_tecnico && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${equipe.contato_tecnico}`} className="hover:underline">
                    {equipe.contato_tecnico}
                  </a>
                </div>
              )}
              {equipe.cidade && (
                <div>
                  <p className="text-sm text-muted-foreground">Cidade</p>
                  <p>{equipe.cidade}</p>
                </div>
              )}
              {equipe.estadio_casa && (
                <div>
                  <p className="text-sm text-muted-foreground">Estádio</p>
                  <p>{equipe.estadio_casa}</p>
                </div>
              )}
              {equipe.ano_fundacao && (
                <div>
                  <p className="text-sm text-muted-foreground">Ano de Fundação</p>
                  <p>{equipe.ano_fundacao}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Atletas</p>
                <p>{equipe.numero_atletas} {equipe.limite_atletas ? `/ ${equipe.limite_atletas}` : ""}</p>
              </div>
            </CardContent>
          </Card>

          {(equipe.uniforme_principal || equipe.uniforme_alternativo) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Uniformes
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {equipe.uniforme_principal && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Principal</p>
                    <div className="flex gap-2">
                      {equipe.uniforme_principal.cor_primaria && (
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: equipe.uniforme_principal.cor_primaria }}
                        />
                      )}
                      {equipe.uniforme_principal.cor_secundaria && (
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: equipe.uniforme_principal.cor_secundaria }}
                        />
                      )}
                    </div>
                  </div>
                )}
                {equipe.uniforme_alternativo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Alternativo</p>
                    <div className="flex gap-2">
                      {equipe.uniforme_alternativo.cor_primaria && (
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: equipe.uniforme_alternativo.cor_primaria }}
                        />
                      )}
                      {equipe.uniforme_alternativo.cor_secundaria && (
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: equipe.uniforme_alternativo.cor_secundaria }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Elenco ({atletas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {atletas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum atleta cadastrado nesta equipe.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atletas.map((atleta) => (
                <Link key={atleta.id} to={`/atletas/${atleta.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={atleta.foto_url || ""} />
                        <AvatarFallback>{atleta.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{atleta.nome}</p>
                        <div className="flex gap-2 mt-1">
                          {atleta.numero_uniforme && (
                            <Badge variant="secondary" className="text-xs">
                              #{atleta.numero_uniforme}
                            </Badge>
                          )}
                          {atleta.posicao && (
                            <Badge variant="outline" className="text-xs">
                              {atleta.posicao}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipeDetalhes;

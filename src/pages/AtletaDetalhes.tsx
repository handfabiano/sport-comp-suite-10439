import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Heart, Activity, Users } from "lucide-react";

interface Atleta {
  id: string;
  nome: string;
  foto_url: string | null;
  data_nascimento: string | null;
  categoria: string;
  posicao: string | null;
  numero_uniforme: number | null;
  altura: number | null;
  peso: number | null;
  pe_dominante: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  equipe_id: string | null;
  tipo_sanguineo: string | null;
  alergias: string | null;
  medicamentos: string | null;
  clubes_anteriores: string[];
  equipes: {
    nome: string;
    logo_url: string | null;
    categoria: string;
    eventos: {
      nome: string;
      banner_url: string | null;
    };
  } | null;
}

const AtletaDetalhes = () => {
  const { id } = useParams();
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtleta();
  }, [id]);

  const fetchAtleta = async () => {
    try {
      const { data, error } = await supabase
        .from("atletas")
        .select(`
          *,
          equipes:equipe_id (
            nome,
            logo_url,
            categoria,
            eventos:evento_id (
              nome,
              banner_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAtleta(data);
    } catch (error) {
      console.error("Erro ao buscar atleta:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!atleta) {
    return (
      <div className="container mx-auto p-6">
        <p>Atleta não encontrado.</p>
      </div>
    );
  }

  const idade = calcularIdade(atleta.data_nascimento);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Link to="/atletas">
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
                <AvatarImage src={atleta.foto_url || ""} alt={atleta.nome} />
                <AvatarFallback>{atleta.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl font-bold">{atleta.nome}</h1>
                {atleta.numero_uniforme && (
                  <Badge variant="secondary" className="mt-2">
                    #{atleta.numero_uniforme}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge>{atleta.categoria}</Badge>
                {atleta.posicao && <Badge variant="outline">{atleta.posicao}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {atleta.equipes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/equipes/${atleta.equipe_id}`}>
                  <div className="flex items-center gap-4 hover:bg-accent p-4 rounded-lg transition-colors">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={atleta.equipes.logo_url || ""} />
                      <AvatarFallback>{atleta.equipes.nome[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{atleta.equipes.nome}</h3>
                      <p className="text-sm text-muted-foreground">{atleta.equipes.categoria}</p>
                      {atleta.equipes.eventos && (
                        <p className="text-sm text-muted-foreground">{atleta.equipes.eventos.nome}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Dados Físicos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {idade && (
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-semibold">{idade} anos</p>
                </div>
              )}
              {atleta.altura && (
                <div>
                  <p className="text-sm text-muted-foreground">Altura</p>
                  <p className="font-semibold">{atleta.altura}m</p>
                </div>
              )}
              {atleta.peso && (
                <div>
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="font-semibold">{atleta.peso}kg</p>
                </div>
              )}
              {atleta.pe_dominante && (
                <div>
                  <p className="text-sm text-muted-foreground">Pé Dominante</p>
                  <p className="font-semibold capitalize">{atleta.pe_dominante}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atleta.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${atleta.email}`} className="hover:underline">
                    {atleta.email}
                  </a>
                </div>
              )}
              {atleta.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${atleta.telefone}`} className="hover:underline">
                    {atleta.telefone}
                  </a>
                </div>
              )}
              {(atleta.cidade || atleta.estado) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[atleta.cidade, atleta.estado].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {atleta.data_nascimento && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(atleta.data_nascimento).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(atleta.tipo_sanguineo || atleta.alergias || atleta.medicamentos) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Informações Médicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {atleta.tipo_sanguineo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo Sanguíneo</p>
                    <p className="font-semibold">{atleta.tipo_sanguineo}</p>
                  </div>
                )}
                {atleta.alergias && (
                  <div>
                    <p className="text-sm text-muted-foreground">Alergias</p>
                    <p>{atleta.alergias}</p>
                  </div>
                )}
                {atleta.medicamentos && (
                  <div>
                    <p className="text-sm text-muted-foreground">Medicamentos</p>
                    <p>{atleta.medicamentos}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {atleta.clubes_anteriores && atleta.clubes_anteriores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clubes Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {atleta.clubes_anteriores.map((clube, index) => (
                    <Badge key={index} variant="secondary">
                      {clube}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtletaDetalhes;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, MapPin, Calendar, Activity } from "lucide-react";
import AtletaForm from "@/components/AtletaForm";

interface Atleta {
  id: string;
  nome: string;
  documento: string;
  categoria: string;
  foto_url: string | null;
  numero_uniforme: number | null;
  posicao: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  altura: number | null;
  peso: number | null;
  ativo: boolean | null;
  equipes?: { nome: string } | null;
}

export default function Atletas() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtletas();
  }, []);

  const fetchAtletas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("atletas")
      .select(`
        *,
        equipes (nome)
      `)
      .order("nome");

    if (!error && data) {
      setAtletas(data);
    }
    setLoading(false);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Atletas</h1>
          <p className="text-muted-foreground">
            Cadastro completo e gerenciamento de atletas
          </p>
        </div>
        <AtletaForm onSuccess={fetchAtletas} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : atletas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum atleta cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando atletas ao sistema
            </p>
            <AtletaForm onSuccess={fetchAtletas} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {atletas.map((atleta) => {
            const idade = calcularIdade(atleta.data_nascimento);
            return (
              <Link key={atleta.id} to={`/atletas/${atleta.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group">
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20 group-hover:ring-primary transition-all flex-shrink-0">
                      <AvatarImage src={atleta.foto_url || undefined} alt={atleta.nome} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                        {atleta.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors leading-tight">
                            {atleta.nome}
                          </h3>
                          {atleta.numero_uniforme && (
                            <Badge className="bg-gradient-primary flex-shrink-0">
                              #{atleta.numero_uniforme}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-xs">{atleta.categoria}</Badge>
                          {atleta.ativo === false && (
                            <Badge variant="secondary" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                      </div>

                      {atleta.posicao && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.posicao}</span>
                        </div>
                      )}

                      {atleta.equipes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.equipes.nome}</span>
                        </div>
                      )}

                      {idade !== null && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{idade} anos</span>
                        </div>
                      )}

                      {(atleta.altura || atleta.peso) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {atleta.altura && `${atleta.altura}m`}
                            {atleta.altura && atleta.peso && " • "}
                            {atleta.peso && `${atleta.peso}kg`}
                          </span>
                        </div>
                      )}

                      {atleta.cidade && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.cidade}</span>
                        </div>
                      )}

                      {atleta.telefone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.telefone}</span>
                        </div>
                      )}

                      {atleta.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

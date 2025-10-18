import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users2, Users, MapPin, Trophy, Shirt, Phone } from "lucide-react";
import EquipeForm from "@/components/EquipeForm";

interface Equipe {
  id: string;
  nome: string;
  tecnico: string | null;
  modalidade: string;
  categoria: string;
  uniforme_cor: string | null;
  uniforme_principal?: any;
  cidade?: string;
  numero_atletas?: number;
  ativa?: boolean;
  contato_tecnico?: string;
  eventos?: { nome: string };
}

export default function Equipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipes")
      .select(`
        *,
        eventos (nome)
      `)
      .order("nome");

    if (!error && data) {
      setEquipes(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Equipes</h1>
          <p className="text-muted-foreground">
            Gerencie as equipes com configurações completas e personalizadas
          </p>
        </div>
        <EquipeForm onSuccess={fetchEquipes} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : equipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma equipe cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira equipe
            </p>
            <EquipeForm onSuccess={fetchEquipes} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipes.map((equipe) => (
            <Link key={equipe.id} to={`/equipes/${equipe.id}`}>
              <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group">
              <div 
                className="h-2" 
                style={{ 
                  background: equipe.uniforme_principal?.cor_primaria 
                    ? `linear-gradient(90deg, ${equipe.uniforme_principal.cor_primaria}, ${equipe.uniforme_principal.cor_secundaria || equipe.uniforme_principal.cor_primaria})` 
                    : 'var(--gradient-primary)' 
                }}
              />
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {equipe.nome}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {equipe.modalidade}
                    </Badge>
                    {!equipe.ativa && (
                      <Badge variant="secondary">Inativa</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {equipe.eventos?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 flex-shrink-0" />
                  <span>Categoria: {equipe.categoria}</span>
                </div>

                {equipe.tecnico && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>Técnico: {equipe.tecnico}</span>
                  </div>
                )}

                {equipe.cidade && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{equipe.cidade}</span>
                  </div>
                )}

                {equipe.contato_tecnico && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{equipe.contato_tecnico}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {equipe.uniforme_principal?.cor_primaria && (
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border shadow-sm"
                          style={{ backgroundColor: equipe.uniforme_principal.cor_primaria }}
                          title="Uniforme Principal"
                        />
                        {equipe.uniforme_principal.cor_secundaria && (
                          <div
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: equipe.uniforme_principal.cor_secundaria }}
                            title="Cor Secundária"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {equipe.numero_atletas !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {equipe.numero_atletas} atletas
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

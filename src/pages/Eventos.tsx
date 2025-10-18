import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventoForm from "@/components/EventoForm";

interface Evento {
  id: string;
  nome: string;
  descricao: string | null;
  local: string;
  modalidade: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  categorias: string[];
  tipo_competicao?: string;
  valor_inscricao?: string | number;
  patrocinadores?: string[];
  redes_sociais?: any;
}

const statusColors = {
  inscricoes_abertas: "bg-accent",
  em_andamento: "bg-info",
  finalizado: "bg-muted",
  cancelado: "bg-destructive",
};

const statusLabels = {
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data_inicio", { ascending: false });

    if (!error && data) {
      setEventos(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos esportivos com configurações personalizadas
          </p>
        </div>
        <EventoForm onSuccess={fetchEventos} />
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
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro evento esportivo
            </p>
            <EventoForm onSuccess={fetchEventos} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <Card
              key={evento.id}
              className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
            >
              <div className="h-2 bg-gradient-primary" />
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {evento.nome}
                  </CardTitle>
                  <Badge className={statusColors[evento.status as keyof typeof statusColors]}>
                    {statusLabels[evento.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {evento.descricao || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{evento.local}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {format(new Date(evento.data_inicio), "dd MMM", { locale: ptBR })} -{" "}
                    {format(new Date(evento.data_fim), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 flex-shrink-0" />
                  <span className="capitalize">{evento.tipo_competicao?.replace(/_/g, ' ')}</span>
                </div>

                {evento.valor_inscricao && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>R$ {parseFloat(String(evento.valor_inscricao)).toFixed(2)}</span>
                  </div>
                )}

                {evento.categorias && evento.categorias.length > 0 && (
                  <div className="flex items-start gap-2 pt-2">
                    <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {evento.categorias.slice(0, 3).map((cat: string) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {evento.categorias.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{evento.categorias.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

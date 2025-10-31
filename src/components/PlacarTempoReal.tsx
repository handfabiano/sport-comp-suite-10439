import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Calendar, MapPin, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Partida {
  id: string;
  data_partida: string;
  local: string;
  fase: string;
  placar_a: number;
  placar_b: number;
  finalizada: boolean;
  categoria: string;
  equipe_a: { nome: string; logo_url: string | null };
  equipe_b: { nome: string; logo_url: string | null };
  evento: { nome: string };
}

export default function PlacarTempoReal() {
  const [partidasAoVivo, setPartidasAoVivo] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartidasAoVivo();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("partidas-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "partidas",
        },
        (payload) => {
          console.log("Partida atualizada:", payload);
          fetchPartidasAoVivo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPartidasAoVivo = async () => {
    setLoading(true);
    const agora = new Date();
    const umDiaAntes = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(nome, logo_url),
        equipe_b:equipe_b_id(nome, logo_url),
        evento:evento_id(nome)
      `)
      .eq("finalizada", false)
      .gte("data_partida", umDiaAntes.toISOString())
      .lte("data_partida", agora.toISOString())
      .order("data_partida", { ascending: false })
      .limit(5);

    if (!error && data) {
      setPartidasAoVivo(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Partidas ao Vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (partidasAoVivo.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Partidas ao Vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <p>Nenhuma partida acontecendo no momento</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPartidasAoVivo}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Partidas ao Vivo
            <Badge className="bg-green-500 ml-2">{partidasAoVivo.length}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPartidasAoVivo}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {partidasAoVivo.map((partida) => (
          <div
            key={partida.id}
            className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">{partida.evento.nome}</span>
              <Badge variant="outline">{partida.fase}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 text-center space-y-1">
                <p className="font-semibold">{partida.equipe_a?.nome ?? 'Equipe A'}</p>
                <p className="text-3xl font-bold text-primary">
                  {partida.placar_a ?? 0}
                </p>
              </div>

              <div className="px-4">
                <div className="flex flex-col items-center gap-1">
                  <Badge className="bg-green-500 animate-pulse">AO VIVO</Badge>
                  <span className="text-xl font-bold text-muted-foreground">×</span>
                </div>
              </div>

              <div className="flex-1 text-center space-y-1">
                <p className="font-semibold">{partida.equipe_b?.nome ?? 'Equipe B'}</p>
                <p className="text-3xl font-bold text-primary">
                  {partida.placar_b ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(partida.data_partida), "HH:mm", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {partida.local}
              </div>
              <Badge variant="secondary" className="text-xs">
                {partida.categoria}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

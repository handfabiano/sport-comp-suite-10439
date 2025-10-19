import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Medal, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Ranking {
  id: string;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  categoria: string;
  equipes: { nome: string; logo_url: string | null } | null;
  evento: { nome: string } | null;
}

export default function Rankings() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("todos");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todos");

  useEffect(() => {
    fetchEventos();
    fetchRankings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("rankings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rankings",
        },
        () => {
          fetchRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoSelecionado, categoriaSelecionada]);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from("eventos")
      .select("id, nome, categorias")
      .order("data_inicio", { ascending: false });

    if (data) {
      setEventos(data);
      
      // Extract unique categories
      const allCategorias = new Set<string>();
      data.forEach(evento => {
        evento.categorias?.forEach((cat: string) => allCategorias.add(cat));
      });
      setCategorias(Array.from(allCategorias));
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    
    let query = supabase
      .from("rankings")
      .select(`
        *,
        equipes:equipe_id(nome, logo_url),
        evento:evento_id(nome)
      `);

    if (eventoSelecionado !== "todos") {
      query = query.eq("evento_id", eventoSelecionado);
    }

    if (categoriaSelecionada !== "todos") {
      query = query.eq("categoria", categoriaSelecionada);
    }

    const { data } = await query.order("pontos", { ascending: false });

    if (data) {
      setRankings(data as any);
    }
    setLoading(false);
  };

  const getPosicaoBadge = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">{index + 1}º</span>;
  };

  const getJogos = (rank: Ranking) => rank.vitorias + rank.empates + rank.derrotas;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Rankings</h1>
          <p className="text-muted-foreground">
            Classificações atualizadas automaticamente após cada partida
          </p>
        </div>
        <Badge className="bg-green-500">Atualização Automática</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={eventoSelecionado} onValueChange={setEventoSelecionado}>
              <SelectTrigger className="w-full md:w-[250px]">
                <Trophy className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os eventos</SelectItem>
                {eventos.map((evento) => (
                  <SelectItem key={evento.id} value={evento.id}>
                    {evento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : rankings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Medal className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ranking disponível</h3>
            <p className="text-muted-foreground text-center mb-4">
              Os rankings serão gerados automaticamente quando as partidas forem finalizadas
            </p>
            <p className="text-sm text-muted-foreground">
              Finalize partidas para ver as classificações aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Classificação
              {categoriaSelecionada !== "todos" && (
                <Badge variant="outline">{categoriaSelecionada}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold w-16">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Equipe</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">PTS</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">J</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">V</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">E</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">D</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">GP</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">GC</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">SG</th>
                    {eventoSelecionado === "todos" && (
                      <th className="px-6 py-4 text-left text-sm font-semibold">Evento</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rankings.map((rank, index) => (
                    <tr
                      key={rank.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        index < 4 ? "bg-green-50/50 dark:bg-green-950/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {getPosicaoBadge(index)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {rank.equipes?.logo_url && (
                            <img
                              src={rank.equipes.logo_url}
                              alt={rank.equipes.nome}
                              className="h-8 w-8 object-contain rounded"
                            />
                          )}
                          <span className="font-semibold">{rank.equipes?.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-lg text-primary">
                          {rank.pontos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {getJogos(rank)}
                      </td>
                      <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">
                        {rank.vitorias}
                      </td>
                      <td className="px-6 py-4 text-center text-yellow-600 dark:text-yellow-400 font-semibold">
                        {rank.empates}
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-semibold">
                        {rank.derrotas}
                      </td>
                      <td className="px-6 py-4 text-center">{rank.gols_pro}</td>
                      <td className="px-6 py-4 text-center">{rank.gols_contra}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {rank.saldo_gols > 0 && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {rank.saldo_gols < 0 && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-semibold">{rank.saldo_gols}</span>
                        </div>
                      </td>
                      {eventoSelecionado === "todos" && (
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {rank.evento?.nome}
                          </Badge>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><span className="font-semibold">PTS:</span> Pontos</div>
            <div><span className="font-semibold">J:</span> Jogos</div>
            <div><span className="font-semibold">V:</span> Vitórias</div>
            <div><span className="font-semibold">E:</span> Empates</div>
            <div><span className="font-semibold">D:</span> Derrotas</div>
            <div><span className="font-semibold">GP:</span> Gols Pró</div>
            <div><span className="font-semibold">GC:</span> Gols Contra</div>
            <div><span className="font-semibold">SG:</span> Saldo de Gols</div>
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-green-600 dark:text-green-400">
                Classificação Automática:
              </span>{" "}
              Os rankings são atualizados em tempo real sempre que uma partida é finalizada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

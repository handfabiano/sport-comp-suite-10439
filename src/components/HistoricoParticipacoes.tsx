import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trophy, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

interface HistoricoParticipacaoProps {
  equipeId: string;
}

interface Participacao {
  id: string;
  evento: {
    id: string;
    nome: string;
    local: string;
    data_inicio: string;
    data_fim: string;
    status: string;
  };
  categoria: string;
  status: string;
  data_inscricao: string;
  ranking?: {
    pontos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    gols_pro: number;
    gols_contra: number;
    saldo_gols: number;
  };
}

export default function HistoricoParticipacoes({ equipeId }: HistoricoParticipacaoProps) {
  const [participacoes, setParticipacoes] = useState<Participacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, [equipeId]);

  const fetchHistorico = async () => {
    try {
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from("inscricoes")
        .select(`
          id,
          categoria,
          status,
          data_inscricao,
          evento:eventos(id, nome, local, data_inicio, data_fim, status)
        `)
        .eq("equipe_id", equipeId)
        .order("data_inscricao", { ascending: false });

      if (inscricoesError) throw inscricoesError;

      // Buscar rankings para cada evento
      const participacoesComRanking = await Promise.all(
        (inscricoes || []).map(async (inscricao: any) => {
          const { data: ranking } = await supabase
            .from("rankings")
            .select("pontos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols")
            .eq("equipe_id", equipeId)
            .eq("evento_id", inscricao.evento.id)
            .eq("categoria", inscricao.categoria)
            .maybeSingle();

          return {
            ...inscricao,
            ranking: ranking || undefined,
          };
        })
      );

      setParticipacoes(participacoesComRanking);
    } catch (error: any) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar histórico de participações");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendente: { label: "Pendente", variant: "secondary" },
      aprovada: { label: "Aprovada", variant: "default" },
      rejeitada: { label: "Rejeitada", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getEventoStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      inscricoes_abertas: { label: "Inscrições Abertas", variant: "default" },
      em_andamento: { label: "Em Andamento", variant: "secondary" },
      finalizado: { label: "Finalizado", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (participacoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Histórico de Participações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhuma participação em eventos ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Histórico de Participações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {participacoes.map((participacao) => (
            <Card key={participacao.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{participacao.evento.nome}</CardTitle>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {participacao.evento.local}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(participacao.evento.data_inicio).toLocaleDateString("pt-BR")} a{" "}
                        {new Date(participacao.evento.data_fim).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(participacao.status)}
                    {getEventoStatusBadge(participacao.evento.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Categoria:</strong> {participacao.categoria}
                  </p>
                  <p className="text-sm">
                    <strong>Data de Inscrição:</strong>{" "}
                    {new Date(participacao.data_inscricao).toLocaleDateString("pt-BR")}
                  </p>
                  
                  {participacao.ranking && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Desempenho</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pts</TableHead>
                            <TableHead>V</TableHead>
                            <TableHead>E</TableHead>
                            <TableHead>D</TableHead>
                            <TableHead>GP</TableHead>
                            <TableHead>GC</TableHead>
                            <TableHead>SG</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-semibold">{participacao.ranking.pontos}</TableCell>
                            <TableCell className="text-green-600">{participacao.ranking.vitorias}</TableCell>
                            <TableCell className="text-yellow-600">{participacao.ranking.empates}</TableCell>
                            <TableCell className="text-red-600">{participacao.ranking.derrotas}</TableCell>
                            <TableCell>{participacao.ranking.gols_pro}</TableCell>
                            <TableCell>{participacao.ranking.gols_contra}</TableCell>
                            <TableCell>{participacao.ranking.saldo_gols}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DataTable, { Column } from "@/components/shared/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Send, Check, X, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: string;
  inscrito: boolean;
}

interface MinhaInscricao {
  id: string;
  evento_nome: string;
  status: string;
  created_at: string;
  evento_data_inicio: string;
}

export default function InscricoesResponsavel() {
  const [eventosDisponiveis, setEventosDisponiveis] = useState<Evento[]>([]);
  const [minhasInscricoes, setMinhasInscricoes] = useState<MinhaInscricao[]>([]);
  const [loading, setLoading] = useState(false);
  const [equipeId, setEquipeId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar equipe do responsável
      const { data: equipe, error: equipeError } = await supabase
        .from("equipes")
        .select("id")
        .eq("responsavel_id", user.id)
        .maybeSingle();

      if (equipeError && equipeError.code !== "PGRST116") throw equipeError;

      if (!equipe) {
        setEquipeId(null);
        return;
      }

      setEquipeId(equipe.id);

      // Buscar eventos com inscrições abertas
      const { data: eventos, error: eventosError } = await supabase
        .from("eventos")
        .select("*")
        .eq("status", "inscricoes_abertas")
        .order("data_inicio");

      if (eventosError) throw eventosError;

      // Buscar inscrições já feitas
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from("inscricoes")
        .select("evento_id")
        .eq("equipe_id", equipe.id);

      if (inscricoesError) throw inscricoesError;

      const eventosInscritos = new Set(inscricoes?.map(i => i.evento_id) || []);

      const eventosComStatus = eventos?.map(e => ({
        ...e,
        inscrito: eventosInscritos.has(e.id),
      })) || [];

      setEventosDisponiveis(eventosComStatus);

      // Buscar minhas inscrições
      const { data: minhasInscricoesData, error: minhasInscricoesError } = await supabase
        .from("inscricoes")
        .select(`
          id,
          status,
          created_at,
          eventos (
            nome,
            data_inicio
          )
        `)
        .eq("equipe_id", equipe.id)
        .order("created_at", { ascending: false });

      if (minhasInscricoesError) throw minhasInscricoesError;

      const inscricoesFormatadas = minhasInscricoesData?.map((i: any) => ({
        id: i.id,
        evento_nome: i.eventos?.nome || "N/A",
        evento_data_inicio: i.eventos?.data_inicio || "",
        status: i.status,
        created_at: i.created_at,
      })) || [];

      setMinhasInscricoes(inscricoesFormatadas);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInscrever = async (eventoId: string, eventoNome: string) => {
    if (!equipeId) {
      toast.error("Você precisa ter uma equipe");
      return;
    }

    if (!confirm(`Deseja inscrever sua equipe em "${eventoNome}"?`)) return;

    try {
      // Buscar equipe para obter categoria
      const { data: equipe, error: equipeError } = await supabase
        .from("equipes")
        .select("categoria")
        .eq("id", equipeId)
        .single();

      if (equipeError) throw equipeError;

      const { error } = await supabase
        .from("inscricoes")
        .insert({
          equipe_id: equipeId,
          evento_id: eventoId,
          status: "pendente",
          categoria: equipe.categoria,
        });

      if (error) throw error;

      toast.success("Inscrição enviada! Aguarde aprovação do organizador.");
      fetchData();
    } catch (error: any) {
      console.error("Erro ao fazer inscrição:", error);
      toast.error("Erro ao fazer inscrição: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pendente: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      aprovada: { label: "Aprovada", variant: "default" as const, icon: Check },
      rejeitada: { label: "Rejeitada", variant: "destructive" as const, icon: X },
    };

    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pendente;

    return (
      <Badge variant={variant}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const colunasDisponiveis: Column<Evento>[] = [
    {
      header: "Competição",
      accessor: "nome"
    },
    {
      header: "Local",
      accessor: "local"
    },
    {
      header: "Data Início",
      accessor: (row) => new Date(row.data_inicio).toLocaleDateString("pt-BR")
    },
    {
      header: "Data Fim",
      accessor: (row) => new Date(row.data_fim).toLocaleDateString("pt-BR")
    },
    {
      header: "Ação",
      accessor: (row) => (
        row.inscrito ? (
          <Badge variant="outline">Já Inscrito</Badge>
        ) : (
          <Button
            size="sm"
            onClick={() => handleInscrever(row.id, row.nome)}
          >
            <Send className="h-4 w-4 mr-1" />
            Inscrever
          </Button>
        )
      ),
    },
  ];

  const colunasMinhas: Column<MinhaInscricao>[] = [
    {
      header: "Competição",
      accessor: "evento_nome"
    },
    {
      header: "Data da Competição",
      accessor: (row) => row.evento_data_inicio
        ? new Date(row.evento_data_inicio).toLocaleDateString("pt-BR")
        : "-"
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status)
    },
    {
      header: "Data da Inscrição",
      accessor: (row) => new Date(row.created_at).toLocaleDateString("pt-BR")
    },
  ];

  if (!equipeId && !loading) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa criar uma equipe primeiro. Vá para a aba "Minha Equipe" e crie sua equipe.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="disponiveis">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="disponiveis">
            <Trophy className="h-4 w-4 mr-2" />
            Competições Disponíveis
          </TabsTrigger>
          <TabsTrigger value="minhas">
            <ClipboardList className="h-4 w-4 mr-2" />
            Minhas Inscrições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Competições Disponíveis</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Inscreva sua equipe nas competições com inscrições abertas
              </p>
            </div>

            {eventosDisponiveis.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma competição disponível no momento</p>
              </div>
            )}

            {eventosDisponiveis.length > 0 && (
              <DataTable data={eventosDisponiveis} columns={colunasDisponiveis} loading={loading} />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="minhas" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Minhas Inscrições</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe o status das suas inscrições
              </p>
            </div>

            {minhasInscricoes.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não fez nenhuma inscrição</p>
              </div>
            )}

            {minhasInscricoes.length > 0 && (
              <DataTable data={minhasInscricoes} columns={colunasMinhas} loading={loading} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { ClipboardList } from "lucide-react";

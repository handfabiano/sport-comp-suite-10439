import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DataTable, { Column } from "@/components/shared/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Inscricao {
  id: string;
  equipe_nome: string;
  evento_nome: string;
  responsavel_nome: string;
  status: string;
  created_at: string;
  equipe_id: string;
  evento_id: string;
}

export default function VerInscricoesOrganizador() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInscricoes();
  }, []);

  const fetchInscricoes = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar eventos do organizador
      const { data: eventos, error: eventosError } = await supabase
        .from("eventos")
        .select("id")
        .eq("organizador_id", user.id);

      if (eventosError) throw eventosError;

      if (!eventos || eventos.length === 0) {
        setInscricoes([]);
        return;
      }

      const eventoIds = eventos.map(e => e.id);

      // Buscar inscrições desses eventos
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from("inscricoes")
        .select(`
          id,
          status,
          created_at,
          equipe_id,
          evento_id,
          equipes (
            nome,
            responsavel_id
          ),
          eventos (
            nome
          )
        `)
        .in("evento_id", eventoIds)
        .order("created_at", { ascending: false });

      if (inscricoesError) throw inscricoesError;

      // Buscar nomes dos responsáveis
      const inscricoesComDados = await Promise.all(
        (inscricoesData || []).map(async (inscricao: any) => {
          let responsavelNome = "Desconhecido";

          if (inscricao.equipes?.responsavel_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("nome")
              .eq("id", inscricao.equipes.responsavel_id)
              .single();

            if (profile) {
              responsavelNome = profile.nome;
            }
          }

          return {
            id: inscricao.id,
            equipe_nome: inscricao.equipes?.nome || "N/A",
            evento_nome: inscricao.eventos?.nome || "N/A",
            responsavel_nome: responsavelNome,
            status: inscricao.status,
            created_at: inscricao.created_at,
            equipe_id: inscricao.equipe_id,
            evento_id: inscricao.evento_id,
          };
        })
      );

      setInscricoes(inscricoesComDados);
    } catch (error: any) {
      console.error("Erro ao carregar inscrições:", error);
      toast.error("Erro ao carregar inscrições: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (inscricaoId: string) => {
    try {
      const { error } = await supabase
        .from("inscricoes")
        .update({ status: "aprovada" })
        .eq("id", inscricaoId);

      if (error) throw error;

      toast.success("Inscrição aprovada!");
      fetchInscricoes();
    } catch (error: any) {
      toast.error("Erro ao aprovar: " + error.message);
    }
  };

  const handleRejeitar = async (inscricaoId: string) => {
    if (!confirm("Tem certeza que deseja rejeitar esta inscrição?")) return;

    try {
      const { error } = await supabase
        .from("inscricoes")
        .update({ status: "rejeitada" })
        .eq("id", inscricaoId);

      if (error) throw error;

      toast.success("Inscrição rejeitada");
      fetchInscricoes();
    } catch (error: any) {
      toast.error("Erro ao rejeitar: " + error.message);
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

  const columns: Column<Inscricao>[] = [
    {
      header: "Equipe",
      accessor: "equipe_nome"
    },
    {
      header: "Competição",
      accessor: "evento_nome"
    },
    {
      header: "Responsável",
      accessor: "responsavel_nome"
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status)
    },
    {
      header: "Data",
      accessor: (row) => new Date(row.created_at).toLocaleDateString("pt-BR")
    },
    {
      header: "Ações",
      accessor: (row) => (
        <div className="flex gap-2">
          {row.status === "pendente" && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAprovar(row.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRejeitar(row.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </>
          )}
          {row.status !== "pendente" && <span className="text-muted-foreground">-</span>}
        </div>
      ),
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Inscrições Recebidas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aprove ou rejeite as inscrições de equipes nas suas competições
        </p>
      </div>

      {inscricoes.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma inscrição recebida ainda</p>
          <p className="text-sm mt-2">As inscrições aparecerão aqui quando equipes se inscreverem nas suas competições</p>
        </div>
      )}

      {inscricoes.length > 0 && (
        <DataTable data={inscricoes} columns={columns} loading={loading} />
      )}
    </Card>
  );
}

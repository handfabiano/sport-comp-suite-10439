import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DataTable, { Column } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, AlertTriangle, Plus } from "lucide-react";
import { validarIdadeAtleta, validarSexoAtleta, validarLimitesEquipe } from "@/lib/validacoes";

interface Inscricao {
  id: string;
  equipe_id?: string;
  evento_id: string;
  status: string;
  categoria: string;
  equipe?: { nome: string };
  evento?: any;
}

export default function GerenciarInscricoes() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventoSel, setEventoSel] = useState("");
  const [equipeSel, setEquipeSel] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [inscricoesRes, eventosRes, equipesRes] = await Promise.all([
        supabase.from("inscricoes").select("*, equipe:equipes(nome), evento:eventos(*)").order("created_at", { ascending: false }),
        supabase.from("eventos").select("*").eq("organizador_id", user.id),
        supabase.from("equipes").select("*")
      ]);

      if (inscricoesRes.error) throw inscricoesRes.error;
      if (eventosRes.error) throw eventosRes.error;
      if (equipesRes.error) throw equipesRes.error;

      setInscricoes(inscricoesRes.data || []);
      setEventos(eventosRes.data || []);
      setEquipes(equipesRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validarInscricao = async (equipeId: string, eventoId: string) => {
    const errors: string[] = [];
    
    try {
      const [eventoRes, atletasRes] = await Promise.all([
        supabase.from("eventos").select("*").eq("id", eventoId).single(),
        supabase.from("equipe_atletas")
          .select("atleta:atletas(*)")
          .eq("equipe_id", equipeId)
          .eq("ativo", true)
      ]);

      if (eventoRes.error || atletasRes.error) return errors;
      
      const evento = eventoRes.data;
      const atletas = atletasRes.data?.map(ea => ea.atleta).filter(Boolean) || [];

      for (const atleta of atletas) {
        if (!atleta) continue;
        
        const validIdade = validarIdadeAtleta(atleta as any, evento);
        if (!validIdade.valido) errors.push(validIdade.mensagem!);

        const validSexo = validarSexoAtleta(atleta as any, evento);
        if (!validSexo.valido) errors.push(validSexo.mensagem!);
      }

      if (atletas.length > 0) {
        const validLimites = validarLimitesEquipe(
          atletas.slice(0, -1) as any[],
          atletas[atletas.length - 1] as any,
          evento
        );
        if (!validLimites.valido) errors.push(validLimites.mensagem!);
      }
    } catch (error) {
      console.error("Erro na validação:", error);
    }

    return errors;
  };

  const handleNovaInscricao = async () => {
    if (!eventoSel || !equipeSel || !categoriaSel) {
      toast.error("Preencha todos os campos");
      return;
    }

    const errors = await validarInscricao(equipeSel, eventoSel);
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("Há erros de validação. Revise antes de confirmar.");
      return;
    }

    try {
      const { error } = await supabase.from("inscricoes").insert({
        equipe_id: equipeSel,
        evento_id: eventoSel,
        categoria: categoriaSel,
        status: "aprovada"
      });

      if (error) throw error;
      toast.success("Inscrição realizada!");
      setDialogOpen(false);
      setEventoSel("");
      setEquipeSel("");
      setCategoriaSel("");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao inscrever: " + error.message);
    }
  };

  const handleAprovar = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inscricoes")
        .update({ status: "aprovada" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Inscrição aprovada!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const handleRejeitar = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inscricoes")
        .update({ status: "rejeitada" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Inscrição rejeitada!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const columns: Column<Inscricao>[] = [
    { header: "Equipe", accessor: (row) => row.equipe?.nome || "-" },
    { header: "Categoria", accessor: "categoria" },
    { 
      header: "Status", 
      accessor: (row) => (
        <Badge variant={row.status === "aprovada" ? "default" : row.status === "pendente" ? "secondary" : "destructive"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Ações",
      accessor: (row) => row.status === "pendente" ? (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleAprovar(row.id)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleRejeitar(row.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Inscrições</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Inscrição
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Inscrição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Select value={eventoSel} onValueChange={setEventoSel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a competição" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos.map(ev => (
                      <SelectItem key={ev.id} value={ev.id}>{ev.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={equipeSel} onValueChange={setEquipeSel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={categoriaSel} onValueChange={setCategoriaSel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sub-13">Sub-13</SelectItem>
                    <SelectItem value="sub-15">Sub-15</SelectItem>
                    <SelectItem value="sub-17">Sub-17</SelectItem>
                    <SelectItem value="livre">Livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleNovaInscricao}>Inscrever</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={inscricoes} columns={columns} loading={loading} />
    </Card>
  );
}

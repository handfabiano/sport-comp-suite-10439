import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { format } from "date-fns";

interface Evento {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  modalidade: string;
  status: string;
  idade_minima?: number;
  idade_maxima?: number;
  sexo_competicao?: string;
  limite_atletas_por_equipe?: number;
  limite_atletas_masculino?: number;
  limite_atletas_feminino?: number;
}

export default function GerenciarCompeticoes() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("organizador_id", user.id)
        .order("data_inicio", { ascending: false });

      if (error) throw error;
      setEventos(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar competições: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: any = {
      nome: formData.get("nome"),
      data_inicio: formData.get("data_inicio"),
      data_fim: formData.get("data_fim"),
      modalidade: formData.get("modalidade"),
      status: formData.get("status"),
      local: formData.get("local"),
      idade_minima: formData.get("idade_minima") ? parseInt(formData.get("idade_minima") as string) : null,
      idade_maxima: formData.get("idade_maxima") ? parseInt(formData.get("idade_maxima") as string) : null,
      sexo_competicao: formData.get("sexo_competicao") || null,
      limite_atletas_por_equipe: formData.get("limite_atletas_por_equipe") ? parseInt(formData.get("limite_atletas_por_equipe") as string) : null,
      limite_atletas_masculino: formData.get("limite_atletas_masculino") ? parseInt(formData.get("limite_atletas_masculino") as string) : null,
      limite_atletas_feminino: formData.get("limite_atletas_feminino") ? parseInt(formData.get("limite_atletas_feminino") as string) : null,
    };

    try {
      if (eventoSelecionado) {
        const { error } = await supabase
          .from("eventos")
          .update(data)
          .eq("id", eventoSelecionado.id);
        if (error) throw error;
        toast.success("Competição atualizada!");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        data.organizador_id = user.id;
        data.categorias = [];
        
        const { error } = await supabase.from("eventos").insert(data);
        if (error) throw error;
        toast.success("Competição criada!");
      }
      
      setDialogOpen(false);
      setEventoSelecionado(null);
      fetchEventos();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const columns: Column<Evento>[] = [
    { header: "Nome", accessor: "nome" },
    { header: "Modalidade", accessor: "modalidade" },
    { 
      header: "Data Início", 
      accessor: (row) => format(new Date(row.data_inicio), "dd/MM/yyyy")
    },
    { header: "Status", accessor: "status" },
    { 
      header: "Idade", 
      accessor: (row) => {
        if (row.idade_minima && row.idade_maxima) return `${row.idade_minima}-${row.idade_maxima} anos`;
        if (row.idade_minima) return `Mín: ${row.idade_minima} anos`;
        if (row.idade_maxima) return `Máx: ${row.idade_maxima} anos`;
        return "-";
      }
    },
    { header: "Sexo", accessor: (row) => row.sexo_competicao || "-" },
    {
      header: "Ações",
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEventoSelecionado(row);
            setDialogOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Competições</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEventoSelecionado(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Competição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{eventoSelecionado ? "Editar" : "Nova"} Competição</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" defaultValue={eventoSelecionado?.nome} required />
                </div>
                <div>
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <Select name="modalidade" defaultValue={eventoSelecionado?.modalidade} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futebol">Futebol</SelectItem>
                      <SelectItem value="futsal">Futsal</SelectItem>
                      <SelectItem value="basquete">Basquete</SelectItem>
                      <SelectItem value="volei">Vôlei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_inicio">Data Início *</Label>
                  <Input id="data_inicio" name="data_inicio" type="date" defaultValue={eventoSelecionado?.data_inicio} required />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim *</Label>
                  <Input id="data_fim" name="data_fim" type="date" defaultValue={eventoSelecionado?.data_fim} required />
                </div>
                <div>
                  <Label htmlFor="local">Local *</Label>
                  <Input id="local" name="local" defaultValue={eventoSelecionado?.id} required />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue={eventoSelecionado?.status || "inscricoes_abertas"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idade_minima">Idade Mínima</Label>
                  <Input id="idade_minima" name="idade_minima" type="number" defaultValue={eventoSelecionado?.idade_minima} />
                </div>
                <div>
                  <Label htmlFor="idade_maxima">Idade Máxima</Label>
                  <Input id="idade_maxima" name="idade_maxima" type="number" defaultValue={eventoSelecionado?.idade_maxima} />
                </div>
                <div>
                  <Label htmlFor="sexo_competicao">Sexo da Competição</Label>
                  <Select name="sexo_competicao" defaultValue={eventoSelecionado?.sexo_competicao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="misto">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="limite_atletas_por_equipe">Limite de Atletas por Equipe</Label>
                  <Input id="limite_atletas_por_equipe" name="limite_atletas_por_equipe" type="number" defaultValue={eventoSelecionado?.limite_atletas_por_equipe} />
                </div>
                <div>
                  <Label htmlFor="limite_atletas_masculino">Limite Atletas Masculinos (Misto)</Label>
                  <Input id="limite_atletas_masculino" name="limite_atletas_masculino" type="number" defaultValue={eventoSelecionado?.limite_atletas_masculino} />
                </div>
                <div>
                  <Label htmlFor="limite_atletas_feminino">Limite Atletas Femininos (Misto)</Label>
                  <Input id="limite_atletas_feminino" name="limite_atletas_feminino" type="number" defaultValue={eventoSelecionado?.limite_atletas_feminino} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={eventos} columns={columns} loading={loading} />
    </Card>
  );
}

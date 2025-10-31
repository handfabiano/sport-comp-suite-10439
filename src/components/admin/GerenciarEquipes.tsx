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
import { Pencil, Plus, Users } from "lucide-react";

interface Equipe {
  id: string;
  nome: string;
  categoria: string;
  modalidade: string;
  evento_id?: string;
  responsavel_id?: string;
  numero_atletas: number;
}

export default function GerenciarEquipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [equipeSelecionada, setEquipeSelecionada] = useState<Equipe | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [equipesRes, eventosRes, responsaveisRes] = await Promise.all([
        supabase.from("equipes").select("*").order("nome"),
        supabase.from("eventos").select("id, nome").eq("organizador_id", user.id),
        supabase.from("responsaveis").select("*")
      ]);

      if (equipesRes.error) throw equipesRes.error;
      if (eventosRes.error) throw eventosRes.error;
      if (responsaveisRes.error) throw responsaveisRes.error;

      setEquipes(equipesRes.data || []);
      setEventos(eventosRes.data || []);
      setResponsaveis(responsaveisRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: any = {
      nome: formData.get("nome"),
      categoria: formData.get("categoria"),
      modalidade: formData.get("modalidade"),
      evento_id: formData.get("evento_id") || null,
      responsavel_id: formData.get("responsavel_id") || null,
    };

    try {
      if (equipeSelecionada) {
        const { error } = await supabase
          .from("equipes")
          .update(data)
          .eq("id", equipeSelecionada.id);
        if (error) throw error;
        toast.success("Equipe atualizada!");
      } else {
        const { error } = await supabase.from("equipes").insert(data);
        if (error) throw error;
        toast.success("Equipe criada!");
      }
      
      setDialogOpen(false);
      setEquipeSelecionada(null);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const columns: Column<Equipe>[] = [
    { header: "Nome", accessor: "nome" },
    { header: "Categoria", accessor: "categoria" },
    { header: "Modalidade", accessor: "modalidade" },
    { 
      header: "Atletas", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {row.numero_atletas}
        </div>
      )
    },
    {
      header: "Ações",
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEquipeSelecionada(row);
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
        <h2 className="text-2xl font-bold">Gerenciar Equipes</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEquipeSelecionada(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{equipeSelecionada ? "Editar" : "Nova"} Equipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" name="nome" defaultValue={equipeSelecionada?.nome} required />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Input id="categoria" name="categoria" defaultValue={equipeSelecionada?.categoria} required />
              </div>
              <div>
                <Label htmlFor="modalidade">Modalidade *</Label>
                <Select name="modalidade" defaultValue={equipeSelecionada?.modalidade} required>
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
                <Label htmlFor="evento_id">Competição</Label>
                <Select name="evento_id" defaultValue={equipeSelecionada?.evento_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos.map(ev => (
                      <SelectItem key={ev.id} value={ev.id}>{ev.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Select name="responsavel_id" defaultValue={equipeSelecionada?.responsavel_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveis.map(resp => (
                      <SelectItem key={resp.id} value={resp.user_id}>{resp.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      <DataTable data={equipes} columns={columns} loading={loading} />
    </Card>
  );
}

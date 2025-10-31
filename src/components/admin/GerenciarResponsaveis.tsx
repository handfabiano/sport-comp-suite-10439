import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable, { Column } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";

interface Responsavel {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

export default function GerenciarResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<Responsavel | null>(null);

  const fetchResponsaveis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("responsaveis")
        .select("*")
        .order("nome");

      if (error) throw error;
      setResponsaveis(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar responsáveis: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: any = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      telefone: formData.get("telefone"),
    };

    try {
      if (responsavelSelecionado) {
        const { error } = await supabase
          .from("responsaveis")
          .update(data)
          .eq("id", responsavelSelecionado.id);
        if (error) throw error;
        toast.success("Responsável atualizado!");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        data.user_id = user.id;
        const { error } = await supabase.from("responsaveis").insert(data);
        if (error) throw error;
        toast.success("Responsável criado!");
      }
      
      setDialogOpen(false);
      setResponsavelSelecionado(null);
      fetchResponsaveis();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const columns: Column<Responsavel>[] = [
    { header: "Nome", accessor: "nome" },
    { header: "Email", accessor: "email" },
    { header: "Telefone", accessor: (row) => row.telefone || "-" },
    { header: "Status", accessor: (row) => row.ativo ? "Ativo" : "Inativo" },
    {
      header: "Ações",
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setResponsavelSelecionado(row);
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
        <h2 className="text-2xl font-bold">Gerenciar Responsáveis</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setResponsavelSelecionado(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Responsável
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{responsavelSelecionado ? "Editar" : "Novo"} Responsável</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" name="nome" defaultValue={responsavelSelecionado?.nome} required />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" defaultValue={responsavelSelecionado?.email} required />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" defaultValue={responsavelSelecionado?.telefone} />
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
      <DataTable data={responsaveis} columns={columns} loading={loading} />
    </Card>
  );
}

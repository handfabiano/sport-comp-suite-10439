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
import { Pencil, Plus, UserPlus } from "lucide-react";
import { useEquipeAtletas } from "@/hooks/useEquipeAtletas";
import { format, differenceInYears } from "date-fns";

interface Atleta {
  id: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  categoria: string;
  ativo: boolean;
}

export default function GerenciarAtletas() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [atletaSelecionado, setAtletaSelecionado] = useState<Atleta | null>(null);
  const [dialogVincular, setDialogVincular] = useState(false);
  const [atletaVincular, setAtletaVincular] = useState<string>("");
  const [equipeVincular, setEquipeVincular] = useState<string>("");
  const { addAtletaToEquipe } = useEquipeAtletas();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [atletasRes, equipesRes] = await Promise.all([
        supabase.from("atletas").select("*").order("nome"),
        supabase.from("equipes").select("id, nome")
      ]);

      if (atletasRes.error) throw atletasRes.error;
      if (equipesRes.error) throw equipesRes.error;

      setAtletas(atletasRes.data || []);
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: any = {
      nome: formData.get("nome"),
      categoria: formData.get("categoria"),
      data_nascimento: formData.get("data_nascimento"),
      sexo: formData.get("sexo"),
      documento: formData.get("documento"),
    };

    try {
      if (atletaSelecionado) {
        const { error } = await supabase
          .from("atletas")
          .update(data)
          .eq("id", atletaSelecionado.id);
        if (error) throw error;
        toast.success("Atleta atualizado!");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        data.user_id = user.id;
        const { error } = await supabase.from("atletas").insert(data);
        if (error) throw error;
        toast.success("Atleta criado!");
      }
      
      setDialogOpen(false);
      setAtletaSelecionado(null);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const handleVincular = async () => {
    if (!atletaVincular || !equipeVincular) {
      toast.error("Selecione atleta e equipe");
      return;
    }
    
    await addAtletaToEquipe(equipeVincular, atletaVincular);
    setDialogVincular(false);
    setAtletaVincular("");
    setEquipeVincular("");
  };

  const columns: Column<Atleta>[] = [
    { header: "Nome", accessor: "nome" },
    { 
      header: "Idade", 
      accessor: (row) => row.data_nascimento 
        ? `${differenceInYears(new Date(), new Date(row.data_nascimento))} anos`
        : "-"
    },
    { header: "Sexo", accessor: (row) => row.sexo || "-" },
    { header: "Categoria", accessor: "categoria" },
    { header: "Status", accessor: (row) => row.ativo ? "Ativo" : "Inativo" },
    {
      header: "Ações",
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setAtletaSelecionado(row);
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
        <h2 className="text-2xl font-bold">Gerenciar Atletas</h2>
        <div className="flex gap-2">
          <Dialog open={dialogVincular} onOpenChange={setDialogVincular}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Vincular a Equipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular Atleta a Equipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Atleta</Label>
                  <Select value={atletaVincular} onValueChange={setAtletaVincular}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {atletas.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Equipe</Label>
                  <Select value={equipeVincular} onValueChange={setEquipeVincular}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogVincular(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleVincular}>Vincular</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setAtletaSelecionado(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Atleta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{atletaSelecionado ? "Editar" : "Novo"} Atleta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" defaultValue={atletaSelecionado?.nome} required />
                </div>
                <div>
                  <Label htmlFor="documento">Documento *</Label>
                  <Input id="documento" name="documento" defaultValue={atletaSelecionado?.id} required />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input 
                    id="data_nascimento" 
                    name="data_nascimento" 
                    type="date" 
                    defaultValue={atletaSelecionado?.data_nascimento} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select name="sexo" defaultValue={atletaSelecionado?.sexo} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input id="categoria" name="categoria" defaultValue={atletaSelecionado?.categoria} required />
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
      </div>
      <DataTable data={atletas} columns={columns} loading={loading} />
    </Card>
  );
}

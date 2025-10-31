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
import { UserPlus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { differenceInYears } from "date-fns";

interface Atleta {
  id: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  categoria: string;
  documento?: string;
  idade?: number;
}

export default function MeusAtletasResponsavel() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [atletaSelecionado, setAtletaSelecionado] = useState<Atleta | null>(null);
  const [equipeId, setEquipeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    sexo: "",
    categoria: "",
    documento: "",
  });

  useEffect(() => {
    fetchMinhaEquipe();
  }, []);

  const fetchMinhaEquipe = async () => {
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
        setAtletas([]);
        return;
      }

      setEquipeId(equipe.id);

      // Buscar atletas da equipe
      const { data: atletasData, error: atletasError } = await supabase
        .from("atletas")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");

      if (atletasError) throw atletasError;

      const atletasComIdade = atletasData?.map(a => ({
        ...a,
        idade: a.data_nascimento
          ? differenceInYears(new Date(), new Date(a.data_nascimento))
          : undefined,
      })) || [];

      setAtletas(atletasComIdade);
    } catch (error: any) {
      console.error("Erro ao carregar atletas:", error);
      toast.error("Erro ao carregar atletas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.categoria) {
      toast.error("Nome e categoria são obrigatórios");
      return;
    }

    if (!equipeId) {
      toast.error("Você precisa criar uma equipe primeiro");
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const atletaData = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo || null,
        categoria: formData.categoria,
        documento: formData.documento || null,
        user_id: user.id,
      };

      if (atletaSelecionado) {
        // Atualizar atleta
        const { error } = await supabase
          .from("atletas")
          .update(atletaData)
          .eq("id", atletaSelecionado.id);

        if (error) throw error;
        toast.success("Atleta atualizado!");
      } else {
        // Criar novo atleta
        const { data: novoAtleta, error } = await supabase
          .from("atletas")
          .insert(atletaData)
          .select()
          .single();

        if (error) throw error;

        // Vincular atleta à equipe
        const { error: vinculoError } = await supabase
          .from("equipe_atletas")
          .insert({
            equipe_id: equipeId,
            atleta_id: novoAtleta.id,
          });

        if (vinculoError) throw vinculoError;

        toast.success("Atleta adicionado à equipe!");
      }

      setDialogOpen(false);
      resetForm();
      fetchMinhaEquipe();
    } catch (error: any) {
      console.error("Erro ao salvar atleta:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (atletaId: string, atletaNome: string) => {
    if (!confirm(`Tem certeza que deseja remover ${atletaNome} da equipe?`)) return;

    try {
      const { error } = await supabase
        .from("atletas")
        .delete()
        .eq("id", atletaId);

      if (error) throw error;

      toast.success("Atleta removido");
      fetchMinhaEquipe();
    } catch (error: any) {
      console.error("Erro ao remover atleta:", error);
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      data_nascimento: "",
      sexo: "",
      categoria: "",
      documento: "",
    });
    setAtletaSelecionado(null);
  };

  const openEditDialog = (atleta: Atleta) => {
    setAtletaSelecionado(atleta);
    setFormData({
      nome: atleta.nome,
      data_nascimento: atleta.data_nascimento || "",
      sexo: atleta.sexo || "",
      categoria: atleta.categoria,
      documento: atleta.documento || "",
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const columns: Column<Atleta>[] = [
    {
      header: "Nome",
      accessor: "nome"
    },
    {
      header: "Idade",
      accessor: (row) => row.idade ? `${row.idade} anos` : "-"
    },
    {
      header: "Sexo",
      accessor: (row) => row.sexo || "-"
    },
    {
      header: "Categoria",
      accessor: "categoria"
    },
    {
      header: "Ações",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.id, row.nome)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Meus Atletas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione e gerencie os atletas da sua equipe
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Atleta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {atletaSelecionado ? "Editar Atleta" : "Adicionar Atleta"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="documento">Documento (CPF/RG)</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="123.456.789-00"
                />
              </div>

              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select value={formData.sexo} onValueChange={(value) => setFormData({ ...formData, sexo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Sub-16, Adulto, etc."
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {atletaSelecionado ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={atletas} columns={columns} loading={loading} />
    </Card>
  );
}

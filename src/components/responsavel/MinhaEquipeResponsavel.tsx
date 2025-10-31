import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Plus, Pencil, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Equipe {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
  descricao?: string;
  evento_id?: string;
}

export default function MinhaEquipeResponsavel() {
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cidade: "",
    estado: "",
    descricao: "",
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
      const { data, error } = await supabase
        .from("equipes")
        .select("*")
        .eq("responsavel_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setEquipe(data);
        setFormData({
          nome: data.nome || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          descricao: data.descricao || "",
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar equipe:", error);
      toast.error("Erro ao carregar equipe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome) {
      toast.error("Nome da equipe é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      if (equipe) {
        // Atualizar equipe existente
        const { error } = await supabase
          .from("equipes")
          .update({
            nome: formData.nome,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            descricao: formData.descricao || null,
          })
          .eq("id", equipe.id);

        if (error) throw error;
        toast.success("Equipe atualizada!");
      } else {
        // Criar nova equipe
        const { error } = await supabase
          .from("equipes")
          .insert({
            nome: formData.nome,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            descricao: formData.descricao || null,
            responsavel_id: user.id,
          });

        if (error) throw error;
        toast.success("Equipe criada com sucesso!");
      }

      setEditMode(false);
      fetchMinhaEquipe();
    } catch (error: any) {
      console.error("Erro ao salvar equipe:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !equipe) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </Card>
    );
  }

  if (!equipe && !editMode) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Você ainda não tem uma equipe</h3>
          <p className="text-muted-foreground mb-6">
            Crie sua equipe para adicionar atletas e fazer inscrições em competições
          </p>
          <Button onClick={() => setEditMode(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Minha Equipe
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Minha Equipe</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as informações da sua equipe
          </p>
        </div>
        {equipe && !editMode && (
          <Button onClick={() => setEditMode(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {editMode ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Equipe *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Tigres FC"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Breve descrição sobre a equipe..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {equipe ? "Salvar Alterações" : "Criar Equipe"}
            </Button>
            {equipe && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    nome: equipe.nome || "",
                    cidade: equipe.cidade || "",
                    estado: equipe.estado || "",
                    descricao: equipe.descricao || "",
                  });
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-semibold">{equipe?.nome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Localização</p>
              <p className="text-lg font-semibold">
                {equipe?.cidade && equipe?.estado
                  ? `${equipe.cidade} - ${equipe.estado}`
                  : equipe?.cidade || equipe?.estado || "-"}
              </p>
            </div>
          </div>

          {equipe?.descricao && (
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="text-base mt-1">{equipe.descricao}</p>
            </div>
          )}

          <Alert>
            <AlertDescription>
              Após criar sua equipe, vá para a aba "Meus Atletas" para adicionar atletas à sua equipe.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}

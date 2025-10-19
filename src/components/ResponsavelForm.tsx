import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface ResponsavelFormProps {
  onSuccess?: () => void;
}

export const ResponsavelForm = ({ onSuccess }: ResponsavelFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se o email já existe
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", formData.email)
        .maybeSingle();

      let userId: string;

      if (existingProfile) {
        // Usuário já existe
        userId = existingProfile.id;
        
        // Verificar se já é responsável
        const { data: existingResponsavel } = await supabase
          .from("responsaveis")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingResponsavel) {
          toast.error("Este email já está cadastrado como responsável");
          setLoading(false);
          return;
        }
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nome: formData.nome,
              perfil: "responsavel",
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Erro ao criar usuário");

        userId = authData.user.id;
      }

      // Criar registro de responsável
      const { error: responsavelError } = await supabase
        .from("responsaveis")
        .insert({
          user_id: userId,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          documento: formData.documento || null,
        });

      if (responsavelError) throw responsavelError;

      // Adicionar role de responsável
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "responsavel",
        });

      if (roleError) throw roleError;

      toast.success("Responsável cadastrado com sucesso!");
      setFormData({ nome: "", email: "", telefone: "", documento: "", password: "" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao cadastrar responsável:", error);
      toast.error(error.message || "Erro ao cadastrar responsável");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Cadastrar Responsável
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Responsável</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha Inicial *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="documento">CPF/Documento</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

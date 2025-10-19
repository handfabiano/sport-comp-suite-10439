import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";

export default function CadastroResponsavel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    telefone: "",
    documento: "",
  });

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Token inválido");
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("manager_invite_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .single();

      if (error || !data) {
        toast.error("Convite não encontrado ou já utilizado");
        navigate("/auth");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error("Convite expirado");
        navigate("/auth");
        return;
      }

      setTokenData(data);
    } catch (error: any) {
      toast.error("Erro ao validar convite");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setSubmitting(true);

    try {
      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tokenData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: tokenData.nome_responsavel,
            perfil: "responsavel",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // Criar registro de responsável
      const { error: responsavelError } = await supabase
        .from("responsaveis")
        .insert({
          user_id: authData.user.id,
          nome: tokenData.nome_responsavel,
          email: tokenData.email,
          telefone: formData.telefone || null,
          documento: formData.documento || null,
        });

      if (responsavelError) throw responsavelError;

      // Adicionar role de responsável
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "responsavel",
        });

      if (roleError) throw roleError;

      // Marcar token como usado
      await supabase
        .from("manager_invite_tokens")
        .update({ used: true })
        .eq("token", tokenData.token);

      toast.success("Cadastro realizado com sucesso!");
      navigate("/minhas-equipes");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Complete seu Cadastro</CardTitle>
          <CardDescription>
            Bem-vindo, {tokenData?.nome_responsavel}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={tokenData?.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="documento">CPF/Documento</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando cadastro...
                </>
              ) : (
                "Finalizar Cadastro"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

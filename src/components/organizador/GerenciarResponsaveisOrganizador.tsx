import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable, { Column } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Responsavel {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  created_at: string;
}

export default function GerenciarResponsaveisOrganizador() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  const fetchResponsaveis = async () => {
    try {
      setLoading(true);

      // Buscar todos os usuários com role 'responsavel'
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "responsavel");

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setResponsaveis([]);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);

      // Buscar perfis desses usuários
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nome, email, created_at")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Buscar dados adicionais da tabela responsaveis
      const { data: responsaveisData } = await supabase
        .from("responsaveis")
        .select("user_id, telefone")
        .in("user_id", userIds);

      const responsaveisMap = new Map(
        responsaveisData?.map(r => [r.user_id, r.telefone]) || []
      );

      const responsaveisComDados = profiles?.map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        telefone: responsaveisMap.get(p.id),
        created_at: p.created_at,
      })) || [];

      setResponsaveis(responsaveisComDados);
    } catch (error: any) {
      console.error("Erro ao carregar responsáveis:", error);
      toast.error("Erro ao carregar responsáveis: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nome) {
      toast.error("Preencha email e nome");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar token de convite
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error: inviteError } = await supabase
        .from("manager_invite_tokens")
        .insert({
          created_by: user.id,
          email: email,
          nome_responsavel: nome,
          token: token,
          expires_at: expiresAt,
        });

      if (inviteError) throw inviteError;

      // Enviar email (edge function)
      const { error: emailError } = await supabase.functions.invoke("send-manager-invite", {
        body: { email, nome },
      });

      if (emailError) {
        console.error("Erro ao enviar email:", emailError);
        toast.warning("Convite criado, mas houve erro ao enviar email");
      } else {
        toast.success("Convite enviado com sucesso!");
      }

      setDialogOpen(false);
      setEmail("");
      setNome("");
      setTelefone("");
      fetchResponsaveis();
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      toast.error("Erro ao enviar convite: " + error.message);
    }
  };

  const handleCreateDirect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nome) {
      toast.error("Preencha email e nome");
      return;
    }

    try {
      // Criar usuário diretamente usando edge function
      const senha = Math.random().toString(36).slice(-8) + "123"; // Senha temporária

      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email,
          password: senha,
          nome,
          role: "responsavel",
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro ao criar responsável");

      // Criar registro na tabela responsaveis
      if (data.user?.id) {
        await supabase.from("responsaveis").insert({
          user_id: data.user.id,
          nome,
          email,
          telefone: telefone || null,
        });
      }

      toast.success(`Responsável criado! Senha temporária: ${senha}`);
      setDialogOpen(false);
      setEmail("");
      setNome("");
      setTelefone("");
      fetchResponsaveis();
    } catch (error: any) {
      console.error("Erro ao criar responsável:", error);
      toast.error("Erro ao criar: " + error.message);
    }
  };

  const columns: Column<Responsavel>[] = [
    {
      header: "Nome",
      accessor: "nome"
    },
    {
      header: "E-mail",
      accessor: "email"
    },
    {
      header: "Telefone",
      accessor: (row) => row.telefone || "-"
    },
    {
      header: "Status",
      accessor: () => <Badge variant="default">Ativo</Badge>
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Responsáveis de Equipe</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Convide ou crie responsáveis que gerenciarão equipes nas suas competições
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Responsável
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Responsável de Equipe</DialogTitle>
              <DialogDescription>
                Crie um responsável diretamente ou envie um convite por e-mail
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInvite}
                  className="flex-1"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateDirect}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Agora
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                "Enviar Convite" envia email • "Criar Agora" cria com senha temporária
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={responsaveis} columns={columns} loading={loading} />
    </Card>
  );
}

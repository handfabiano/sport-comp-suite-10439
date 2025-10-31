import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserCheck, UserX, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  created_at: string;
}

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form fields
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<"admin" | "organizador" | "responsavel" | "atleta">("organizador");

  useEffect(() => {
    checkAdminStatus();
    fetchUsuarios();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);

      // Usar Edge Function para listar usuários
      const { data, error } = await supabase.functions.invoke("admin-list-users");

      if (error) throw error;

      if (data && data.usuarios) {
        setUsuarios(data.usuarios);
      }
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nome || !email) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (usuarioSelecionado) {
        // Atualizar usuário existente
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ nome })
          .eq("id", usuarioSelecionado.id);

        if (profileError) throw profileError;

        // Atualizar role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", usuarioSelecionado.id);

        if (role !== "sem_role") {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: usuarioSelecionado.id, role });

          if (roleError) throw roleError;
        }

        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário usando Edge Function
        if (!senha || senha.length < 6) {
          toast.error("A senha deve ter no mínimo 6 caracteres");
          return;
        }

        const { data, error } = await supabase.functions.invoke("admin-create-user", {
          body: {
            email,
            password: senha,
            nome,
            role,
          },
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Erro ao criar usuário");

        toast.success("Usuário criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const handleToggleStatus = async (userId: string, ativo: boolean) => {
    try {
      if (ativo) {
        // Desativar usuário (não há método direto, mas podemos marcar)
        toast.info("Para desativar um usuário, remova suas roles ou delete o usuário");
      } else {
        toast.info("Para reativar um usuário, crie um novo ou use o convite");
      }
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja DELETAR o usuário ${userEmail}? Esta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      // Usar Edge Function para deletar usuário
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { userId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro ao deletar usuário");

      toast.success("Usuário deletado com sucesso!");
      fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      toast.error("Erro ao deletar: " + error.message);
    }
  };

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setRole("organizador");
    setUsuarioSelecionado(null);
  };

  const openEditDialog = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setRole(usuario.role as any);
    setSenha(""); // Não mostrar senha ao editar
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: "Administrador", variant: "destructive" },
      organizador: { label: "Organizador", variant: "default" },
      responsavel: { label: "Responsável", variant: "secondary" },
      atleta: { label: "Atleta", variant: "outline" },
      sem_role: { label: "Sem Role", variant: "outline" },
    };

    const config = roleConfig[role] || roleConfig.sem_role;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: Column<Usuario>[] = [
    {
      header: "Nome",
      accessor: "nome"
    },
    {
      header: "E-mail",
      accessor: "email"
    },
    {
      header: "Tipo",
      accessor: (row) => getRoleBadge(row.role),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.ativo ? "default" : "secondary"}>
          {row.ativo ? (
            <><UserCheck className="h-3 w-3 mr-1 inline" /> Ativo</>
          ) : (
            <><UserX className="h-3 w-3 mr-1 inline" /> Inativo</>
          )}
        </Badge>
      ),
    },
    {
      header: "Ações",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditDialog(row)}
            title="Editar usuário"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {row.role !== "admin" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(row.id, row.email)}
              title="Deletar usuário"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta área. Apenas administradores podem gerenciar usuários.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gerenciar Usuários
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crie, edite e gerencie todos os usuários do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {usuarioSelecionado ? "Editar Usuário" : "Criar Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {usuarioSelecionado
                  ? "Atualize as informações do usuário abaixo"
                  : "Preencha os dados para criar um novo usuário no sistema"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
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
                  disabled={!!usuarioSelecionado}
                />
                {usuarioSelecionado && (
                  <p className="text-xs text-muted-foreground mt-1">
                    O e-mail não pode ser alterado
                  </p>
                )}
              </div>

              {!usuarioSelecionado && (
                <div>
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required={!usuarioSelecionado}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo de 6 caracteres
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="role">Tipo de Usuário *</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="organizador">Organizador de Evento</SelectItem>
                    <SelectItem value="responsavel">Responsável de Equipe</SelectItem>
                    <SelectItem value="atleta">Atleta</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Define as permissões do usuário no sistema
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {usuarioSelecionado ? "Atualizar" : "Criar"} Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={usuarios} columns={columns} loading={loading} />
    </Card>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, UserPlus, Users, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserWithRole {
  id: string;
  email: string;
  nome: string;
  role: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserNome, setNewUserNome] = useState("");
  const [newUserRole, setNewUserRole] = useState<"organizador" | "responsavel">("organizador");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
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

    if (data) {
      setIsAdmin(true);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, nome");

    if (!profiles) {
      setLoading(false);
      return;
    }

    const usersWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .single();

        return {
          ...profile,
          role: roleData?.role || "sem role",
        };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserNome) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      // Criar convite de acordo com o tipo de role
      if (newUserRole === "organizador") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { error: inviteError } = await supabase
          .from("manager_invite_tokens")
          .insert({
            created_by: user.id,
            email: newUserEmail,
            nome_responsavel: newUserNome,
            token: crypto.randomUUID(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (inviteError) throw inviteError;

        const { error: emailError } = await supabase.functions.invoke("send-manager-invite", {
          body: { email: newUserEmail, nome: newUserNome },
        });

        if (emailError) throw emailError;
      }

      toast.success("Convite enviado com sucesso!");
      setNewUserEmail("");
      setNewUserNome("");
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Erro ao convidar usuário:", error);
      toast.error("Erro ao enviar convite");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      // Deletar role antiga
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Inserir nova role
      const { error } = await supabase.from("user_roles").insert([{
        user_id: userId,
        role: newRole as "admin" | "organizador" | "responsavel" | "atleta",
      }]);

      if (error) throw error;

      toast.success("Role atualizada com sucesso");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role");
    }
  };

  const handleDeleteRole = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover a role deste usuário?")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Role removida com sucesso");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao remover role:", error);
      toast.error("Erro ao remover role");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Esta página é restrita a administradores do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Administração do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie organizadores e permissões do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Organizador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={newUserNome}
                  onChange={(e) => setNewUserNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={newUserRole} onValueChange={(value: "organizador" | "responsavel") => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizador">Organizador de Evento</SelectItem>
                    <SelectItem value="responsavel">Responsável de Equipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Enviar Convite
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo de Usuário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleChangeRole(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="organizador">Organizador</SelectItem>
                          <SelectItem value="responsavel">Responsável</SelectItem>
                          <SelectItem value="atleta">Atleta</SelectItem>
                          <SelectItem value="sem role">Sem Role</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRole(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

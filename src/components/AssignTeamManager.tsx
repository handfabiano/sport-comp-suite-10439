import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssignTeamManagerProps {
  equipeId: string;
  currentManagers?: any[];
  onSuccess?: () => void;
}

export default function AssignTeamManager({ equipeId, currentManagers = [], onSuccess }: AssignTeamManagerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [managers, setManagers] = useState<any[]>(currentManagers);

  useEffect(() => {
    if (open) {
      fetchManagers();
    }
  }, [open, equipeId]);

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          profiles:user_id (
            nome,
            email
          )
        `)
        .eq("equipe_id", equipeId)
        .eq("role", "responsavel");

      if (error) throw error;
      setManagers(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar responsáveis:", error);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar usuário por email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (profileError) {
        toast.error("Usuário não encontrado. Certifique-se que o email está cadastrado.");
        return;
      }

      // Atribuir role de responsável
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: profile.id,
          role: "responsavel",
          equipe_id: equipeId,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este usuário já é responsável por esta equipe.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Responsável atribuído com sucesso!");
      setEmail("");
      fetchManagers();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Responsável removido com sucesso!");
      fetchManagers();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Gerenciar Responsáveis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Responsáveis da Equipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <Label htmlFor="email">Email do Responsável</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="responsavel@exemplo.com"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              O usuário deve estar cadastrado no sistema
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Atribuindo..." : "Atribuir Responsável"}
          </Button>
        </form>

        <div className="space-y-2 mt-6">
          <Label>Responsáveis Atuais</Label>
          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum responsável atribuído</p>
          ) : (
            <div className="space-y-2">
              {managers.map((manager) => (
                <div
                  key={manager.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{manager.profiles?.nome}</p>
                    <p className="text-xs text-muted-foreground">{manager.profiles?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(manager.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

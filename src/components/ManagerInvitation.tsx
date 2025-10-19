import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Copy, CheckCircle2, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ManagerInvitation() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("manager_invite_tokens")
        .insert({
          token,
          email: email.toLowerCase().trim(),
          nome_responsavel: nome,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        });

      if (error) throw error;

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/cadastro-responsavel?token=${token}`;
      setInviteLink(link);

      toast.success("Convite gerado com sucesso!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    if (!inviteLink || !email) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-manager-invite", {
        body: {
          email,
          nome_responsavel: nome,
          invite_link: inviteLink,
        },
      });

      if (error) throw error;

      toast.success(`Convite enviado para ${email}`);
      setOpen(false);
      setEmail("");
      setNome("");
      setInviteLink(null);
    } catch (error: any) {
      toast.error("Erro ao enviar email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setNome("");
    setInviteLink(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Responsável
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar Responsável de Equipe</DialogTitle>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Responsável</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João Silva"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="responsavel@exemplo.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                O responsável receberá um link para completar o cadastro
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Gerando..." : "Gerar Convite"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Convite gerado com sucesso! Válido por 7 dias.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Link de Convite</Label>
              <div className="flex gap-2 mt-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendEmail}
                disabled={loading}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Enviando..." : "Enviar por Email"}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Novo Convite
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

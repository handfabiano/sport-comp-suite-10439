import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Copy, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AthleteInvitationProps {
  equipeId: string;
  equipeNome: string;
}

export default function AthleteInvitation({ equipeId, equipeNome }: AthleteInvitationProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gerar token único
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Salvar token no banco
      const { error } = await supabase
        .from("athlete_invite_tokens")
        .insert({
          equipe_id: equipeId,
          token,
          email: email.toLowerCase().trim(),
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        });

      if (error) throw error;

      // Gerar link de convite
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/cadastro-atleta?token=${token}`;
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
      const { error } = await supabase.functions.invoke("send-athlete-invite", {
        body: {
          email,
          equipe_nome: equipeNome,
          invite_link: inviteLink,
        },
      });

      if (error) throw error;

      toast.success(`Convite enviado para ${email}`);
      setOpen(false);
      setEmail("");
      setInviteLink(null);
    } catch (error: any) {
      toast.error("Erro ao enviar email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setInviteLink(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Convidar Atleta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar Atleta para {equipeNome}</DialogTitle>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div>
              <Label htmlFor="email">Email do Atleta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@exemplo.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                O atleta receberá um link para preencher seus dados
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

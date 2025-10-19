import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, UserPlus, Loader2 } from "lucide-react";

interface GerenciarConvitesProps {
  equipeId: string;
  categoria: string;
}

export default function GerenciarConvites({
  equipeId,
  categoria,
}: GerenciarConvitesProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [convites, setConvites] = useState<any[]>([]);
  const [atletas, setAtletas] = useState<any[]>([]);
  const [tipoConvite, setTipoConvite] = useState<"atleta" | "email">("atleta");
  const [atletaSelecionado, setAtletaSelecionado] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetchConvites();
    fetchAtletasDisponiveis();
  }, [equipeId]);

  const fetchConvites = async () => {
    const { data, error } = await supabase
      .from("convites_equipe")
      .select(`
        *,
        atletas:atleta_id (
          nome,
          foto_url
        )
      `)
      .eq("equipe_id", equipeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar convites:", error);
    } else {
      setConvites(data || []);
    }
  };

  const fetchAtletasDisponiveis = async () => {
    const { data, error } = await supabase
      .from("atletas")
      .select("id, nome, foto_url")
      .eq("categoria", categoria)
      .is("equipe_id", null)
      .eq("ativo", true);

    if (error) {
      console.error("Erro ao buscar atletas:", error);
    } else {
      setAtletas(data || []);
    }
  };

  const enviarConvite = async () => {
    if (tipoConvite === "atleta" && !atletaSelecionado) {
      toast({
        title: "Selecione um atleta",
        variant: "destructive",
      });
      return;
    }

    if (tipoConvite === "email" && !email) {
      toast({
        title: "Digite um email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const conviteData = {
        equipe_id: equipeId,
        atleta_id: tipoConvite === "atleta" ? atletaSelecionado : null,
        email_atleta: tipoConvite === "email" ? email : null,
        mensagem: mensagem || null,
        enviado_por: userData.user?.id,
      };

      const { error } = await supabase
        .from("convites_equipe")
        .insert([conviteData]);

      if (error) throw error;

      toast({
        title: "Convite enviado",
        description: "O convite foi enviado com sucesso.",
      });

      setAtletaSelecionado("");
      setEmail("");
      setMensagem("");
      fetchConvites();
      fetchAtletasDisponiveis();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: "secondary",
      aceito: "default",
      recusado: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enviar Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Convite</Label>
            <Select
              value={tipoConvite}
              onValueChange={(value: "atleta" | "email") => setTipoConvite(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atleta">Atleta Cadastrado</SelectItem>
                <SelectItem value="email">Por Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoConvite === "atleta" ? (
            <div className="space-y-2">
              <Label>Atleta</Label>
              <Select value={atletaSelecionado} onValueChange={setAtletaSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um atleta" />
                </SelectTrigger>
                <SelectContent>
                  {atletas.map((atleta) => (
                    <SelectItem key={atleta.id} value={atleta.id}>
                      {atleta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Email do Atleta</Label>
              <Input
                type="email"
                placeholder="atleta@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Mensagem (opcional)</Label>
            <Textarea
              placeholder="Digite uma mensagem para o atleta..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={enviarConvite} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Convite
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convites Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Para</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {convites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum convite enviado ainda
                  </TableCell>
                </TableRow>
              ) : (
                convites.map((convite) => (
                  <TableRow key={convite.id}>
                    <TableCell>
                      {convite.atletas?.nome || convite.email_atleta}
                    </TableCell>
                    <TableCell>
                      {new Date(convite.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getStatusBadge(convite.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

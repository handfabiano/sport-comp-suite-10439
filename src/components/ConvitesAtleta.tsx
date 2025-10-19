import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, X, Loader2 } from "lucide-react";

export default function ConvitesAtleta() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [convites, setConvites] = useState<any[]>([]);
  const [atleta, setAtleta] = useState<any>(null);

  useEffect(() => {
    fetchAtletaEConvites();
  }, []);

  const fetchAtletaEConvites = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Buscar atleta do usuário logado
    const { data: atletaData } = await supabase
      .from("atletas")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (atletaData) {
      setAtleta(atletaData);
      fetchConvites(atletaData.id);
    }
  };

  const fetchConvites = async (atletaId: string) => {
    const { data, error } = await supabase
      .from("convites_equipe")
      .select(`
        *,
        equipes:equipe_id (
          nome,
          logo_url,
          categoria,
          eventos:evento_id (
            nome
          )
        )
      `)
      .eq("atleta_id", atletaId)
      .eq("status", "pendente")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar convites:", error);
    } else {
      setConvites(data || []);
    }
  };

  const responderConvite = async (conviteId: string, aceitar: boolean) => {
    setLoading(true);
    try {
      const novoStatus = aceitar ? "aceito" : "recusado";

      const { error: updateError } = await supabase
        .from("convites_equipe")
        .update({ status: novoStatus })
        .eq("id", conviteId);

      if (updateError) throw updateError;

      // Se aceitar, atualizar o atleta com a equipe
      if (aceitar) {
        const convite = convites.find((c) => c.id === conviteId);
        if (convite && atleta) {
          const { error: atletaError } = await supabase
            .from("atletas")
            .update({ equipe_id: convite.equipe_id })
            .eq("id", atleta.id);

          if (atletaError) throw atletaError;
        }
      }

      toast({
        title: aceitar ? "Convite aceito" : "Convite recusado",
        description: aceitar
          ? "Você foi adicionado à equipe!"
          : "O convite foi recusado.",
      });

      fetchAtletaEConvites();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!atleta) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Você precisa ter um cadastro de atleta para visualizar convites.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Seus Convites
        </CardTitle>
      </CardHeader>
      <CardContent>
        {convites.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Você não tem convites pendentes no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {convites.map((convite) => (
              <Card key={convite.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {convite.equipes?.logo_url && (
                          <img
                            src={convite.equipes.logo_url}
                            alt={convite.equipes.nome}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{convite.equipes?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {convite.equipes?.eventos?.nome}
                          </p>
                        </div>
                      </div>

                      <Badge>{convite.equipes?.categoria}</Badge>

                      {convite.mensagem && (
                        <p className="text-sm text-muted-foreground">
                          {convite.mensagem}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Recebido em{" "}
                        {new Date(convite.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => responderConvite(convite.id, true)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => responderConvite(convite.id, false)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

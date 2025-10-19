import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Loader2 } from "lucide-react";

interface ChatPartidaProps {
  partidaId: string;
}

export default function ChatPartida({ partidaId }: ChatPartidaProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsuario();
    fetchComentarios();
    subscribeToComentarios();
  }, [partidaId]);

  useEffect(() => {
    scrollToBottom();
  }, [comentarios]);

  const fetchUsuario = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setUsuario(profile);
    }
  };

  const fetchComentarios = async () => {
    const { data, error } = await supabase
      .from("comentarios_partidas")
      .select(`
        *,
        profiles:user_id (
          nome,
          foto_url
        )
      `)
      .eq("partida_id", partidaId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar comentários:", error);
    } else {
      setComentarios(data || []);
    }
  };

  const subscribeToComentarios = () => {
    const channel = supabase
      .channel("comentarios_partidas")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comentarios_partidas",
          filter: `partida_id=eq.${partidaId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            fetchComentarios();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim() || !usuario) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("comentarios_partidas").insert([
        {
          partida_id: partidaId,
          user_id: usuario.id,
          comentario: novoComentario.trim(),
        },
      ]);

      if (error) throw error;

      setNovoComentario("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar comentário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarComentario();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários da Partida
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {comentarios.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Seja o primeiro a comentar!
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comentario.profiles?.foto_url} />
                    <AvatarFallback>
                      {comentario.profiles?.nome?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">
                        {comentario.profiles?.nome || "Usuário"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comentario.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comentario.comentario}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Digite seu comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !usuario}
          />
          <Button
            onClick={enviarComentario}
            disabled={loading || !novoComentario.trim() || !usuario}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

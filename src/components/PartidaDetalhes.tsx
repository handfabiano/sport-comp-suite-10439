import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Trophy, Clock, User, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ChatPartida from "@/components/ChatPartida";

interface PartidaDetalhesProps {
  partidaId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function PartidaDetalhes({ partidaId, open, onClose }: PartidaDetalhesProps) {
  const { toast } = useToast();
  const [partida, setPartida] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [placarA, setPlacarA] = useState(0);
  const [placarB, setPlacarB] = useState(0);

  useEffect(() => {
    if (partidaId && open) {
      fetchPartida();
    }
  }, [partidaId, open]);

  const fetchPartida = async () => {
    if (!partidaId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(id, nome, logo_url),
        equipe_b:equipe_b_id(id, nome, logo_url),
        evento:evento_id(nome)
      `)
      .eq("id", partidaId)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar partida",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setPartida(data);
    setPlacarA(data.placar_a || 0);
    setPlacarB(data.placar_b || 0);
    setLoading(false);
  };

  const atualizarPlacar = async () => {
    if (!partidaId) return;

    const { error } = await supabase
      .from("partidas")
      .update({ placar_a: placarA, placar_b: placarB })
      .eq("id", partidaId);

    if (error) {
      toast({
        title: "Erro ao atualizar placar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Placar atualizado",
      description: "O placar foi atualizado com sucesso.",
    });

    fetchPartida();
  };

  const finalizarPartida = async () => {
    if (!partidaId) return;

    const { error } = await supabase
      .from("partidas")
      .update({ 
        finalizada: true,
        placar_a: placarA,
        placar_b: placarB
      })
      .eq("id", partidaId);

    if (error) {
      toast({
        title: "Erro ao finalizar partida",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Partida finalizada",
      description: "A partida foi finalizada com sucesso.",
    });

    fetchPartida();
  };

  if (!partida) return null;

  const dataFormatada = format(new Date(partida.data_partida), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Partida</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Tabs defaultValue="placar" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="placar">Placar</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="placar" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Placar</CardTitle>
                    {partida.finalizada ? (
                      <Badge variant="secondary">Finalizada</Badge>
                    ) : (
                      <Badge className="bg-green-500">Ao Vivo</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex-1 text-center space-y-4">
                      <h3 className="font-bold text-xl">{partida.equipe_a.nome}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPlacarA(Math.max(0, placarA - 1))}
                          disabled={partida.finalizada}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={placarA}
                          onChange={(e) => setPlacarA(parseInt(e.target.value) || 0)}
                          className="w-24 text-center text-4xl font-bold h-16"
                          disabled={partida.finalizada}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPlacarA(placarA + 1)}
                          disabled={partida.finalizada}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-muted-foreground">×</div>

                    <div className="flex-1 text-center space-y-4">
                      <h3 className="font-bold text-xl">{partida.equipe_b.nome}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPlacarB(Math.max(0, placarB - 1))}
                          disabled={partida.finalizada}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={placarB}
                          onChange={(e) => setPlacarB(parseInt(e.target.value) || 0)}
                          className="w-24 text-center text-4xl font-bold h-16"
                          disabled={partida.finalizada}
                        >
                        </Input>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPlacarB(placarB + 1)}
                          disabled={partida.finalizada}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {!partida.finalizada && (
                    <div className="flex gap-2 mt-6">
                      <Button onClick={atualizarPlacar} className="flex-1">
                        Atualizar Placar
                      </Button>
                      <Button onClick={finalizarPartida} variant="secondary" className="flex-1">
                        Finalizar Partida
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Partida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Evento</p>
                      <p className="font-semibold">{partida.evento.nome}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Hora</p>
                      <p className="font-semibold">{dataFormatada}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-semibold">{partida.local}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fase</p>
                      <p className="font-semibold">{partida.fase}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Categoria</p>
                    <Badge variant="outline">{partida.categoria}</Badge>
                  </div>

                  {partida.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Observações</p>
                      <p className="text-sm">{partida.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estatisticas">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <p>Estatísticas detalhadas em desenvolvimento</p>
                    <p className="text-sm mt-2">Em breve: gols, cartões, substituições e mais</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <ChatPartida partidaId={partidaId!} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

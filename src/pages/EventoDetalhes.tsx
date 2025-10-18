import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventoConfigPartidas from "@/components/EventoConfigPartidas";
import GeradorPartidas from "@/components/GeradorPartidas";
import PartidaCard from "@/components/PartidaCard";
import PartidaForm from "@/components/PartidaForm";
import PartidaDetalhes from "@/components/PartidaDetalhes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [evento, setEvento] = useState<any>(null);
  const [partidas, setPartidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvento();
      fetchPartidas();
    }
  }, [id]);

  const fetchEvento = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar evento",
        description: error.message,
        variant: "destructive",
      });
      navigate("/eventos");
      return;
    }

    setEvento(data);
    setLoading(false);
  };

  const fetchPartidas = async () => {
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(id, nome, logo_url),
        equipe_b:equipe_b_id(id, nome, logo_url)
      `)
      .eq("evento_id", id)
      .order("data_partida", { ascending: true });

    if (!error && data) {
      setPartidas(data);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("partidas").delete().eq("id", deleteId);

    if (error) {
      toast({
        title: "Erro ao excluir partida",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Partida excluída",
      description: "A partida foi excluída com sucesso.",
    });

    setDeleteId(null);
    fetchPartidas();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!evento) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/eventos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{evento.nome}</h1>
          <p className="text-muted-foreground">{evento.descricao}</p>
        </div>
      </div>

      <Tabs defaultValue="partidas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="partidas">
            <Trophy className="h-4 w-4 mr-2" />
            Partidas
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partidas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Partidas</h2>
                <Button onClick={() => setShowForm(true)}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Nova Partida Manual
                </Button>
              </div>

              {partidas.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhuma partida cadastrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Use o gerador automático ou crie manualmente
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partidas.map((partida) => (
                    <PartidaCard
                      key={partida.id}
                      partida={partida}
                      onEdit={(id) => {
                        setEditingId(id);
                        setShowForm(true);
                      }}
                      onDelete={(id) => setDeleteId(id)}
                      onViewDetails={(id) => setDetalhesId(id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <GeradorPartidas
                eventoId={id!}
                categorias={evento.categorias || []}
                onSuccess={fetchPartidas}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes">
          <EventoConfigPartidas
            eventoId={id!}
            config={evento}
            onUpdate={fetchEvento}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Partida" : "Nova Partida"}
            </DialogTitle>
          </DialogHeader>
          <PartidaForm
            partidaId={editingId}
            onSuccess={() => {
              setShowForm(false);
              setEditingId(null);
              fetchPartidas();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <PartidaDetalhes
        partidaId={detalhesId}
        open={detalhesId !== null}
        onClose={() => setDetalhesId(null)}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

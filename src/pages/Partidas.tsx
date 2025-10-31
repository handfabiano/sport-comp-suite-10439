import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trophy, Plus, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PartidaForm from "@/components/PartidaForm";
import PartidaCard from "@/components/PartidaCard";
import PartidaDetalhes from "@/components/PartidaDetalhes";

export default function Partidas() {
  const { toast } = useToast();
  const [partidas, setPartidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEvento, setFiltroEvento] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    fetchPartidas();
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from("eventos")
      .select("id, nome")
      .order("data_inicio", { ascending: false });

    if (data) {
      setEventos(data);
    }
  };

  const fetchPartidas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(id, nome, logo_url),
        equipe_b:equipe_b_id(id, nome, logo_url),
        evento:evento_id(nome)
      `)
      .order("data_partida", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar partidas",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setPartidas(data || []);
    setLoading(false);
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

  const partidasFiltradas = partidas.filter((partida) => {
    const matchSearch =
      partida.equipe_a?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partida.equipe_b?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partida.local?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEvento = filtroEvento === "todos" || partida.evento_id === filtroEvento;

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "finalizada" && partida.finalizada) ||
      (filtroStatus === "agendada" && !partida.finalizada && new Date(partida.data_partida) > new Date()) ||
      (filtroStatus === "ao_vivo" && !partida.finalizada && new Date(partida.data_partida) <= new Date());

    return matchSearch && matchEvento && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Partidas</h1>
          <p className="text-muted-foreground">
            Organize e acompanhe as partidas dos eventos
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nova Partida
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipes ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEvento} onValueChange={setFiltroEvento}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os eventos</SelectItem>
                {eventos.map((evento) => (
                  <SelectItem key={evento.id} value={evento.id}>
                    {evento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="agendada">Agendadas</SelectItem>
                <SelectItem value="ao_vivo">Ao Vivo</SelectItem>
                <SelectItem value="finalizada">Finalizadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : partidasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {partidas.length === 0 ? "Nenhuma partida agendada" : "Nenhuma partida encontrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {partidas.length === 0
                ? "Comece criando partidas para seus eventos"
                : "Tente ajustar os filtros de busca"}
            </p>
            {partidas.length === 0 && (
              <Button className="gap-2" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Criar Primeira Partida
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partidasFiltradas.map((partida) => (
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

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingId(null);
      }}>
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

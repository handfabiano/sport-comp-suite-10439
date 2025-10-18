import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PartidaCardProps {
  partida: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function PartidaCard({
  partida,
  onEdit,
  onDelete,
  onViewDetails,
}: PartidaCardProps) {
  const dataFormatada = format(new Date(partida.data_partida), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const getStatusBadge = () => {
    if (partida.finalizada) {
      return <Badge variant="secondary">Finalizada</Badge>;
    }
    
    const agora = new Date();
    const dataPartida = new Date(partida.data_partida);
    
    if (dataPartida > agora) {
      return <Badge variant="outline">Agendada</Badge>;
    }
    
    return <Badge className="bg-green-500">Ao Vivo</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(partida.id)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{partida.fase}</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="font-bold text-lg mb-1">{partida.equipe_a?.nome || "Equipe A"}</p>
              {partida.finalizada && (
                <span className="text-3xl font-bold">{partida.placar_a}</span>
              )}
            </div>
            
            <div className="px-4">
              <span className="text-2xl font-bold text-muted-foreground">×</span>
            </div>
            
            <div className="flex-1 text-center">
              <p className="font-bold text-lg mb-1">{partida.equipe_b?.nome || "Equipe B"}</p>
              {partida.finalizada && (
                <span className="text-3xl font-bold">{partida.placar_b}</span>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dataFormatada}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{partida.local}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{partida.categoria}</Badge>
          </div>

          {partida.observacoes && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {partida.observacoes}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(partida.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(partida.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

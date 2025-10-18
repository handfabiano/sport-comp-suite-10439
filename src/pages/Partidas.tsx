import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Plus } from "lucide-react";

export default function Partidas() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Partidas</h1>
          <p className="text-muted-foreground">
            Organize e acompanhe as partidas dos eventos
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Partida
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma partida agendada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando partidas para seus eventos
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeira Partida
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Medal, Plus } from "lucide-react";

export default function Rankings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Rankings</h1>
          <p className="text-muted-foreground">
            Acompanhe as classificações e estatísticas
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Medal className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sem rankings disponíveis</h3>
          <p className="text-muted-foreground mb-4">
            Os rankings serão gerados automaticamente após as partidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

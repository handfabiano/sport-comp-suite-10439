import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Calendar } from "lucide-react";

interface GeradorPartidasProps {
  eventoId: string;
  categorias: string[];
  onSuccess: () => void;
}

export default function GeradorPartidas({
  eventoId,
  categorias,
  onSuccess,
}: GeradorPartidasProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [local, setLocal] = useState("");

  const gerarPartidas = async () => {
    if (!categoria || !dataInicio || !local) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de gerar as partidas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar partidas geradas pela função
      const { data: partidasGeradas, error: funcError } = await supabase.rpc(
        "gerar_partidas_evento",
        {
          p_evento_id: eventoId,
          p_categoria: categoria,
        }
      );

      if (funcError) throw funcError;

      if (!partidasGeradas || partidasGeradas.length === 0) {
        toast({
          title: "Nenhuma partida gerada",
          description: "Não há equipes suficientes nesta categoria.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calcular datas e horários para cada partida
      const dataBase = new Date(dataInicio);
      const partidasParaInserir = partidasGeradas.map((p: any, index: number) => {
        const dataPartida = new Date(dataBase);
        // Adicionar dias baseado na rodada (2 partidas por dia)
        dataPartida.setDate(dataPartida.getDate() + Math.floor(index / 2));
        // Definir horário (14h ou 16h)
        dataPartida.setHours(index % 2 === 0 ? 14 : 16, 0, 0, 0);

        return {
          evento_id: eventoId,
          categoria: categoria,
          fase: p.fase,
          equipe_a_id: p.equipe_a_id,
          equipe_b_id: p.equipe_b_id,
          data_partida: dataPartida.toISOString(),
          local: local,
          rodada: p.rodada,
          finalizada: false,
          placar_a: 0,
          placar_b: 0,
        };
      });

      // Inserir todas as partidas
      const { error: insertError } = await supabase
        .from("partidas")
        .insert(partidasParaInserir);

      if (insertError) throw insertError;

      toast({
        title: "Partidas geradas",
        description: `${partidasParaInserir.length} partidas foram criadas com sucesso.`,
      });

      onSuccess();
      setCategoria("");
      setDataInicio("");
      setLocal("");
    } catch (error: any) {
      toast({
        title: "Erro ao gerar partidas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Gerador Automático de Partidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Início
          </Label>
          <Input
            type="datetime-local"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Local Padrão</Label>
          <Input
            placeholder="Ex: Estádio Municipal"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />
        </div>

        <Button onClick={gerarPartidas} disabled={loading} className="w-full">
          {loading ? "Gerando..." : "Gerar Partidas Automaticamente"}
        </Button>
      </CardContent>
    </Card>
  );
}

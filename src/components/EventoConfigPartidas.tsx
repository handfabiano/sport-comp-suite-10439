import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trophy, Clock, Users } from "lucide-react";

interface EventoConfigPartidasProps {
  eventoId: string;
  config: any;
  onUpdate: () => void;
}

export default function EventoConfigPartidas({
  eventoId,
  config,
  onUpdate,
}: EventoConfigPartidasProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_sistema_partidas: config?.tipo_sistema_partidas || "manual",
    gera_partidas_automatico: config?.gera_partidas_automatico || false,
    formato_partidas: config?.formato_partidas || {
      tipo: "todos_contra_todos",
      ida_volta: false,
      grupos: 1,
    },
    duracao_partida: config?.duracao_partida || 90,
    intervalo_partidas: config?.intervalo_partidas || 30,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("eventos")
        .update(formData)
        .eq("id", eventoId);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações de partidas foram atualizadas.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Partidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geração Automática de Partidas</Label>
                <p className="text-sm text-muted-foreground">
                  Gerar automaticamente todas as partidas baseado no formato escolhido
                </p>
              </div>
              <Switch
                checked={formData.gera_partidas_automatico}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, gera_partidas_automatico: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Sistema</Label>
              <Select
                value={formData.tipo_sistema_partidas}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_sistema_partidas: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatico">Automático</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato das Partidas</Label>
              <Select
                value={formData.formato_partidas.tipo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    formato_partidas: {
                      ...formData.formato_partidas,
                      tipo: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos_contra_todos">
                    Todos Contra Todos
                  </SelectItem>
                  <SelectItem value="eliminatorio">Eliminatório</SelectItem>
                  <SelectItem value="grupos_eliminatorio">
                    Grupos + Eliminatório
                  </SelectItem>
                  <SelectItem value="suico">Sistema Suíço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.formato_partidas.tipo === "todos_contra_todos" && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ida e Volta</Label>
                  <p className="text-sm text-muted-foreground">
                    Cada equipe joga duas vezes contra cada adversário
                  </p>
                </div>
                <Switch
                  checked={formData.formato_partidas.ida_volta}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      formato_partidas: {
                        ...formData.formato_partidas,
                        ida_volta: checked,
                      },
                    })
                  }
                />
              </div>
            )}

            {formData.formato_partidas.tipo === "grupos_eliminatorio" && (
              <div className="space-y-2">
                <Label>Número de Grupos</Label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.formato_partidas.grupos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      formato_partidas: {
                        ...formData.formato_partidas,
                        grupos: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração da Partida (minutos)
              </Label>
              <Input
                type="number"
                min="30"
                max="180"
                value={formData.duracao_partida}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duracao_partida: parseInt(e.target.value) || 90,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Intervalo entre Partidas (minutos)
              </Label>
              <Input
                type="number"
                min="0"
                max="120"
                value={formData.intervalo_partidas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intervalo_partidas: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

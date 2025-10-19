import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Partida {
  id: string;
  evento_id: string;
  categoria: string;
  fase: string;
  equipe_a_id: string;
  equipe_b_id: string;
  data_partida: string;
  local: string;
  placar_a: number;
  placar_b: number;
  finalizada: boolean;
}

export function usePartida(partidaId?: string) {
  const { toast } = useToast();
  const [partida, setPartida] = useState<any>(null);
  const [partidas, setPartidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (partidaId) {
      fetchPartida(partidaId);
    } else {
      fetchPartidas();
    }
  }, [partidaId]);

  const fetchPartida = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partidas")
        .select(`
          *,
          equipe_a:equipe_a_id(id, nome, logo_url),
          equipe_b:equipe_b_id(id, nome, logo_url),
          evento:evento_id(nome)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPartida(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar partida",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartidas = async (filters?: {
    eventoId?: string;
    categoria?: string;
    finalizada?: boolean;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from("partidas")
        .select(`
          *,
          equipe_a:equipe_a_id(nome, logo_url),
          equipe_b:equipe_b_id(nome, logo_url),
          evento:evento_id(nome)
        `)
        .order("data_partida", { ascending: true });

      if (filters?.eventoId) {
        query = query.eq("evento_id", filters.eventoId);
      }
      if (filters?.categoria) {
        query = query.eq("categoria", filters.categoria);
      }
      if (filters?.finalizada !== undefined) {
        query = query.eq("finalizada", filters.finalizada);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartidas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar partidas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlacar = async (id: string, placarA: number, placarB: number) => {
    try {
      const { error } = await supabase
        .from("partidas")
        .update({ placar_a: placarA, placar_b: placarB })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Placar atualizado",
        description: "O placar foi atualizado com sucesso.",
      });

      if (partidaId) {
        fetchPartida(id);
      } else {
        fetchPartidas();
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar placar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const finalizarPartida = async (id: string, placarA: number, placarB: number) => {
    try {
      const { error } = await supabase
        .from("partidas")
        .update({
          finalizada: true,
          placar_a: placarA,
          placar_b: placarB,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Partida finalizada",
        description: "A partida foi finalizada e o ranking foi atualizado.",
      });

      if (partidaId) {
        fetchPartida(id);
      } else {
        fetchPartidas();
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar partida",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    partida,
    partidas,
    loading,
    fetchPartida,
    fetchPartidas,
    updatePlacar,
    finalizarPartida,
  };
}

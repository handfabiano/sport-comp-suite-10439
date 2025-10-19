import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Evento {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: string;
  banner_url: string | null;
  modalidade: string;
  categorias: string[];
}

export function useEvento(eventoId?: string) {
  const { toast } = useToast();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventoId) {
      fetchEvento(eventoId);
    } else {
      fetchEventos();
    }
  }, [eventoId]);

  const fetchEvento = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvento(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar evento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .order("data_inicio", { ascending: false });

      if (error) throw error;
      setEventos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (data: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("eventos").insert([
        {
          ...data,
          organizador_id: userData.user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      });

      fetchEventos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEvento = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from("eventos")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });

      if (eventoId) {
        fetchEvento(id);
      } else {
        fetchEventos();
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase.from("eventos").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });

      fetchEventos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    evento,
    eventos,
    loading,
    fetchEvento,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
  };
}

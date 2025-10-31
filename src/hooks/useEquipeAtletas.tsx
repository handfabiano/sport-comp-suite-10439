import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EquipeAtleta {
  id: string;
  equipe_id: string;
  atleta_id: string;
  data_entrada: string;
  ativo: boolean;
  atleta?: {
    nome: string;
    sexo: string;
    data_nascimento: string;
  };
}

export function useEquipeAtletas(equipeId?: string) {
  const [atletasEquipe, setAtletasEquipe] = useState<EquipeAtleta[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAtletasEquipe = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("equipe_atletas")
        .select(`
          *,
          atleta:atletas(nome, sexo, data_nascimento)
        `)
        .eq("equipe_id", id)
        .order("data_entrada", { ascending: false });

      if (error) throw error;
      setAtletasEquipe(data || []);
    } catch (error: any) {
      toast.error("Erro ao buscar atletas da equipe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAtletaToEquipe = async (equipeId: string, atletaId: string) => {
    try {
      const { error } = await supabase
        .from("equipe_atletas")
        .insert({ equipe_id: equipeId, atleta_id: atletaId });

      if (error) throw error;
      toast.success("Atleta adicionado à equipe com sucesso!");
      fetchAtletasEquipe(equipeId);
    } catch (error: any) {
      toast.error("Erro ao adicionar atleta: " + error.message);
    }
  };

  const removeAtletaFromEquipe = async (id: string, equipeId: string) => {
    try {
      const { error } = await supabase
        .from("equipe_atletas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Atleta removido da equipe!");
      fetchAtletasEquipe(equipeId);
    } catch (error: any) {
      toast.error("Erro ao remover atleta: " + error.message);
    }
  };

  const toggleAtletaStatus = async (id: string, ativo: boolean, equipeId: string) => {
    try {
      const { error } = await supabase
        .from("equipe_atletas")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Atleta ${ativo ? "ativado" : "desativado"}!`);
      fetchAtletasEquipe(equipeId);
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  useEffect(() => {
    if (equipeId) {
      fetchAtletasEquipe(equipeId);
    }
  }, [equipeId]);

  return {
    atletasEquipe,
    loading,
    fetchAtletasEquipe,
    addAtletaToEquipe,
    removeAtletaFromEquipe,
    toggleAtletaStatus,
  };
}

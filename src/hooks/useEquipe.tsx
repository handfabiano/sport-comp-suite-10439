import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Equipe {
  id: string;
  nome: string;
  tecnico: string | null;
  modalidade: string;
  categoria: string;
  cidade: string | null;
  estadio_casa: string | null;
  ano_fundacao: number | null;
  logo_url: string | null;
  uniforme_principal: any;
  uniforme_alternativo: any;
  estatisticas: any;
  ativa: boolean;
  numero_atletas: number;
  limite_atletas: number | null;
  responsavel_id: string | null;
  created_at: string;
}

export function useEquipe(equipeId?: string) {
  const { toast } = useToast();
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (equipeId) {
      fetchEquipe(equipeId);
    } else {
      fetchEquipes();
    }
  }, [equipeId]);

  const fetchEquipe = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("equipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEquipe(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar equipe",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("equipes")
        .select("*")
        .eq("ativa", true)
        .order("nome");

      if (error) throw error;
      setEquipes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar equipes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEquipe = async (data: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("equipes").insert([
        {
          ...data,
          responsavel_id: userData.user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Equipe criada",
        description: "A equipe foi criada com sucesso.",
      });

      fetchEquipes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao criar equipe",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEquipe = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from("equipes")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Equipe atualizada",
        description: "A equipe foi atualizada com sucesso.",
      });

      if (equipeId) {
        fetchEquipe(id);
      } else {
        fetchEquipes();
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar equipe",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEquipe = async (id: string) => {
    try {
      const { error } = await supabase.from("equipes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Equipe excluída",
        description: "A equipe foi excluída com sucesso.",
      });

      fetchEquipes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao excluir equipe",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const inscreverEquipeEmEvento = async (equipeId: string, eventoId: string, categoria: string) => {
    try {
      const { error } = await supabase.from("inscricoes").insert([
        {
          equipe_id: equipeId,
          evento_id: eventoId,
          categoria: categoria,
          status: "pendente",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Inscrição realizada",
        description: "A equipe foi inscrita no evento com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao inscrever equipe",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    equipe,
    equipes,
    loading,
    fetchEquipe,
    fetchEquipes,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    inscreverEquipeEmEvento,
  };
}

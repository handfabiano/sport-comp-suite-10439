import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Atleta {
  id: string;
  nome: string;
  foto_url: string | null;
  categoria: string;
  posicao: string | null;
  numero_uniforme: number | null;
  equipe_id: string | null;
  data_nascimento: string | null;
  ativo: boolean;
}

export function useAtleta(atletaId?: string) {
  const { toast } = useToast();
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (atletaId) {
      fetchAtleta(atletaId);
    } else {
      fetchAtletas();
    }
  }, [atletaId]);

  const fetchAtleta = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("atletas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAtleta(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar atleta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAtletas = async (filters?: { categoria?: string; equipeId?: string }) => {
    setLoading(true);
    try {
      let query = supabase
        .from("atletas")
        .select("*")
        .order("nome", { ascending: true });

      if (filters?.categoria) {
        query = query.eq("categoria", filters.categoria);
      }
      if (filters?.equipeId) {
        query = query.eq("equipe_id", filters.equipeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAtletas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar atletas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAtleta = async (data: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("atletas").insert([
        {
          ...data,
          user_id: userData.user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Atleta cadastrado",
        description: "O atleta foi cadastrado com sucesso.",
      });

      fetchAtletas();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar atleta",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAtleta = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from("atletas")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Atleta atualizado",
        description: "O atleta foi atualizado com sucesso.",
      });

      if (atletaId) {
        fetchAtleta(id);
      } else {
        fetchAtletas();
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar atleta",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    atleta,
    atletas,
    loading,
    fetchAtleta,
    fetchAtletas,
    createAtleta,
    updateAtleta,
  };
}

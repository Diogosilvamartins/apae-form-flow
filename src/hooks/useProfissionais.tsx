import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EspecialidadeProfissional = 
  | 'psicologo'
  | 'assistente_social' 
  | 'fonoaudiologo'
  | 'fisioterapeuta'
  | 'terapeuta_ocupacional'
  | 'pedagogo'
  | 'nutricionista'
  | 'medico'
  | 'outro';

export interface Profissional {
  id_profissional: string;
  nome: string;
  especialidade: EspecialidadeProfissional;
  registro_profissional?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfissionalData {
  nome: string;
  especialidade: EspecialidadeProfissional;
  registro_profissional?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
}

export interface UpdateProfissionalData {
  nome?: string;
  especialidade?: EspecialidadeProfissional;
  registro_profissional?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
  ativo?: boolean;
}

export function useProfissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfissionais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Error fetching profissionais:", error);
        toast.error("Erro ao carregar profissionais");
        throw error;
      }

      setProfissionais(data || []);
    } catch (error) {
      console.error("Error in fetchProfissionais:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfissional = async (profissionalData: CreateProfissionalData) => {
    try {
      const { data, error } = await supabase
        .from("profissionais")
        .insert([profissionalData])
        .select()
        .single();

      if (error) {
        console.error("Error creating profissional:", error);
        toast.error("Erro ao criar profissional");
        throw error;
      }

      setProfissionais(prev => [...prev, data]);
      toast.success("Profissional criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in createProfissional:", error);
      throw error;
    }
  };

  const updateProfissional = async (id: string, profissionalData: UpdateProfissionalData) => {
    try {
      const { data, error } = await supabase
        .from("profissionais")
        .update(profissionalData)
        .eq("id_profissional", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profissional:", error);
        toast.error("Erro ao atualizar profissional");
        throw error;
      }

      setProfissionais(prev =>
        prev.map(profissional =>
          profissional.id_profissional === id ? data : profissional
        )
      );
      toast.success("Profissional atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in updateProfissional:", error);
      throw error;
    }
  };

  const deleteProfissional = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profissionais")
        .delete()
        .eq("id_profissional", id);

      if (error) {
        console.error("Error deleting profissional:", error);
        toast.error("Erro ao excluir profissional");
        throw error;
      }

      setProfissionais(prev =>
        prev.filter(profissional => profissional.id_profissional !== id)
      );
      toast.success("Profissional excluído com sucesso!");
    } catch (error) {
      console.error("Error in deleteProfissional:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfissionais();
  }, []);

  return {
    profissionais,
    loading,
    createProfissional,
    updateProfissional,
    deleteProfissional,
    refetch: fetchProfissionais,
  };
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Assistido {
  id_assistido: string;
  nome: string;
  data_nascimento?: string;
  celular?: string;
  observacoes?: string;
  responsavel_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  
  // Dados Pessoais
  cpf?: string;
  rg?: string;
  sexo?: "masculino" | "feminino" | "outro";
  estado_civil?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | "outro";
  telefone?: string;
  email?: string;
  foto_url?: string;
  
  // Contato/Endereço
  endereco_completo?: string;
  numero?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  
  // Responsável
  nome_responsavel?: string;
  cpf_responsavel?: string;
  parentesco?: "pai" | "mae" | "irmao" | "irma" | "avo" | "avo_materna" | "tio" | "tia" | "primo" | "prima" | "outro";
  telefone_responsavel?: string;
  
  // Observações
  observacoes_gerais?: string;
  paciente_ativo?: boolean;
}

export interface CreateAssistidoData {
  nome: string;
  data_nascimento?: string;
  celular?: string;
  observacoes?: string;
  responsavel_id?: string;
  
  // Dados Pessoais
  cpf?: string;
  rg?: string;
  sexo?: "masculino" | "feminino" | "outro";
  estado_civil?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | "outro";
  telefone?: string;
  email?: string;
  foto_url?: string;
  
  // Contato/Endereço
  endereco_completo?: string;
  numero?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  
  // Responsável
  nome_responsavel?: string;
  cpf_responsavel?: string;
  parentesco?: "pai" | "mae" | "irmao" | "irma" | "avo" | "avo_materna" | "tio" | "tia" | "primo" | "prima" | "outro";
  telefone_responsavel?: string;
  
  // Observações
  observacoes_gerais?: string;
  paciente_ativo?: boolean;
}

export interface UpdateAssistidoData {
  nome?: string;
  data_nascimento?: string;
  celular?: string;
  observacoes?: string;
  responsavel_id?: string;
  ativo?: boolean;
  
  // Dados Pessoais
  cpf?: string;
  rg?: string;
  sexo?: "masculino" | "feminino" | "outro";
  estado_civil?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | "outro";
  telefone?: string;
  email?: string;
  foto_url?: string;
  
  // Contato/Endereço
  endereco_completo?: string;
  numero?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  
  // Responsável
  nome_responsavel?: string;
  cpf_responsavel?: string;
  parentesco?: "pai" | "mae" | "irmao" | "irma" | "avo" | "avo_materna" | "tio" | "tia" | "primo" | "prima" | "outro";
  telefone_responsavel?: string;
  
  // Observações
  observacoes_gerais?: string;
  paciente_ativo?: boolean;
}

export function useAssistidos() {
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssistidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assistidos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Error fetching assistidos:", error);
        toast.error("Erro ao carregar assistidos");
        throw error;
      }

      setAssistidos(data || []);
    } catch (error) {
      console.error("Error in fetchAssistidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAssistido = async (assistidoData: CreateAssistidoData) => {
    try {
      const { data, error } = await supabase
        .from("assistidos")
        .insert([assistidoData])
        .select()
        .single();

      if (error) {
        console.error("Error creating assistido:", error);
        toast.error("Erro ao criar assistido");
        throw error;
      }

      setAssistidos(prev => [...prev, data]);
      toast.success("Assistido criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in createAssistido:", error);
      throw error;
    }
  };

  const updateAssistido = async (id: string, assistidoData: UpdateAssistidoData) => {
    try {
      const { data, error } = await supabase
        .from("assistidos")
        .update(assistidoData)
        .eq("id_assistido", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating assistido:", error);
        toast.error("Erro ao atualizar assistido");
        throw error;
      }

      setAssistidos(prev =>
        prev.map(assistido =>
          assistido.id_assistido === id ? data : assistido
        )
      );
      toast.success("Assistido atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in updateAssistido:", error);
      throw error;
    }
  };

  const deleteAssistido = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assistidos")
        .delete()
        .eq("id_assistido", id);

      if (error) {
        console.error("Error deleting assistido:", error);
        toast.error("Erro ao excluir assistido");
        throw error;
      }

      setAssistidos(prev =>
        prev.filter(assistido => assistido.id_assistido !== id)
      );
      toast.success("Assistido excluído com sucesso!");
    } catch (error) {
      console.error("Error in deleteAssistido:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAssistidos();
  }, []);

  return {
    assistidos,
    loading,
    createAssistido,
    updateAssistido,
    deleteAssistido,
    refetch: fetchAssistidos,
  };
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export type StatusAgendamento = 
  | 'agendado'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'reagendado';

export interface Agendamento {
  id_agendamento: string;
  assistido_id: string;
  profissional_id: string;
  data_hora: string;
  duracao_minutos: number;
  status: StatusAgendamento;
  observacoes?: string;
  criado_por: string;
  created_at: string;
  updated_at: string;
  token_confirmacao?: string;
  confirmado_em?: string | null;
  confirmado_por_telefone?: string | null;
  // Relacionamentos
  assistidos?: {
    nome: string;
    celular?: string;
  };
  profissionais?: {
    nome: string;
    especialidade: string;
  };
}

export interface CreateAgendamentoData {
  assistido_id: string;
  profissional_id: string;
  data_hora: string;
  duracao_minutos?: number;
  observacoes?: string;
}

export interface UpdateAgendamentoData {
  assistido_id?: string;
  profissional_id?: string;
  data_hora?: string;
  duracao_minutos?: number;
  status?: StatusAgendamento;
  observacoes?: string;
}

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando agendamentos...");
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          assistidos:assistido_id (nome, celular),
          profissionais:profissional_id (nome, especialidade)
        `)
        .order("data_hora", { ascending: true });

      if (error) {
        console.error("❌ Error fetching agendamentos:", error);
        toast.error("Erro ao carregar agendamentos");
        throw error;
      }

      console.log("✅ Agendamentos retornados:", data?.length || 0);
      console.log("📋 Dados dos agendamentos:", data);
      setAgendamentos(data || []);
    } catch (error) {
      console.error("Error in fetchAgendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAgendamento = async (agendamentoData: CreateAgendamentoData) => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const dataToInsert = {
        ...agendamentoData,
        criado_por: user.id,
        duracao_minutos: agendamentoData.duracao_minutos || 60,
      };

      const { data, error } = await supabase
        .from("agendamentos")
        .insert([dataToInsert])
        .select(`
          *,
          assistidos:assistido_id (nome, celular),
          profissionais:profissional_id (nome, especialidade)
        `)
        .single();

      if (error) {
        console.error("Error creating agendamento:", error);
        toast.error("Erro ao criar agendamento");
        throw error;
      }

      setAgendamentos(prev => [...prev, data]);
      toast.success("Agendamento criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in createAgendamento:", error);
      throw error;
    }
  };

  const updateAgendamento = async (id: string, agendamentoData: UpdateAgendamentoData) => {
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(agendamentoData)
        .eq("id_agendamento", id)
        .select(`
          *,
          assistidos:assistido_id (nome, celular),
          profissionais:profissional_id (nome, especialidade)
        `)
        .single();

      if (error) {
        console.error("Error updating agendamento:", error);
        toast.error("Erro ao atualizar agendamento");
        throw error;
      }

      setAgendamentos(prev =>
        prev.map(agendamento =>
          agendamento.id_agendamento === id ? data : agendamento
        )
      );
      toast.success("Agendamento atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in updateAgendamento:", error);
      throw error;
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id_agendamento", id);

      if (error) {
        console.error("Error deleting agendamento:", error);
        toast.error("Erro ao excluir agendamento");
        throw error;
      }

      setAgendamentos(prev =>
        prev.filter(agendamento => agendamento.id_agendamento !== id)
      );
      toast.success("Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("Error in deleteAgendamento:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAgendamentos();

    // Configurar real-time subscription para agendamentos
    const channel = supabase
      .channel('agendamentos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos'
        },
        (payload) => {
          console.log('Agendamento atualizado via realtime:', payload);
          // Recarregar dados quando houver mudanças
          fetchAgendamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    agendamentos,
    loading,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    refetch: fetchAgendamentos,
  };
}
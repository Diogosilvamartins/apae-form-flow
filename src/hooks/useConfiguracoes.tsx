import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Configuracao {
  id: string;
  chave: string;
  valor: string | null;
  descricao: string | null;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .order("chave", { ascending: true });

      if (error) {
        console.error("Error fetching configuracoes:", error);
        toast.error("Erro ao carregar configurações");
        throw error;
      }

      setConfiguracoes(data || []);
    } catch (error) {
      console.error("Error in fetchConfiguracoes:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracao = async (chave: string, valor: string) => {
    try {
      const { data, error } = await supabase
        .from("configuracoes")
        .update({ valor })
        .eq("chave", chave)
        .select()
        .single();

      if (error) {
        console.error("Error updating configuracao:", error);
        toast.error("Erro ao atualizar configuração");
        throw error;
      }

      setConfiguracoes(prev =>
        prev.map(config =>
          config.chave === chave ? data : config
        )
      );
      toast.success("Configuração atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error in updateConfiguracao:", error);
      throw error;
    }
  };

  const getConfiguracao = (chave: string): string | null => {
    const config = configuracoes.find(c => c.chave === chave);
    return config?.valor || null;
  };

  const getNumeroWhatsAppPadrao = (): string => {
    return getConfiguracao('numero_whatsapp_padrao') || '33999799138';
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    updateConfiguracao,
    getConfiguracao,
    getNumeroWhatsAppPadrao,
    refetch: fetchConfiguracoes,
  };
}
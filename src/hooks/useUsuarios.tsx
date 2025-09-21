import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Usuario = Tables<'usuarios'>;
type CreateUsuario = TablesInsert<'usuarios'>;
type UpdateUsuario = TablesUpdate<'usuarios'>;

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (usuario: CreateUsuario) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(usuario)
        .select()
        .single();

      if (error) throw error;

      setUsuarios(prev => [...prev, data]);
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso.",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating usuario:', error);
      toast({
        title: "Erro ao criar usuário",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateUsuario = async (id: string, usuario: UpdateUsuario) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(usuario)
        .eq('id_usuario', id)
        .select()
        .single();

      if (error) throw error;

      setUsuarios(prev => prev.map(u => u.id_usuario === id ? data : u));
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso.",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating usuario:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', id);

      if (error) throw error;

      setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
      toast({
        title: "Usuário removido",
        description: "Usuário removido com sucesso.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting usuario:', error);
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    refetch: fetchUsuarios,
  };
}
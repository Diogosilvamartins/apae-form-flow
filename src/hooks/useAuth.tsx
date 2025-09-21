import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Usuario = Tables<'usuarios'>;

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createTestUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch usuario data when user is authenticated
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id_usuario', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching usuario:', error);
                return;
              }

              setUsuario(data);
            } catch (error) {
              console.error('Error in usuario fetch:', error);
            }
          }, 0);
        } else {
          setUsuario(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, senha: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        return { error: 'Email ou senha inválidos' };
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo!`,
      });

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Erro interno do servidor' };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado com sucesso",
      });
    }
  };

  const createTestUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: {},
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Usuários de teste criados",
        description: "Agora você pode fazer login com as credenciais de teste.",
      });

      console.log('Resultado da criação de usuários:', data);
    } catch (error) {
      console.error('Erro ao criar usuários de teste:', error);
      toast({
        title: "Erro ao criar usuários",
        description: "Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usuario,
        session,
        loading,
        signIn,
        signOut,
        createTestUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
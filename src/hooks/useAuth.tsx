import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<{ error: string | null }>;
  signUp: (email: string, senha: string, nome: string, tipo: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
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

  const signUp = async (email: string, senha: string, nome: string, tipo: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
            tipo_usuario: tipo,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Você pode fazer login agora.",
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
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

  // Enhance user with metadata
  const enhancedUser = user ? {
    ...user,
    nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
    tipo_usuario: user.user_metadata?.tipo_usuario || 'funcionario',
  } as any : null;

  return (
    <AuthContext.Provider
      value={{
        user: enhancedUser,
        session,
        loading,
        signIn,
        signUp,
        signOut,
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
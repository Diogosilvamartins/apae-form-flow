import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const { user, signIn, resendConfirmation } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(loginData.email, loginData.senha);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">A</span>
          </div>
          <CardTitle className="text-2xl font-bold">Sistema APAE</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema de gestão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="seu.email@teste.com"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-senha">Senha</Label>
              <Input
                id="login-senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={loginData.senha}
                onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                required
                autoComplete="current-password"
                minLength={6}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={async () => {
                  if (!loginData.email) {
                    toast({
                      title: "Informe o email",
                      description: "Preencha o campo email para reenviar a confirmação.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setLoading(true);
                  const { error } = await resendConfirmation(loginData.email);
                  if (error) {
                    toast({ title: "Falha ao reenviar", description: error, variant: "destructive" });
                  } else {
                    toast({ title: "Email reenviado", description: "Verifique sua caixa de entrada." });
                  }
                  setLoading(false);
                }}
              >
                Reenviar e-mail de confirmação
              </button>
            </div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-bold text-center mb-2">ℹ️ Informação:</p>
            <div className="space-y-1 text-xs">
              <p>Novos usuários devem ser cadastrados pela secretaria através do sistema.</p>
              <p>Entre em contato com a administração se você não possui acesso.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
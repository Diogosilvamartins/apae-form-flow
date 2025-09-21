import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    senha: '', 
    nome: '', 
    tipo: 'psicologo' 
  });
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, resendConfirmation } = useAuth();
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.senha || !signupData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.senha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(signupData.email, signupData.senha, signupData.nome, signupData.tipo);
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error,
          variant: "destructive",
        });
      } else {
        setSignupData({ email: '', senha: '', nome: '', tipo: 'funcionario' });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
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
            Acesse ou crie sua conta no sistema de gestão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome Completo</Label>
                  <Input
                    id="signup-nome"
                    name="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={signupData.nome}
                    onChange={(e) => setSignupData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu.email@teste.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-senha">Senha</Label>
                  <Input
                    id="signup-senha"
                    name="senha"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.senha}
                    onChange={(e) => setSignupData(prev => ({ ...prev, senha: e.target.value }))}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-tipo">Tipo de Usuário</Label>
                  <Select 
                    value={signupData.tipo} 
                    onValueChange={(value) => setSignupData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="psicologo">Psicólogo</SelectItem>
                      <SelectItem value="assistente_social">Assistente Social</SelectItem>
                      <SelectItem value="secretaria">Secretária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando conta...
                    </div>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-bold text-center mb-2">💡 Como usar:</p>
            <div className="space-y-1 text-xs">
              <p><strong>1.</strong> Clique em "Cadastro" para criar sua conta</p>
              <p><strong>2.</strong> Ou faça login se já tiver uma conta</p>
              <p><strong>3.</strong> Escolha o tipo: Administrador, Psicólogo, Assistente Social ou Secretária</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
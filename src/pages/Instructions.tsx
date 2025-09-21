import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, FolderOpen, HelpCircle, MessageSquare, History, Key, Database, Shield } from "lucide-react";

export default function Instructions() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sistema APAE - Guia de Uso</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gestão da APAE. Aqui está tudo que você precisa saber para começar.
        </p>
      </div>

      {/* Credenciais de Teste */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credenciais de Teste
          </CardTitle>
          <CardDescription>
            Use essas credenciais para testar o sistema. Senha para todos: <strong>123456</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Admin</Badge>
              </div>
              <p className="text-sm font-mono">admin@apae.com</p>
              <p className="text-xs text-muted-foreground">Acesso total ao sistema</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">Funcionário</Badge>
              </div>
              <p className="text-sm font-mono">funcionario@apae.com</p>
              <p className="text-xs text-muted-foreground">Acesso operacional</p>
            </div>
            <div className="p-3 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">Responsável</Badge>
              </div>
              <p className="text-sm font-mono">responsavel@apae.com</p>
              <p className="text-xs text-muted-foreground">Acesso limitado aos seus assistidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Módulos do Sistema
          </CardTitle>
          <CardDescription>
            Conheça todos os módulos disponíveis e suas funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold">Usuários</h3>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento de usuários do sistema. Apenas admins têm acesso.
                </p>
                <Badge variant="destructive" className="mt-1">Admin</Badge>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Assistidos</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastro e gerenciamento das pessoas assistidas pela APAE.
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="destructive">Admin</Badge>
                  <Badge variant="default">Funcionário</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <FolderOpen className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Categorias</h3>
                <p className="text-sm text-muted-foreground">
                  Organização das perguntas em categorias temáticas.
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="destructive">Admin</Badge>
                  <Badge variant="default">Funcionário</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <HelpCircle className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Perguntas</h3>
                <p className="text-sm text-muted-foreground">
                  Questionários e perguntas para avaliação dos assistidos.
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="destructive">Admin</Badge>
                  <Badge variant="default">Funcionário</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Respostas</h3>
                <p className="text-sm text-muted-foreground">
                  Respostas dos questionários com sistema de versionamento.
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="destructive">Admin</Badge>
                  <Badge variant="default">Funcionário</Badge>
                  <Badge variant="secondary">Responsável</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <History className="h-8 w-8 text-gray-600" />
              <div>
                <h3 className="font-semibold">Histórico</h3>
                <p className="text-sm text-muted-foreground">
                  Auditoria completa de todas as alterações no sistema.
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="destructive">Admin</Badge>
                  <Badge variant="default">Funcionário</Badge>
                  <Badge variant="secondary">Responsável</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Características Técnicas
          </CardTitle>
          <CardDescription>
            Funcionalidades avançadas implementadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✅ Recursos Implementados</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Sistema de autenticação Supabase</li>
                <li>• Controle de acesso baseado em roles</li>
                <li>• CRUD completo para todos os módulos</li>
                <li>• Interface responsiva e moderna</li>
                <li>• Validação de dados robusta</li>
                <li>• Estrutura modular organizizada</li>
                <li>• Banco de dados com RLS habilitado</li>
                <li>• Dados de teste pré-carregados</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">🚧 Próximos Passos</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Implementar páginas de Assistidos</li>
                <li>• Criar formulários de Categorias</li>
                <li>• Sistema de Perguntas dinâmicas</li>
                <li>• Interface de Respostas com versionamento</li>
                <li>• Página de Histórico com filtros</li>
                <li>• Sistema de relatórios</li>
                <li>• Upload de arquivos</li>
                <li>• Notificações em tempo real</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fluxo de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Trabalho Recomendado</CardTitle>
          <CardDescription>
            Como usar o sistema de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold">Configuração Inicial</h4>
                <p className="text-sm text-muted-foreground">
                  Configure categorias e perguntas antes de cadastrar assistidos.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold">Cadastro de Assistidos</h4>
                <p className="text-sm text-muted-foreground">
                  Cadastre as pessoas que serão atendidas pela APAE.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold">Preenchimento de Questionários</h4>
                <p className="text-sm text-muted-foreground">
                  Responda os questionários para cada assistido conforme necessário.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold">Acompanhamento</h4>
                <p className="text-sm text-muted-foreground">
                  Use o histórico para acompanhar a evolução e mudanças.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, FolderOpen, HelpCircle, MessageSquare, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Usuários",
      icon: Users,
      description: "Gerenciar usuários do sistema",
      count: "---",
      href: "/usuarios",
      roles: ["administrador"]
    },
    {
      title: "Assistidos",
      icon: UserCheck,
      description: "Cadastro de pessoas assistidas",
      count: "---",
      href: "/assistidos",
      roles: ["administrador", "psicologo", "assistente_social"]
    },
    {
      title: "Categorias",
      icon: FolderOpen,
      description: "Organização das perguntas",
      count: "---",
      href: "/categorias",
      roles: ["administrador", "psicologo", "assistente_social"]
    },
    {
      title: "Perguntas",
      icon: HelpCircle,
      description: "Questionários do sistema",
      count: "---",
      href: "/perguntas",
      roles: ["administrador", "psicologo", "assistente_social"]
    },
    {
      title: "Respostas",
      icon: MessageSquare,
      description: "Respostas dos assistidos",
      count: "---",
      href: "/respostas",
      roles: ["administrador", "psicologo", "assistente_social", "secretaria"]
    },
    {
      title: "Histórico",
      icon: History,
      description: "Auditoria de alterações",
      count: "---",
      href: "/historico",
      roles: ["administrador", "psicologo", "assistente_social", "secretaria"]
    }
  ];

  const hasAccess = (roles: string[]) => {
    const userType = (user as any)?.tipo_usuario || user?.user_metadata?.tipo_usuario;
    if (!userType) return false;
    return roles.includes(userType);
  };

  const visibleStats = stats.filter(stat => hasAccess(stat.roles));

  const getTipoUsuarioLabel = (tipo: string) => {
    const labels = {
      administrador: 'Administrador',
      psicologo: 'Psicólogo',
      assistente_social: 'Assistente Social',
      secretaria: 'Secretária',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Sistema APAE, {user?.user_metadata?.nome || user?.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Perfil: {((user as any)?.tipo_usuario || user?.user_metadata?.tipo_usuario) ? 
            getTipoUsuarioLabel((user as any)?.tipo_usuario || user?.user_metadata?.tipo_usuario) : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <CardDescription className="text-xs">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade recente para exibir.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>
              Resumo geral do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total de assistidos:</span>
                <span className="text-sm font-medium">---</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Perguntas ativas:</span>
                <span className="text-sm font-medium">---</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Respostas hoje:</span>
                <span className="text-sm font-medium">---</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

import { Users, UserCheck, FolderOpen, HelpCircle, MessageSquare, History, Settings, Stethoscope, Calendar } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Usuários", url: "/usuarios", icon: Users, roles: ["administrador"] },
  { title: "Assistidos", url: "/assistidos", icon: UserCheck, roles: ["administrador", "psicologo", "assistente_social"] },
  { title: "Profissionais", url: "/profissionais", icon: Stethoscope, roles: ["administrador", "psicologo", "assistente_social"] },
  { title: "Agenda", url: "/agenda", icon: Calendar, roles: ["administrador", "psicologo", "assistente_social", "secretaria"] },
  { title: "Categorias", url: "/categorias", icon: FolderOpen, roles: ["administrador", "psicologo", "assistente_social"] },
  { title: "Perguntas", url: "/perguntas", icon: HelpCircle, roles: ["administrador", "psicologo", "assistente_social"] },
  { title: "Respostas", url: "/respostas", icon: MessageSquare, roles: ["administrador", "psicologo", "assistente_social", "secretaria"] },
  { title: "Histórico", url: "/historico", icon: History, roles: ["administrador", "psicologo", "assistente_social", "secretaria"] },
  { title: "Instruções", url: "/instrucoes", icon: Settings, roles: ["administrador", "psicologo", "assistente_social", "secretaria"] },
];

export function AppSidebar() {
  const { state, open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const hasAccess = (roles: string[]) => {
    const userType = (user as any)?.tipo_usuario || user?.user_metadata?.tipo_usuario;
    
    if (!userType) return false;
    return roles.includes(userType);
  };

  const visibleItems = menuItems.filter(item => hasAccess(item.roles));

  return (
    <Sidebar className="w-60" variant="sidebar" collapsible="none">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">APAE GV</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
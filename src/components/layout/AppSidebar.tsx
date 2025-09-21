import { Users, UserCheck, FolderOpen, HelpCircle, MessageSquare, History, Settings } from "lucide-react";
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
  { title: "Usuários", url: "/usuarios", icon: Users, roles: ["admin"] },
  { title: "Assistidos", url: "/assistidos", icon: UserCheck, roles: ["admin", "funcionario"] },
  { title: "Categorias", url: "/categorias", icon: FolderOpen, roles: ["admin", "funcionario"] },
  { title: "Perguntas", url: "/perguntas", icon: HelpCircle, roles: ["admin", "funcionario"] },
  { title: "Respostas", url: "/respostas", icon: MessageSquare, roles: ["admin", "funcionario", "responsavel"] },
  { title: "Histórico", url: "/historico", icon: History, roles: ["admin", "funcionario", "responsavel"] },
  { title: "Instruções", url: "/instrucoes", icon: Settings, roles: ["admin", "funcionario", "responsavel"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { usuario } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const hasAccess = (roles: string[]) => {
    if (!usuario?.tipo_usuario) return false;
    return roles.includes(usuario.tipo_usuario);
  };

  const visibleItems = menuItems.filter(item => hasAccess(item.roles));

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">APAE GV</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          )}
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
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import apaeLogoImg from "@/assets/apae-logo.jpg";

export function AppHeader() {
  const { user, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTipoUsuarioLabel = (tipo: string) => {
    const labels = {
      administrador: 'Administrador',
      psicologo: 'Psicólogo',
      assistente_social: 'Assistente Social',
      secretaria: 'Secretária'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <header className="h-16 border-b bg-gradient-to-r from-primary to-secondary flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8 text-white hover:bg-white/10" />
        <div className="flex items-center gap-3">
          <img 
            src={apaeLogoImg} 
            alt="APAE Logo" 
            className="h-10 w-10 rounded object-cover" 
          />
          <div>
            <h2 className="text-lg font-semibold text-white">APAE - Governador Valadares</h2>
            <p className="text-sm text-white/80">Sistema de Gestão de Assistidos</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-white text-primary">
                  {user?.user_metadata?.nome ? getInitials(user.user_metadata.nome) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.user_metadata?.nome || user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                 <p className="text-xs text-muted-foreground">
                   {((user as any)?.tipo_usuario || user?.user_metadata?.tipo_usuario) ? 
                     getTipoUsuarioLabel((user as any).tipo_usuario || user.user_metadata.tipo_usuario) : ''}
                 </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
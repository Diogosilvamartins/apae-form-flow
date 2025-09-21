import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/hooks/useAuth';
import type { TablesInsert } from '@/integrations/supabase/types';

type CreateUsuario = TablesInsert<'usuarios'>;

export default function Usuarios() {
  const [open, setOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<CreateUsuario>>({
    nome: '',
    email: '',
    senha_hash: '',
    tipo_usuario: 'funcionario',
  });

  const { usuarios, loading, createUsuario, updateUsuario, deleteUsuario } = useUsuarios();
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser?.user_metadata?.tipo_usuario === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.senha_hash || !formData.tipo_usuario) {
      return;
    }

    if (editingUsuario) {
      await updateUsuario(editingUsuario.id_usuario, formData);
    } else {
      await createUsuario(formData as CreateUsuario);
    }

    setOpen(false);
    setEditingUsuario(null);
    setFormData({
      nome: '',
      email: '',
      senha_hash: '',
      tipo_usuario: 'funcionario',
    });
  };

  const handleEdit = (usuario: any) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha_hash: '', // Não preencher a senha por segurança
      tipo_usuario: usuario.tipo_usuario,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      await deleteUsuario(id);
    }
  };

  const getTipoUsuarioLabel = (tipo: string) => {
    const labels = {
      admin: 'Administrador',
      funcionario: 'Funcionário',
      responsavel: 'Responsável',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoUsuarioVariant = (tipo: string) => {
    const variants = {
      admin: 'destructive',
      funcionario: 'default',
      responsavel: 'secondary',
    };
    return variants[tipo as keyof typeof variants] || 'outline';
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerenciar usuários do sistema
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUsuario(null);
              setFormData({
                nome: '',
                email: '',
                senha_hash: '',
                tipo_usuario: 'funcionario',
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUsuario 
                  ? 'Atualize as informações do usuário.'
                  : 'Preencha os dados do novo usuário.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha_hash || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, senha_hash: e.target.value }))}
                  required={!editingUsuario}
                  placeholder={editingUsuario ? 'Deixe em branco para manter atual' : ''}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select
                  value={formData.tipo_usuario}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_usuario: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="responsavel">Responsável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUsuario ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {usuarios.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id_usuario}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoUsuarioVariant(usuario.tipo_usuario) as any}>
                        {getTipoUsuarioLabel(usuario.tipo_usuario)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(usuario.id_usuario)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
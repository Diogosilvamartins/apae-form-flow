import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Stethoscope, Edit, Trash2 } from "lucide-react";
import { useProfissionais, Profissional, CreateProfissionalData, UpdateProfissionalData, EspecialidadeProfissional } from "@/hooks/useProfissionais";
import ProfissionalDialog from "@/components/ProfissionalDialog";

export default function Profissionais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profissionalToDelete, setProfissionalToDelete] = useState<Profissional | undefined>();

  const { profissionais, loading, createProfissional, updateProfissional, deleteProfissional } = useProfissionais();

  const filteredProfissionais = profissionais.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEspecialidadeLabel = (especialidade: EspecialidadeProfissional) => {
    const labels: Record<EspecialidadeProfissional, string> = {
      psicologo: 'Psicólogo(a)',
      assistente_social: 'Assistente Social',
      fonoaudiologo: 'Fonoaudiólogo(a)',
      fisioterapeuta: 'Fisioterapeuta',
      terapeuta_ocupacional: 'Terapeuta Ocupacional',
      pedagogo: 'Pedagogo(a)',
      nutricionista: 'Nutricionista',
      medico: 'Médico(a)',
      outro: 'Outro'
    };
    return labels[especialidade] || especialidade;
  };

  const handleCreate = async (data: CreateProfissionalData) => {
    await createProfissional(data);
  };

  const handleUpdate = async (data: UpdateProfissionalData) => {
    if (editingProfissional) {
      await updateProfissional(editingProfissional.id_profissional, data);
      setEditingProfissional(undefined);
    }
  };

  const handleEdit = (profissional: Profissional) => {
    setEditingProfissional(profissional);
    setDialogOpen(true);
  };

  const handleDeleteClick = (profissional: Profissional) => {
    setProfissionalToDelete(profissional);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (profissionalToDelete) {
      await deleteProfissional(profissionalToDelete.id_profissional);
      setProfissionalToDelete(undefined);
      setDeleteDialogOpen(false);
    }
  };

  const handleNewProfissional = () => {
    setEditingProfissional(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProfissional(undefined);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            Profissionais
          </h1>
          <p className="text-muted-foreground">Cadastro da equipe multidisciplinar</p>
        </div>
        <Button onClick={handleNewProfissional} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            {filteredProfissionais.length} profissional(is) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfissionais.map((profissional) => (
                  <TableRow key={profissional.id_profissional}>
                    <TableCell className="font-medium">{profissional.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEspecialidadeLabel(profissional.especialidade)}
                      </Badge>
                    </TableCell>
                    <TableCell>{profissional.registro_profissional || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profissional.celular && (
                          <div className="text-sm">{profissional.celular}</div>
                        )}
                        {profissional.email && (
                          <div className="text-xs text-muted-foreground">{profissional.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profissional.ativo ? "default" : "secondary"}>
                        {profissional.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(profissional)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(profissional)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfissionais.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Nenhum profissional encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProfissionalDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingProfissional ? handleUpdate : handleCreate}
        profissional={editingProfissional}
        isEdit={!!editingProfissional}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o(a) profissional "{profissionalToDelete?.nome}"? 
              Esta ação não pode ser desfeita e também excluirá todos os agendamentos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
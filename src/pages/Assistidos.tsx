import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, UserCheck, Edit, Trash2 } from "lucide-react";
import { useAssistidos, Assistido, CreateAssistidoData, UpdateAssistidoData } from "@/hooks/useAssistidos";
import AssistidoDialog from "@/components/AssistidoDialog";

export default function Assistidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssistido, setEditingAssistido] = useState<Assistido | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assistidoToDelete, setAssistidoToDelete] = useState<Assistido | undefined>();

  const { assistidos, loading, createAssistido, updateAssistido, deleteAssistido } = useAssistidos();

  const filteredAssistidos = assistidos.filter(assistido =>
    assistido.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: CreateAssistidoData) => {
    await createAssistido(data);
  };

  const handleUpdate = async (data: UpdateAssistidoData) => {
    if (editingAssistido) {
      await updateAssistido(editingAssistido.id_assistido, data);
      setEditingAssistido(undefined);
    }
  };

  const handleEdit = (assistido: Assistido) => {
    setEditingAssistido(assistido);
    setDialogOpen(true);
  };

  const handleDeleteClick = (assistido: Assistido) => {
    setAssistidoToDelete(assistido);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assistidoToDelete) {
      await deleteAssistido(assistidoToDelete.id_assistido);
      setAssistidoToDelete(undefined);
      setDeleteDialogOpen(false);
    }
  };

  const handleNewAssistido = () => {
    setEditingAssistido(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAssistido(undefined);
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
            <UserCheck className="h-8 w-8 text-primary" />
            Assistidos
          </h1>
          <p className="text-muted-foreground">Cadastro de pessoas assistidas</p>
        </div>
        <Button onClick={handleNewAssistido} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assistido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Assistidos</CardTitle>
          <CardDescription>
            {filteredAssistidos.length} assistido(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
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
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssistidos.map((assistido) => (
                  <TableRow key={assistido.id_assistido}>
                    <TableCell className="font-medium">{assistido.nome}</TableCell>
                    <TableCell>
                      {assistido.data_nascimento 
                        ? new Date(assistido.data_nascimento).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={assistido.ativo ? "default" : "secondary"}>
                        {assistido.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(assistido.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(assistido)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(assistido)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAssistidos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum assistido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AssistidoDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingAssistido ? handleUpdate : handleCreate}
        assistido={editingAssistido}
        isEdit={!!editingAssistido}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o assistido "{assistidoToDelete?.nome}"? 
              Esta ação não pode ser desfeita.
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
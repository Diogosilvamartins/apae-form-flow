import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, Stethoscope, Edit, Trash2, MessageCircle, CheckCircle } from "lucide-react";
import { useAgendamentos, Agendamento, CreateAgendamentoData, UpdateAgendamentoData, StatusAgendamento } from "@/hooks/useAgendamentos";
import { format, parseISO, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import AgendamentoDialog from "@/components/AgendamentoDialog";
import AgendamentoWhatsAppDialog from "@/components/AgendamentoWhatsAppDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Agenda() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | undefined>();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [whatsappAgendamento, setWhatsappAgendamento] = useState<Agendamento | undefined>();
  const [viewMode, setViewMode] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  const { agendamentos, loading, createAgendamento, updateAgendamento, deleteAgendamento, refetch } = useAgendamentos();

  const getStatusLabel = (status: StatusAgendamento) => {
    const labels: Record<StatusAgendamento, string> = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      reagendado: 'Reagendado'
    };
    return labels[status];
  };

  const getStatusVariant = (status: StatusAgendamento) => {
    const variants: Record<StatusAgendamento, "default" | "secondary" | "destructive" | "outline"> = {
      agendado: 'outline',
      confirmado: 'default',
      em_andamento: 'secondary',
      concluido: 'default',
      cancelado: 'destructive',
      reagendado: 'outline'
    };
    return variants[status];
  };

  const filterAgendamentos = () => {
    const now = new Date();
    
    switch (viewMode) {
      case 'hoje':
        return agendamentos.filter(agendamento => 
          isToday(parseISO(agendamento.data_hora))
        );
      case 'semana':
        const startWeek = startOfWeek(now, { locale: ptBR });
        const endWeek = endOfWeek(now, { locale: ptBR });
        return agendamentos.filter(agendamento => {
          const dataAgendamento = parseISO(agendamento.data_hora);
          return dataAgendamento >= startWeek && dataAgendamento <= endWeek;
        });
      case 'mes':
        return agendamentos.filter(agendamento => {
          const dataAgendamento = parseISO(agendamento.data_hora);
          return dataAgendamento.getMonth() === now.getMonth() && 
                 dataAgendamento.getFullYear() === now.getFullYear();
        });
      default:
        return agendamentos;
    }
  };

  const filteredAgendamentos = filterAgendamentos().sort((a, b) => 
    new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
  );

  const handleCreate = async (data: CreateAgendamentoData) => {
    await createAgendamento(data);
  };

  const handleUpdate = async (data: UpdateAgendamentoData) => {
    if (editingAgendamento) {
      await updateAgendamento(editingAgendamento.id_agendamento, data);
      setEditingAgendamento(undefined);
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setDialogOpen(true);
  };

  const handleDeleteClick = (agendamento: Agendamento) => {
    setAgendamentoToDelete(agendamento);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (agendamentoToDelete) {
      await deleteAgendamento(agendamentoToDelete.id_agendamento);
      setAgendamentoToDelete(undefined);
      setDeleteDialogOpen(false);
    }
  };

  const handleNewAgendamento = () => {
    setEditingAgendamento(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAgendamento(undefined);
  };

  const handleWhatsAppOpen = (agendamento: Agendamento) => {
    setWhatsappAgendamento(agendamento);
    setWhatsappDialogOpen(true);
  };

  const formatDataHora = (dataHora: string) => {
    const date = parseISO(dataHora);
    return {
      data: format(date, "dd/MM/yyyy", { locale: ptBR }),
      hora: format(date, "HH:mm", { locale: ptBR }),
      diaSemana: format(date, "EEEE", { locale: ptBR })
    };
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
            <Calendar className="h-8 w-8 text-primary" />
            Agenda
          </h1>
          <p className="text-muted-foreground">Gerenciamento de consultas e atendimentos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
          <Button onClick={handleNewAgendamento} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === 'hoje' ? 'default' : 'outline'}
          onClick={() => setViewMode('hoje')}
          size="sm"
        >
          Hoje
        </Button>
        <Button
          variant={viewMode === 'semana' ? 'default' : 'outline'}
          onClick={() => setViewMode('semana')}
          size="sm"
        >
          Esta Semana
        </Button>
        <Button
          variant={viewMode === 'mes' ? 'default' : 'outline'}
          onClick={() => setViewMode('mes')}
          size="sm"
        >
          Este Mês
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>
            {filteredAgendamentos.length} agendamento(s) - Visualizando: {
              viewMode === 'hoje' ? 'Hoje' : 
              viewMode === 'semana' ? 'Esta Semana' : 
              'Este Mês'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAgendamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado para o período selecionado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgendamentos.map((agendamento) => {
                const { data, hora, diaSemana } = formatDataHora(agendamento.data_hora);
                
                return (
                  <div key={agendamento.id_agendamento} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{hora}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{data} - {diaSemana}</span>
                          </div>
                          <Badge variant={getStatusVariant(agendamento.status as StatusAgendamento)}>
                            {getStatusLabel(agendamento.status as StatusAgendamento)}
                          </Badge>
                          {agendamento.confirmado_em ? (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              <span>Confirmado</span>
                            </div>
                          ) : agendamento.status === 'agendado' && (
                            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs">
                              <Clock className="h-3 w-3" />
                              <span>Pendente confirmação</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{agendamento.assistidos?.nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{agendamento.profissionais?.nome}</span>
                            <Badge variant="outline" className="text-xs">
                              {agendamento.profissionais?.especialidade}
                            </Badge>
                          </div>
                        </div>

                        {agendamento.observacoes && (
                          <p className="text-sm text-muted-foreground">
                            {agendamento.observacoes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWhatsAppOpen(agendamento)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Enviar lembrete por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(agendamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(agendamento)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AgendamentoDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingAgendamento ? handleUpdate : handleCreate}
        agendamento={editingAgendamento}
        isEdit={!!editingAgendamento}
      />

      {whatsappAgendamento && (
        <AgendamentoWhatsAppDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          agendamento={whatsappAgendamento}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
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
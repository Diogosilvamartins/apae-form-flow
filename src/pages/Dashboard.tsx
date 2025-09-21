import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, UserCheck, Calendar, Clock, CheckCircle, AlertCircle, Stethoscope } from "lucide-react";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useAssistidos } from "@/hooks/useAssistidos";
import { useProfissionais } from "@/hooks/useProfissionais";
import { format, isToday, isTomorrow, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalAssistidos: number;
  totalProfissionais: number;
  agendamentosHoje: number;
  agendamentosAmanha: number;
  agendamentosConfirmados: number;
  agendamentosPendentes: number;
}

export default function Dashboard() {
  const { agendamentos, loading: agendamentosLoading } = useAgendamentos();
  const { assistidos, loading: assistidosLoading } = useAssistidos();
  const { profissionais, loading: profissionaisLoading } = useProfissionais();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssistidos: 0,
    totalProfissionais: 0,
    agendamentosHoje: 0,
    agendamentosAmanha: 0,
    agendamentosConfirmados: 0,
    agendamentosPendentes: 0,
  });

  useEffect(() => {
    if (!agendamentosLoading && !assistidosLoading && !profissionaisLoading) {
      const hoje = new Date();
      const amanha = addDays(hoje, 1);

      const agendamentosHoje = agendamentos.filter(ag => {
        const dataAgendamento = parseISO(ag.data_hora);
        return isToday(dataAgendamento);
      }).length;

      const agendamentosAmanha = agendamentos.filter(ag => {
        const dataAgendamento = parseISO(ag.data_hora);
        return isTomorrow(dataAgendamento);
      }).length;

      const agendamentosConfirmados = agendamentos.filter(ag => ag.confirmado_em).length;
      
      const agendamentosPendentes = agendamentos.filter(ag => 
        ag.status === 'agendado' && !ag.confirmado_em
      ).length;

      setStats({
        totalAssistidos: assistidos.length,
        totalProfissionais: profissionais.length,
        agendamentosHoje,
        agendamentosAmanha,
        agendamentosConfirmados,
        agendamentosPendentes,
      });
    }
  }, [agendamentos, assistidos, profissionais, agendamentosLoading, assistidosLoading, profissionaisLoading]);

  const proximosAgendamentos = agendamentos
    .filter(ag => {
      const dataAgendamento = parseISO(ag.data_hora);
      return dataAgendamento >= new Date();
    })
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
    .slice(0, 5);

  const loading = agendamentosLoading || assistidosLoading || profissionaisLoading;

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">Visão geral do sistema APAE</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Atualizado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Assistidos</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssistidos}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <Stethoscope className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfissionais}</div>
            <p className="text-xs text-muted-foreground">
              Ativos na equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">
              {stats.agendamentosAmanha} agendados para amanhã
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmações</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendamentosConfirmados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.agendamentosPendentes} pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>
              Os 5 próximos agendamentos marcados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proximosAgendamentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento próximo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proximosAgendamentos.map((agendamento) => {
                  const dataAgendamento = parseISO(agendamento.data_hora);
                  const dataFormatada = format(dataAgendamento, "dd/MM", { locale: ptBR });
                  const horaFormatada = format(dataAgendamento, "HH:mm", { locale: ptBR });
                  const isHoje = isToday(dataAgendamento);
                  const isAmanha = isTomorrow(dataAgendamento);
                  
                  return (
                    <div key={agendamento.id_agendamento} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{agendamento.assistidos?.nome}</span>
                          {agendamento.confirmado_em ? (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {agendamento.profissionais?.nome} • {agendamento.profissionais?.especialidade}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {isHoje ? "Hoje" : isAmanha ? "Amanhã" : dataFormatada}
                        </div>
                        <div className="text-sm text-muted-foreground">{horaFormatada}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Resumo das atividades recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Sistema Online</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Operacional
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Agendamentos</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {agendamentos.length} total
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Confirmações Pendentes</span>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {stats.agendamentosPendentes}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Assistidos Ativos</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {assistidos.filter(a => a.ativo).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
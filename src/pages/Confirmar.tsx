import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Clock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Agendamento {
  id_agendamento: string;
  data_hora: string;
  duracao_minutos: number;
  status: string;
  confirmado_em: string | null;
  assistidos: {
    nome: string;
    celular: string | null;
  } | null;
  profissionais: {
    nome: string;
    especialidade: string;
  } | null;
}

export default function Confirmar() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [jaConfirmado, setJaConfirmado] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    buscarAgendamento();
  }, [token]);

  const buscarAgendamento = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id_agendamento,
          data_hora,
          duracao_minutos,
          status,
          confirmado_em,
          assistidos:assistido_id(nome, celular),
          profissionais:profissional_id(nome, especialidade)
        `)
        .eq('token_confirmacao', token)
        .single();

      if (error) {
        console.error('Erro ao buscar agendamento:', error);
        toast.error("Agendamento não encontrado ou link inválido");
        return;
      }

      setAgendamento(data);
      setJaConfirmado(!!data.confirmado_em);
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao carregar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const confirmarAgendamento = async () => {
    if (!agendamento) return;

    setConfirmando(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({
          status: 'confirmado',
          confirmado_em: new Date().toISOString(),
          confirmado_por_telefone: agendamento.assistidos?.celular
        })
        .eq('id_agendamento', agendamento.id_agendamento);

      if (error) {
        console.error('Erro ao confirmar:', error);
        toast.error("Erro ao confirmar agendamento");
        return;
      }

      setJaConfirmado(true);
      toast.success("Agendamento confirmado com sucesso!");
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao confirmar agendamento");
    } finally {
      setConfirmando(false);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Link Inválido</CardTitle>
            <CardDescription>
              Este link de confirmação não foi encontrado ou já expirou.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDataHora = () => {
    const date = parseISO(agendamento.data_hora);
    return {
      data: format(date, "dd/MM/yyyy (EEEE)", { locale: ptBR }),
      hora: format(date, "HH:mm", { locale: ptBR })
    };
  };

  const { data, hora } = formatDataHora();

  if (jaConfirmado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">Agendamento Confirmado!</CardTitle>
            <CardDescription>
              Sua consulta foi confirmada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{agendamento.assistidos?.nome}</p>
                  <p className="text-sm text-muted-foreground">Paciente</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{data}</p>
                  <p className="text-sm text-muted-foreground">Data da consulta</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{hora}</p>
                  <p className="text-sm text-muted-foreground">Horário</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">{agendamento.profissionais?.nome}</p>
                  <p className="text-sm text-muted-foreground">{agendamento.profissionais?.especialidade}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Agendamento confirmado!<br />
              Nos vemos na APAE Governador Valadares.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-blue-700">Confirmar Consulta</CardTitle>
          <CardDescription>
            Por favor, confirme sua presença na consulta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">{agendamento.assistidos?.nome}</p>
                <p className="text-sm text-muted-foreground">Paciente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{data}</p>
                <p className="text-sm text-muted-foreground">Data da consulta</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">{hora}</p>
                <p className="text-sm text-muted-foreground">Horário</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">{agendamento.profissionais?.nome}</p>
                <p className="text-sm text-muted-foreground">{agendamento.profissionais?.especialidade}</p>
              </div>
            </div>

            {agendamento.assistidos?.celular && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{agendamento.assistidos.celular}</p>
                  <p className="text-sm text-muted-foreground">Contato</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={confirmarAgendamento}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={confirmando}
            >
              {confirmando ? (
                "Confirmando..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Presença
                </>
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Local: APAE Governador Valadares
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Em caso de impossibilidade, entre em contato conosco
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
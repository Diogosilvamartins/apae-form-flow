import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Agendamento } from "@/hooks/useAgendamentos";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import WhatsAppMethodDialog from "@/components/WhatsAppMethodDialog";

interface AgendamentoWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento;
}

export default function AgendamentoWhatsAppDialog({
  open,
  onOpenChange,
  agendamento,
}: AgendamentoWhatsAppDialogProps) {
  const formatDataHora = () => {
    const date = parseISO(agendamento.data_hora);
    return {
      data: format(date, "dd/MM/yyyy (EEEE)", { locale: ptBR }),
      hora: format(date, "HH:mm", { locale: ptBR })
    };
  };

  const { data, hora } = formatDataHora();
  
  const gerarLinkConfirmacao = () => {
    if (!agendamento.token_confirmacao) return '';
    return `${window.location.origin}/confirmar?token=${agendamento.token_confirmacao}`;
  };

  const [message, setMessage] = useState(
    `Olá ${agendamento.assistidos?.nome}!\n\n` +
    `Este é um lembrete da sua consulta agendada na APAE de Governador Valadares:\n\n` +
    `📅 Data: ${data}\n` +
    `🕐 Horário: ${hora}\n` +
    `👩‍⚕️ Profissional: ${agendamento.profissionais?.nome}\n` +
    `📍 Local: APAE Governador Valadares\n\n` +
    `✅ *CONFIRME SUA PRESENÇA CLICANDO AQUI:*\n${gerarLinkConfirmacao()}\n\n` +
    `Em caso de impossibilidade de comparecer, entre em contato conosco com antecedência.\n\n` +
    `Atenciosamente,\nEquipe APAE`
  );
  const [sending, setSending] = useState(false);
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);

  const formatPhoneNumber = (phone: string | undefined) => {
    // Se não tem número, usar o número padrão da APAE
    if (!phone || phone.trim() === '') {
      return '5533999799138';
    }
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `55${cleaned}`;
    } else if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return cleaned.length >= 10 ? cleaned : '5533999799138';
  };

  const handleSendWhatsApp = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem para enviar");
      return;
    }

    const phoneToUse = agendamento.assistidos?.celular || '33999799138';
    setMethodDialogOpen(true);
  };

  const predefinedMessages = [
    {
      title: "Lembrete de Consulta",
      content: `Olá ${agendamento.assistidos?.nome}!\n\n` +
        `Este é um lembrete da sua consulta agendada na APAE de Governador Valadares:\n\n` +
        `📅 Data: ${data}\n` +
        `🕐 Horário: ${hora}\n` +
        `👩‍⚕️ Profissional: ${agendamento.profissionais?.nome}\n` +
        `📍 Local: APAE Governador Valadares\n\n` +
        `✅ *CONFIRME SUA PRESENÇA CLICANDO AQUI:*\n${gerarLinkConfirmacao()}\n\n` +
        `Atenciosamente,\nEquipe APAE`
    },
    {
      title: "Confirmação de Presença",
      content: `Olá ${agendamento.assistidos?.nome}!\n\n` +
        `Gostaríamos de confirmar sua consulta:\n\n` +
        `📅 ${data} às ${hora}\n` +
        `👩‍⚕️ Com ${agendamento.profissionais?.nome}\n\n` +
        `Por favor, responda:\n` +
        `✅ CONFIRMO - se você virá\n` +
        `❌ NÃO POSSO - se precisar remarcar\n\n` +
        `Aguardamos seu retorno!\n\n` +
        `Atenciosamente,\nEquipe APAE`
    },
    {
      title: "Reagendamento Necessário",
      content: `Olá ${agendamento.assistidos?.nome}!\n\n` +
        `Infelizmente precisamos reagendar sua consulta que estava marcada para ${data} às ${hora}.\n\n` +
        `Por favor, entre em contato conosco para marcar uma nova data e horário.\n\n` +
        `Pedimos desculpas pelo inconveniente.\n\n` +
        `Atenciosamente,\nEquipe APAE`
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Lembrete de Consulta - {agendamento.assistidos?.nome}
          </DialogTitle>
          <DialogDescription>
            {data} às {hora} com {agendamento.profissionais?.nome}
            <br />
            Celular: {agendamento.assistidos?.celular || "Usando número padrão APAE (33) 99979-9138"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mensagens Predefinidas</Label>
            <div className="grid grid-cols-1 gap-2">
              {predefinedMessages.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(template.content)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{template.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {template.content.substring(0, 60)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem do Lembrete</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={8}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {message.length} caracteres
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            disabled={sending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sending ? (
              "Abrindo..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Lembrete
              </>
            )}
          </Button>
        </DialogFooter>

        <WhatsAppMethodDialog
          open={methodDialogOpen}
          onOpenChange={(open) => {
            setMethodDialogOpen(open);
            if (!open) {
              onOpenChange(false);
            }
          }}
          phoneNumber={agendamento.assistidos?.celular || '33999799138'}
          message={message}
          contactName={agendamento.assistidos?.nome || 'Assistido'}
        />
      </DialogContent>
    </Dialog>
  );
}
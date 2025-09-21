import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Assistido } from "@/hooks/useAssistidos";
import WhatsAppMethodDialog from "@/components/WhatsAppMethodDialog";

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistido: Assistido;
}

export default function WhatsAppDialog({
  open,
  onOpenChange,
  assistido,
}: WhatsAppDialogProps) {
  const [message, setMessage] = useState(
    `Olá ${assistido.nome}, tudo bem?\n\nEste é um contato da APAE de Governador Valadares.\n\nAtenciosamente,\nEquipe APAE`
  );
  const [sending, setSending] = useState(false);
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);

  const formatPhoneNumber = (phone: string | undefined) => {
    // Se não tem número, usar o número padrão da APAE
    if (!phone || phone.trim() === '') {
      return '5533984043348';
    }
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `55${cleaned}`;
    } else if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return cleaned.length >= 10 ? cleaned : '5533984043348';
  };

  const handleSendWhatsApp = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem para enviar");
      return;
    }

    const phoneToUse = assistido.celular || '33984043348';
    setMethodDialogOpen(true);
  };

  const predefinedMessages = [
    {
      title: "Lembrete de Consulta",
      content: `Olá ${assistido.nome}!\n\nEste é um lembrete sobre sua consulta marcada.\n\nPor favor, confirme sua presença.\n\nAtenciosamente,\nEquipe APAE`
    },
    {
      title: "Reagendamento",
      content: `Olá ${assistido.nome}!\n\nPrecisamos reagendar sua consulta.\n\nPor favor, entre em contato conosco para marcar uma nova data.\n\nAtenciosamente,\nEquipe APAE`
    },
    {
      title: "Informações Gerais",
      content: `Olá ${assistido.nome}!\n\nEntramos em contato para informações sobre nossos serviços.\n\nEstamos à disposição para esclarecer dúvidas.\n\nAtenciosamente,\nEquipe APAE`
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Enviar WhatsApp para {assistido.nome}
          </DialogTitle>
          <DialogDescription>
            Celular: {assistido.celular || "Usando número padrão APAE (33) 98404-3348"}
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
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={6}
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
                Enviar WhatsApp
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
          phoneNumber={assistido.celular || '33984043348'}
          message={message}
          contactName={assistido.nome}
        />
      </DialogContent>
    </Dialog>
  );
}
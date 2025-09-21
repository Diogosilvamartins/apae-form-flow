import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Send, Users, Globe, Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";
import { Assistido } from "@/hooks/useAssistidos";

interface WhatsAppBulkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistidos: Assistido[];
}

export default function WhatsAppBulk({
  open,
  onOpenChange,
  assistidos,
}: WhatsAppBulkProps) {
  const [message, setMessage] = useState(
    "Olá! Este é um comunicado importante da APAE de Governador Valadares.\n\nAtenciosamente,\nEquipe APAE"
  );
  const [selectedAssistidos, setSelectedAssistidos] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<'web' | 'api' | 'copy'>('api');

  // Filtrar apenas assistidos que têm celular
  const assistidosComCelular = assistidos.filter(a => a.celular && a.celular.trim() !== '');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssistidos(assistidosComCelular.map(a => a.id_assistido));
    } else {
      setSelectedAssistidos([]);
    }
  };

  const handleSelectAssistido = (assistidoId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssistidos(prev => [...prev, assistidoId]);
    } else {
      setSelectedAssistidos(prev => prev.filter(id => id !== assistidoId));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `55${cleaned}`;
    } else if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return cleaned.length >= 10 ? cleaned : null;
  };

  const handleSendBulkWhatsApp = async () => {
    if (selectedAssistidos.length === 0) {
      toast.error("Selecione pelo menos um assistido");
      return;
    }

    if (!message.trim()) {
      toast.error("Digite uma mensagem para enviar");
      return;
    }

    setSending(true);
    
    try {
      const selectedAssistidosData = assistidosComCelular.filter(a => 
        selectedAssistidos.includes(a.id_assistido)
      );

      if (sendMethod === 'copy') {
        // Gerar todos os links e copiar para clipboard
        const links = selectedAssistidosData.map(assistido => {
          const formattedNumber = formatPhoneNumber(assistido.celular!);
          const personalizedMessage = message.replace(/\{nome\}/g, assistido.nome);
          const encodedMessage = encodeURIComponent(personalizedMessage);
          return `${assistido.nome}: https://wa.me/${formattedNumber}?text=${encodedMessage}`;
        }).join('\n\n');

        try {
          await navigator.clipboard.writeText(links);
          toast.success(`${selectedAssistidos.length} links copiados! Cole no bloco de notas e abra um por vez.`);
        } catch (error) {
          // Fallback para browsers que não suportam clipboard
          const textArea = document.createElement('textarea');
          textArea.value = links;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success(`${selectedAssistidos.length} links copiados! Cole no bloco de notas e abra um por vez.`);
        }
      } else {
        // Abrir links diretamente
        let successCount = 0;
        const baseUrl = sendMethod === 'web' ? 'https://web.whatsapp.com/send' : 'https://wa.me';
        
        for (const assistido of selectedAssistidosData) {
          const formattedNumber = formatPhoneNumber(assistido.celular!);
          
          if (formattedNumber) {
            const personalizedMessage = message.replace(/\{nome\}/g, assistido.nome);
            const encodedMessage = encodeURIComponent(personalizedMessage);
            const whatsappUrl = `${baseUrl}?phone=${formattedNumber}&text=${encodedMessage}`;
            
            // Pequeno delay entre as aberturas para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.open(whatsappUrl, '_blank');
            successCount++;
          }
        }

        toast.success(`${successCount} conversas do WhatsApp foram abertas`);
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao enviar mensagens em massa");
    } finally {
      setSending(false);
    }
  };

  const predefinedMessages = [
    {
      title: "Comunicado Geral",
      content: "Olá {nome}!\n\nEste é um comunicado importante da APAE de Governador Valadares.\n\nAtenciosamente,\nEquipe APAE"
    },
    {
      title: "Lembrete de Evento",
      content: "Olá {nome}!\n\nLembramos sobre o evento que acontecerá em nossa instituição.\n\nContamos com sua presença!\n\nAtenciosamente,\nEquipe APAE"
    },
    {
      title: "Campanha de Conscientização",
      content: "Olá {nome}!\n\nConvidamos você a participar de nossa campanha de conscientização.\n\nJuntos somos mais fortes!\n\nAtenciosamente,\nEquipe APAE"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Envio em Massa - WhatsApp
          </DialogTitle>
          <DialogDescription>
            {assistidosComCelular.length} assistidos com celular cadastrado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
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
            <Label>Método de Envio</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={sendMethod === 'api' ? 'default' : 'outline'}
                onClick={() => setSendMethod('api')}
                className="flex items-center gap-2 h-auto p-3"
              >
                <Smartphone className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-xs">WhatsApp Direct</div>
                  <div className="text-xs opacity-75">Mais confiável</div>
                </div>
              </Button>
              
              <Button
                type="button"
                variant={sendMethod === 'web' ? 'default' : 'outline'}
                onClick={() => setSendMethod('web')}
                className="flex items-center gap-2 h-auto p-3"
              >
                <Globe className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-xs">WhatsApp Web</div>
                  <div className="text-xs opacity-75">Pode bloquear</div>
                </div>
              </Button>
              
              <Button
                type="button"
                variant={sendMethod === 'copy' ? 'default' : 'outline'}
                onClick={() => setSendMethod('copy')}
                className="flex items-center gap-2 h-auto p-3"
              >
                <Copy className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-xs">Copiar Links</div>
                  <div className="text-xs opacity-75">Manual</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Mensagem <span className="text-xs text-muted-foreground">(use {"{nome}"} para personalizar)</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {message.length} caracteres
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Selecionar Assistidos</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedAssistidos.length !== assistidosComCelular.length)}
              >
                {selectedAssistidos.length === assistidosComCelular.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
            
            <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {assistidosComCelular.map((assistido) => (
                  <div key={assistido.id_assistido} className="flex items-center space-x-2">
                    <Checkbox
                      id={assistido.id_assistido}
                      checked={selectedAssistidos.includes(assistido.id_assistido)}
                      onCheckedChange={(checked) => 
                        handleSelectAssistido(assistido.id_assistido, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={assistido.id_assistido}
                      className="text-sm font-medium flex-1 cursor-pointer"
                    >
                      {assistido.nome}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {assistido.celular}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedAssistidos.length} de {assistidosComCelular.length} assistidos selecionados
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
              onClick={handleSendBulkWhatsApp}
              disabled={sending || selectedAssistidos.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                "Processando..."
              ) : (
                <>
                  {sendMethod === 'copy' ? (
                    <Copy className="h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {sendMethod === 'copy' 
                    ? `Copiar ${selectedAssistidos.length} links`
                    : `Enviar para ${selectedAssistidos.length} assistidos`
                  }
                </>
              )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
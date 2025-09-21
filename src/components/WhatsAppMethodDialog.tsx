import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Smartphone, Globe, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  message: string;
  contactName: string;
}

export default function WhatsAppMethodDialog({
  open,
  onOpenChange,
  phoneNumber,
  message,
  contactName,
}: WhatsAppMethodDialogProps) {
  const [copiedMethod, setCopiedMethod] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('33')) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('33')) {
      return `55${cleaned}`;
    } else if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return `55${cleaned}`;
  };

  const formattedNumber = formatPhoneNumber(phoneNumber);

  const methods = [
    {
      id: 'web',
      title: 'WhatsApp Web',
      description: 'Abre no navegador (pode ser bloqueado)',
      icon: Globe,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        console.log("🌐 WhatsApp Web - Mensagem original:", message);
        console.log("🌐 WhatsApp Web - Número formatado:", formattedNumber);
        const encodedMessage = encodeURIComponent(message);
        console.log("🌐 WhatsApp Web - Mensagem codificada:", encodedMessage);
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
        console.log("🌐 WhatsApp Web - URL final:", whatsappUrl);
        window.open(whatsappUrl, '_blank');
        toast.success(`WhatsApp Web aberto para ${contactName}`);
        onOpenChange(false);
      }
    },
    {
      id: 'api',
      title: 'WhatsApp Direct',
      description: 'Link direto (mais confiável)',
      icon: Smartphone,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        console.log("📱 WhatsApp Direct - Mensagem original:", message);
        console.log("📱 WhatsApp Direct - Número formatado:", formattedNumber);
        const encodedMessage = encodeURIComponent(message);
        console.log("📱 WhatsApp Direct - Mensagem codificada:", encodedMessage);
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
        console.log("📱 WhatsApp Direct - URL final:", whatsappUrl);
        window.open(whatsappUrl, '_blank');
        toast.success(`WhatsApp aberto para ${contactName}`);
        onOpenChange(false);
      }
    },
    {
      id: 'app',
      title: 'Abrir no App',
      description: 'Deep link whatsapp:// (recomendado quando web/api bloqueiam)',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => {
        console.log("📲 WhatsApp App - Mensagem original:", message);
        console.log("📲 WhatsApp App - Número formatado:", formattedNumber);
        const encodedMessage = encodeURIComponent(message);
        console.log("📲 WhatsApp App - Mensagem codificada:", encodedMessage);
        const appUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
        const intentUrl = `intent://send/?phone=${formattedNumber}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        console.log("📲 WhatsApp App - URL do app:", appUrl);
        console.log("📲 WhatsApp App - URL intent:", intentUrl);
        try {
          // Tenta abrir via esquema do app
          window.location.href = appUrl;
          setTimeout(() => {
            // Fallback para Android/Chrome via intent se necessário
            window.location.href = intentUrl;
          }, 400);
        } catch (_) {
          window.location.href = intentUrl;
        }
        toast.success(`Abrindo app do WhatsApp para ${contactName}`);
        onOpenChange(false);
      }
    },
    {
      id: 'copy',
      title: 'Copiar Link',
      description: 'Copia o link para colar manualmente',
      icon: copiedMethod === 'copy' ? Check : Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
        
        try {
          await navigator.clipboard.writeText(whatsappUrl);
          setCopiedMethod('copy');
          toast.success("Link copiado! Cole no navegador ou app do WhatsApp");
          
          setTimeout(() => {
            setCopiedMethod(null);
          }, 2000);
        } catch (error) {
          // Fallback for browsers that don't support clipboard
          const textArea = document.createElement('textarea');
          textArea.value = whatsappUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          setCopiedMethod('copy');
          toast.success("Link copiado! Cole no navegador ou app do WhatsApp");
          
          setTimeout(() => {
            setCopiedMethod(null);
          }, 2000);
        }
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Escolha o método de envio
          </DialogTitle>
          <DialogDescription>
            Para: {contactName} ({phoneNumber || 'Número padrão APAE'})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {methods.map((method) => {
            const IconComponent = method.icon;
            return (
              <Button
                key={method.id}
                onClick={method.action}
                className={`w-full justify-start h-auto p-4 ${method.color} text-white`}
                variant="default"
              >
                <div className="flex items-center gap-3 w-full">
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{method.title}</div>
                    <div className="text-sm opacity-90">{method.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Assistido } from "@/hooks/useAssistidos";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  assistidoNome: string;
  assistido?: Assistido;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  onOpenDialog?: (assistido: Assistido) => void;
}

export default function WhatsAppButton({ 
  phoneNumber, 
  assistidoNome, 
  assistido,
  variant = "ghost", 
  size = "sm",
  onOpenDialog
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      toast.error("Número de celular não cadastrado para este assistido");
      return;
    }

    if (onOpenDialog && assistido) {
      onOpenDialog(assistido);
      return;
    }

    // Fallback para abrir direto (compatibilidade)
    const formatPhoneNumber = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      
      if (cleaned.length === 11) {
        return `55${cleaned}`;
      } else if (cleaned.length === 10) {
        return `55${cleaned}`;
      } else if (cleaned.startsWith('55')) {
        return cleaned;
      }
      
      return cleaned;
    };

    const formattedNumber = formatPhoneNumber(phoneNumber);
    const message = encodeURIComponent(`Olá ${assistidoNome}, tudo bem?`);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success(`WhatsApp aberto para ${assistidoNome}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppClick}
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
      title={`Enviar WhatsApp para ${assistidoNome}`}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}
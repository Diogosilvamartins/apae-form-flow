import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Assistido, CreateAssistidoData, UpdateAssistidoData } from "@/hooks/useAssistidos";

interface AssistidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAssistidoData | UpdateAssistidoData) => Promise<void>;
  assistido?: Assistido;
  isEdit?: boolean;
}

export default function AssistidoDialog({
  open,
  onOpenChange,
  onSubmit,
  assistido,
  isEdit = false,
}: AssistidoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    celular: "",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && assistido) {
      setFormData({
        nome: assistido.nome || "",
        data_nascimento: assistido.data_nascimento || "",
        celular: assistido.celular || "",
        observacoes: assistido.observacoes || "",
      });
    } else {
      setFormData({
        nome: "",
        data_nascimento: "",
        celular: "",
        observacoes: "",
      });
    }
  }, [isEdit, assistido, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateAssistidoData | UpdateAssistidoData = {
        nome: formData.nome.trim(),
        data_nascimento: formData.data_nascimento || undefined,
        celular: formData.celular.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Assistido" : "Novo Assistido"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere as informações do assistido abaixo."
              : "Preencha as informações do novo assistido."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome do assistido"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => handleInputChange("celular", e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Digite observações sobre o assistido"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profissional, CreateProfissionalData, UpdateProfissionalData, EspecialidadeProfissional } from "@/hooks/useProfissionais";

interface ProfissionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProfissionalData | UpdateProfissionalData) => Promise<void>;
  profissional?: Profissional;
  isEdit?: boolean;
}

const especialidades = [
  { value: 'psicologo', label: 'Psicólogo(a)' },
  { value: 'assistente_social', label: 'Assistente Social' },
  { value: 'fonoaudiologo', label: 'Fonoaudiólogo(a)' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional' },
  { value: 'pedagogo', label: 'Pedagogo(a)' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'medico', label: 'Médico(a)' },
  { value: 'outro', label: 'Outro' }
];

export default function ProfissionalDialog({
  open,
  onOpenChange,
  onSubmit,
  profissional,
  isEdit = false,
}: ProfissionalDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    especialidade: "",
    registro_profissional: "",
    celular: "",
    email: "",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && profissional) {
      setFormData({
        nome: profissional.nome || "",
        especialidade: profissional.especialidade || "",
        registro_profissional: profissional.registro_profissional || "",
        celular: profissional.celular || "",
        email: profissional.email || "",
        observacoes: profissional.observacoes || "",
      });
    } else {
      setFormData({
        nome: "",
        especialidade: "",
        registro_profissional: "",
        celular: "",
        email: "",
        observacoes: "",
      });
    }
  }, [isEdit, profissional, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.especialidade) {
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateProfissionalData | UpdateProfissionalData = {
        nome: formData.nome.trim(),
        especialidade: formData.especialidade as EspecialidadeProfissional,
        registro_profissional: formData.registro_profissional.trim() || undefined,
        celular: formData.celular.trim() || undefined,
        email: formData.email.trim() || undefined,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere as informações do profissional abaixo."
              : "Preencha as informações do novo profissional."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade *</Label>
              <Select
                value={formData.especialidade}
                onValueChange={(value) => handleInputChange("especialidade", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.value} value={esp.value}>
                      {esp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registro_profissional">Registro Profissional</Label>
              <Input
                id="registro_profissional"
                value={formData.registro_profissional}
                onChange={(e) => handleInputChange("registro_profissional", e.target.value)}
                placeholder="Ex: CRP 12345"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Digite observações sobre o profissional"
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
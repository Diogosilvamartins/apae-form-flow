import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Agendamento, CreateAgendamentoData, UpdateAgendamentoData, StatusAgendamento } from "@/hooks/useAgendamentos";
import { useAssistidos } from "@/hooks/useAssistidos";
import { useProfissionais } from "@/hooks/useProfissionais";

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgendamentoData | UpdateAgendamentoData) => Promise<void>;
  agendamento?: Agendamento;
  isEdit?: boolean;
}

const statusOptions: { value: StatusAgendamento; label: string }[] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'reagendado', label: 'Reagendado' }
];

export default function AgendamentoDialog({
  open,
  onOpenChange,
  onSubmit,
  agendamento,
  isEdit = false,
}: AgendamentoDialogProps) {
  const [formData, setFormData] = useState({
    assistido_id: "",
    profissional_id: "",
    data: undefined as Date | undefined,
    hora: "",
    duracao_minutos: "60",
    status: "agendado" as StatusAgendamento,
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  const { assistidos } = useAssistidos();
  const { profissionais } = useProfissionais();

  useEffect(() => {
    if (isEdit && agendamento) {
      const dataHora = new Date(agendamento.data_hora);
      setFormData({
        assistido_id: agendamento.assistido_id || "",
        profissional_id: agendamento.profissional_id || "",
        data: dataHora,
        hora: format(dataHora, "HH:mm"),
        duracao_minutos: agendamento.duracao_minutos?.toString() || "60",
        status: agendamento.status as StatusAgendamento,
        observacoes: agendamento.observacoes || "",
      });
    } else {
      setFormData({
        assistido_id: "",
        profissional_id: "",
        data: undefined,
        hora: "",
        duracao_minutos: "60",
        status: "agendado" as StatusAgendamento,
        observacoes: "",
      });
    }
  }, [isEdit, agendamento, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assistido_id || !formData.profissional_id || !formData.data || !formData.hora) {
      return;
    }

    setLoading(true);
    try {
      // Combinar data e hora
      const [hours, minutes] = formData.hora.split(':').map(Number);
      const dataHora = new Date(formData.data);
      dataHora.setHours(hours, minutes, 0, 0);

      const submitData: CreateAgendamentoData | UpdateAgendamentoData = {
        assistido_id: formData.assistido_id,
        profissional_id: formData.profissional_id,
        data_hora: dataHora.toISOString(),
        duracao_minutos: parseInt(formData.duracao_minutos),
        observacoes: formData.observacoes.trim() || undefined,
      };

      if (isEdit) {
        (submitData as UpdateAgendamentoData).status = formData.status;
      }

      await onSubmit(submitData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere as informações do agendamento abaixo."
              : "Preencha as informações do novo agendamento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistido_id">Assistido *</Label>
              <Select
                value={formData.assistido_id}
                onValueChange={(value) => handleInputChange("assistido_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o assistido" />
                </SelectTrigger>
                <SelectContent>
                  {assistidos.map((assistido) => (
                    <SelectItem key={assistido.id_assistido} value={assistido.id_assistido}>
                      {assistido.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profissional_id">Profissional *</Label>
              <Select
                value={formData.profissional_id}
                onValueChange={(value) => handleInputChange("profissional_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.filter(p => p.ativo).map((profissional) => (
                    <SelectItem key={profissional.id_profissional} value={profissional.id_profissional}>
                      {profissional.nome} - {profissional.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? format(formData.data, "PPP") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => handleInputChange("data", date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => handleInputChange("hora", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracao_minutos">Duração (minutos)</Label>
              <Select
                value={formData.duracao_minutos}
                onValueChange={(value) => handleInputChange("duracao_minutos", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value as StatusAgendamento)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Digite observações sobre o agendamento"
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
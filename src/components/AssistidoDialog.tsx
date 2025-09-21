import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Assistido, CreateAssistidoData, UpdateAssistidoData } from "@/hooks/useAssistidos";
import { validateCPF, formatCPF, formatCEP, validateCEP, fetchAddressByCEP } from "@/lib/validators";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AssistidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAssistidoData | UpdateAssistidoData) => Promise<void>;
  assistido?: Assistido;
  isEdit?: boolean;
}

const sexoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

const estadoCivilOptions = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União Estável" },
  { value: "outro", label: "Outro" },
];

const parentescoOptions = [
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "irmao", label: "Irmão" },
  { value: "irma", label: "Irmã" },
  { value: "avo", label: "Avô" },
  { value: "avo_materna", label: "Avó" },
  { value: "tio", label: "Tio" },
  { value: "tia", label: "Tia" },
  { value: "primo", label: "Primo" },
  { value: "prima", label: "Prima" },
  { value: "outro", label: "Outro" },
];

const estadosOptions = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function AssistidoDialog({
  open,
  onOpenChange,
  onSubmit,
  assistido,
  isEdit = false,
}: AssistidoDialogProps) {
  const [formData, setFormData] = useState({
    // Dados básicos
    nome: "",
    data_nascimento: "",
    celular: "",
    
    // Dados pessoais
    cpf: "",
    rg: "",
    sexo: "",
    estado_civil: "",
    telefone: "",
    email: "",
    foto_url: "",
    
    // Contato/Endereço
    endereco_completo: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    
    // Responsável
    nome_responsavel: "",
    cpf_responsavel: "",
    parentesco: "",
    telefone_responsavel: "",
    
    // Observações
    observacoes_gerais: "",
    paciente_ativo: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cpfError, setCpfError] = useState("");
  const [cpfResponsavelError, setCpfResponsavelError] = useState("");
  const [cepError, setCepError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile, deleteFile } = useFileUpload();
  const { user } = useAuth();

  useEffect(() => {
    if (isEdit && assistido) {
      setFormData({
        nome: assistido.nome || "",
        data_nascimento: assistido.data_nascimento || "",
        celular: assistido.celular || "",
        
        cpf: assistido.cpf || "",
        rg: assistido.rg || "",
        sexo: assistido.sexo || "",
        estado_civil: assistido.estado_civil || "",
        telefone: assistido.telefone || "",
        email: assistido.email || "",
        foto_url: assistido.foto_url || "",
        
        endereco_completo: assistido.endereco_completo || "",
        numero: assistido.numero || "",
        cep: assistido.cep || "",
        cidade: assistido.cidade || "",
        estado: assistido.estado || "",
        
        nome_responsavel: assistido.nome_responsavel || "",
        cpf_responsavel: assistido.cpf_responsavel || "",
        parentesco: assistido.parentesco || "",
        telefone_responsavel: assistido.telefone_responsavel || "",
        
        observacoes_gerais: assistido.observacoes_gerais || "",
        paciente_ativo: assistido.paciente_ativo ?? true,
      });
    } else {
      setFormData({
        nome: "",
        data_nascimento: "",
        celular: "",
        cpf: "",
        rg: "",
        sexo: "",
        estado_civil: "",
        telefone: "",
        email: "",
        foto_url: "",
        endereco_completo: "",
        numero: "",
        cep: "",
        cidade: "",
        estado: "",
        nome_responsavel: "",
        cpf_responsavel: "",
        parentesco: "",
        telefone_responsavel: "",
        observacoes_gerais: "",
        paciente_ativo: true,
      });
    }
  }, [isEdit, assistido, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    // Validação de CPF se preenchido
    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return;
    }

    // Validação de CPF do responsável se preenchido  
    if (formData.cpf_responsavel && !validateCPF(formData.cpf_responsavel)) {
      toast.error("CPF do responsável inválido");
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateAssistidoData | UpdateAssistidoData = {
        nome: formData.nome.trim(),
        data_nascimento: formData.data_nascimento || undefined,
        celular: formData.celular.trim() || undefined,
        
        cpf: formData.cpf.trim() || undefined,
        rg: formData.rg.trim() || undefined,
        sexo: formData.sexo && formData.sexo.trim() ? formData.sexo as "masculino" | "feminino" | "outro" : undefined,
        estado_civil: formData.estado_civil && formData.estado_civil.trim() ? formData.estado_civil as "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | "outro" : undefined,
        telefone: formData.telefone.trim() || undefined,
        email: formData.email.trim() || undefined,
        foto_url: formData.foto_url.trim() || undefined,
        
        endereco_completo: formData.endereco_completo.trim() || undefined,
        numero: formData.numero.trim() || undefined,
        cep: formData.cep.trim() || undefined,
        cidade: formData.cidade.trim() || undefined,
        estado: formData.estado && formData.estado.trim() ? formData.estado : undefined,
        
        nome_responsavel: formData.nome_responsavel.trim() || undefined,
        cpf_responsavel: formData.cpf_responsavel.trim() || undefined,
        parentesco: formData.parentesco && formData.parentesco.trim() ? formData.parentesco as "pai" | "mae" | "irmao" | "irma" | "avo" | "avo_materna" | "tio" | "tia" | "primo" | "prima" | "outro" : undefined,
        telefone_responsavel: formData.telefone_responsavel.trim() || undefined,
        
        observacoes_gerais: formData.observacoes_gerais.trim() || undefined,
        paciente_ativo: formData.paciente_ativo,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: "sexo" | "estado_civil" | "parentesco" | "estado", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validação e formatação de CPF
  const handleCPFChange = (field: "cpf" | "cpf_responsavel", value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const formattedValue = formatCPF(cleanValue);
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (cleanValue.length === 11) {
      const isValid = validateCPF(cleanValue);
      if (field === "cpf") {
        setCpfError(isValid ? "" : "CPF inválido");
      } else {
        setCpfResponsavelError(isValid ? "" : "CPF inválido");
      }
    } else if (cleanValue.length > 0) {
      if (field === "cpf") {
        setCpfError("CPF deve conter 11 dígitos");
      } else {
        setCpfResponsavelError("CPF deve conter 11 dígitos");
      }
    } else {
      if (field === "cpf") {
        setCpfError("");
      } else {
        setCpfResponsavelError("");
      }
    }
  };

  // Upload de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      // Deletar imagem anterior se existir
      if (formData.foto_url) {
        const oldPath = formData.foto_url.split('/').pop();
        if (oldPath) {
          await deleteFile('assistido-photos', `${user.id}/${oldPath}`);
        }
      }

      // Upload nova imagem
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      
      const publicUrl = await uploadFile(file, 'assistido-photos', filePath);
      
      if (publicUrl) {
        setFormData(prev => ({ ...prev, foto_url: publicUrl }));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.foto_url && user) {
      try {
        const fileName = formData.foto_url.split('/').pop();
        if (fileName) {
          await deleteFile('assistido-photos', `${user.id}/${fileName}`);
        }
        setFormData(prev => ({ ...prev, foto_url: "" }));
        toast.success('Imagem removida com sucesso');
      } catch (error) {
        console.error('Erro ao remover imagem:', error);
        toast.error('Erro ao remover imagem');
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Busca automática de endereço por CEP
  const handleCEPChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const formattedValue = formatCEP(cleanValue);
    
    setFormData(prev => ({ ...prev, cep: formattedValue }));
    
    if (cleanValue.length === 8) {
      if (validateCEP(cleanValue)) {
        setLoadingCEP(true);
        setCepError("");
        
        try {
          const addressData = await fetchAddressByCEP(cleanValue);
          
          if (addressData) {
            setFormData(prev => ({
              ...prev,
              endereco_completo: addressData.logradouro,
              cidade: addressData.localidade,
              estado: addressData.uf
            }));
            toast.success("Endereço preenchido automaticamente! Informe o número.");
          } else {
            setCepError("CEP não encontrado");
            toast.error("CEP não encontrado");
          }
        } catch (error) {
          setCepError("Erro ao buscar CEP");
          toast.error("Erro ao buscar CEP");
        } finally {
          setLoadingCEP(false);
        }
      } else {
        setCepError("CEP inválido");
      }
    } else if (cleanValue.length > 0) {
      setCepError("CEP deve conter 8 dígitos");
    } else {
      setCepError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 cursor-pointer" onClick={handleImageClick}>
                <AvatarImage src={formData.foto_url} alt={formData.nome} />
                <AvatarFallback className="text-lg bg-secondary">
                  {formData.nome ? formData.nome.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              {formData.foto_url && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleImageClick}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {uploading ? "Carregando..." : "Alterar Imagem"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Clique na imagem ou no botão para alterar
              </p>
            </div>
          </div>

          <Tabs defaultValue="dados-pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="dados-pessoais" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {cpfError && <p className="text-sm text-destructive">{cpfError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    placeholder="Digite o RG"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(value: "masculino" | "feminino" | "outro") => handleSelectChange("sexo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {sexoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={formData.estado_civil} onValueChange={(value: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | "outro") => handleSelectChange("estado_civil", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoCivilOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Digite o e-mail"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_completo">Logradouro</Label>
                <Input
                  id="endereco_completo"
                  value={formData.endereco_completo}
                  onChange={(e) => handleInputChange("endereco_completo", e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {loadingCEP && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cepError && <p className="text-sm text-destructive">{cepError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="Digite a cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_responsavel">Nome do Responsável</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  placeholder="Digite o nome do responsável"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf_responsavel">CPF do Responsável</Label>
                  <Input
                    id="cpf_responsavel"
                    value={formData.cpf_responsavel}
                    onChange={(e) => handleCPFChange("cpf_responsavel", e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {cpfResponsavelError && <p className="text-sm text-destructive">{cpfResponsavelError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentesco">Parentesco</Label>
                  <Select value={formData.parentesco} onValueChange={(value: "pai" | "mae" | "irmao" | "irma" | "avo" | "avo_materna" | "tio" | "tia" | "primo" | "prima" | "outro") => handleSelectChange("parentesco", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentescoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone_responsavel">Telefone do Responsável</Label>
                <Input
                  id="telefone_responsavel"
                  value={formData.telefone_responsavel}
                  onChange={(e) => handleInputChange("telefone_responsavel", e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </TabsContent>

            <TabsContent value="observacoes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
                <Textarea
                  id="observacoes_gerais"
                  value={formData.observacoes_gerais}
                  onChange={(e) => handleInputChange("observacoes_gerais", e.target.value)}
                  placeholder="Digite observações sobre o assistido"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="paciente_ativo"
                  checked={formData.paciente_ativo}
                  onCheckedChange={(checked) => handleInputChange("paciente_ativo", checked as boolean)}
                />
                <Label htmlFor="paciente_ativo">Paciente Ativo</Label>
              </div>
            </TabsContent>
          </Tabs>
          
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
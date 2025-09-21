import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Download, Upload, Smartphone, Building, MapPin, Save, Loader2, AlertTriangle } from "lucide-react";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useAssistidos } from "@/hooks/useAssistidos";
import { useProfissionais } from "@/hooks/useProfissionais";
import { formatCEP, validateCEP, fetchAddressByCEP } from "@/lib/validators";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Configuracoes() {
  const { configuracoes, loading, updateConfiguracao, getConfiguracao } = useConfiguracoes();
  const { agendamentos } = useAgendamentos();
  const { assistidos } = useAssistidos();
  const { profissionais } = useProfissionais();
  
  const [saving, setSaving] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepInput, setCepInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const [formData, setFormData] = useState({
    numero_whatsapp_padrao: '',
    nome_instituicao: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_cep: '',
    endereco_cidade: '',
    endereco_estado: '',
  });

  // Atualizar form quando configurações carregarem
  useEffect(() => {
    if (configuracoes.length > 0) {
      setFormData({
        numero_whatsapp_padrao: getConfiguracao('numero_whatsapp_padrao') || '',
        nome_instituicao: getConfiguracao('nome_instituicao') || '',
        endereco_logradouro: getConfiguracao('endereco_logradouro') || '',
        endereco_numero: getConfiguracao('endereco_numero') || '',
        endereco_cep: getConfiguracao('endereco_cep') || '',
        endereco_cidade: getConfiguracao('endereco_cidade') || '',
        endereco_estado: getConfiguracao('endereco_estado') || '',
      });
      setCepInput(getConfiguracao('endereco_cep') || '');
    }
  }, [configuracoes, getConfiguracao]);

  const handleSave = async (chave: string) => {
    setSaving(chave);
    try {
      await updateConfiguracao(chave, formData[chave as keyof typeof formData]);
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setSaving(null);
    }
  };

  const handleSaveEndereco = async () => {
    setSaving('endereco');
    try {
      // Salvar todos os campos de endereço de uma vez
      await Promise.all([
        updateConfiguracao('endereco_logradouro', formData.endereco_logradouro),
        updateConfiguracao('endereco_numero', formData.endereco_numero),
        updateConfiguracao('endereco_cep', cepInput),
        updateConfiguracao('endereco_cidade', formData.endereco_cidade),
        updateConfiguracao('endereco_estado', formData.endereco_estado),
      ]);
      toast.success('Endereço salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar endereço');
    } finally {
      setSaving(null);
    }
  };

  const gerarBackup = async () => {
    setBackupLoading(true);
    try {
      const backup = {
        data_backup: new Date().toISOString(),
        versao: "1.0",
        dados: {
          agendamentos: agendamentos.map(a => ({
            ...a,
            // Remover dados sensíveis se necessário
          })),
          assistidos: assistidos.map(a => ({
            ...a,
            // Remover dados sensíveis se necessário
          })),
          profissionais: profissionais.map(p => ({
            ...p,
            // Remover dados sensíveis se necessário
          })),
          configuracoes: configuracoes,
        },
        estatisticas: {
          total_agendamentos: agendamentos.length,
          total_assistidos: assistidos.length,
          total_profissionais: profissionais.length,
        }
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-apae-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: ptBR })}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Backup gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast.error("Erro ao gerar backup");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = () => {
    fileInputRef.current?.click();
  };

  const processBackupFile = async (file: File) => {
    setRestoreLoading(true);
    
    try {
      // Ler arquivo JSON
      const text = await file.text();
      const backup = JSON.parse(text);
      
      // Validar estrutura do backup
      if (!backup.dados || !backup.versao) {
        throw new Error('Formato de backup inválido');
      }

      const { dados } = backup;
      
      // Confirmar antes de restaurar
      const confirmRestore = window.confirm(
        `Deseja restaurar o backup?\n\n` +
        `Este processo irá SUBSTITUIR todos os dados atuais:\n` +
        `• ${dados.assistidos?.length || 0} assistidos\n` +
        `• ${dados.agendamentos?.length || 0} agendamentos\n` +
        `• ${dados.profissionais?.length || 0} profissionais\n` +
        `• ${dados.configuracoes?.length || 0} configurações\n\n` +
        `ATENÇÃO: Esta ação não pode ser desfeita!`
      );

      if (!confirmRestore) {
        toast.info('Restauração cancelada');
        return;
      }

      let restored = 0;
      
      // Limpar dados existentes e restaurar
      if (dados.configuracoes?.length) {
        await supabase.from('configuracoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        for (const config of dados.configuracoes) {
          const { id, created_at, updated_at, ...configData } = config;
          await supabase.from('configuracoes').insert(configData);
          restored++;
        }
      }

      if (dados.profissionais?.length) {
        await supabase.from('profissionais').delete().neq('id_profissional', '00000000-0000-0000-0000-000000000000');
        for (const prof of dados.profissionais) {
          const { created_at, updated_at, ...profData } = prof;
          await supabase.from('profissionais').insert(profData);
          restored++;
        }
      }

      if (dados.assistidos?.length) {
        await supabase.from('assistidos').delete().neq('id_assistido', '00000000-0000-0000-0000-000000000000');
        for (const assistido of dados.assistidos) {
          const { created_at, updated_at, ...assistidoData } = assistido;
          await supabase.from('assistidos').insert(assistidoData);
          restored++;
        }
      }

      if (dados.agendamentos?.length) {
        await supabase.from('agendamentos').delete().neq('id_agendamento', '00000000-0000-0000-0000-000000000000');
        for (const agendamento of dados.agendamentos) {
          const { created_at, updated_at, ...agendamentoData } = agendamento;
          await supabase.from('agendamentos').insert(agendamentoData);
          restored++;
        }
      }

      toast.success(`Backup restaurado com sucesso! ${restored} registros restaurados.`);
      
      // Recarregar a página para atualizar os dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error(`Erro ao restaurar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        processBackupFile(file);
      } else {
        toast.error('Selecione apenas arquivos JSON de backup');
      }
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  const handleInputChange = (chave: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [chave]: valor
    }));
  };

  // Busca automática de endereço por CEP
  const handleCEPInputChange = (value: string) => {
    console.log('[CONFIG] CEP onChange value:', value);
    setCepInput(value);
    setCepError("");
  };

  const handleCEPBlur = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length === 0) {
      setCepError("");
      return;
    }

    if (cleanValue.length !== 8) {
      setCepError("CEP deve conter 8 dígitos");
      return;
    }

    if (!validateCEP(cleanValue)) {
      setCepError("CEP inválido");
      return;
    }

    setLoadingCEP(true);

    try {
      const addressData = await fetchAddressByCEP(cleanValue);
      if (addressData) {
        // Formata e aplica os dados
        setCepInput(formatCEP(cleanValue));
        setFormData(prev => ({
          ...prev,
          endereco_logradouro: addressData.logradouro,
          endereco_cidade: addressData.localidade,
          endereco_estado: addressData.uf,
        }));
        toast.success("Endereço preenchido automaticamente! Informe o número.");
      } else {
        setCepError("CEP não encontrado");
      }
    } catch (error) {
      setCepError("Erro ao buscar CEP");
    } finally {
      setLoadingCEP(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">Configurações gerais do sistema</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Configurações WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              WhatsApp
            </CardTitle>
            <CardDescription>
              Configurações para envio de mensagens via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero_whatsapp">Número Padrão para Envio</Label>
              <div className="flex gap-2">
                <Input
                  id="numero_whatsapp"
                  value={formData.numero_whatsapp_padrao}
                  onChange={(e) => handleInputChange('numero_whatsapp_padrao', e.target.value)}
                  placeholder="33999799138"
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSave('numero_whatsapp_padrao')}
                  disabled={saving === 'numero_whatsapp_padrao'}
                  size="sm"
                >
                  {saving === 'numero_whatsapp_padrao' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Número usado quando o assistido não possui celular cadastrado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações da Instituição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Dados da Instituição
            </CardTitle>
            <CardDescription>
              Informações básicas da instituição
            </CardDescription>
          </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_instituicao">Nome da Instituição</Label>
                <div className="flex gap-2">
                  <Input
                    id="nome_instituicao"
                    value={formData.nome_instituicao}
                    onChange={(e) => handleInputChange('nome_instituicao', e.target.value)}
                    placeholder="APAE Governador Valadares"
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSave('nome_instituicao')}
                    disabled={saving === 'nome_instituicao'}
                    size="sm"
                  >
                    {saving === 'nome_instituicao' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço Completo
                </Label>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco_logradouro">Logradouro</Label>
                  <Input
                    id="endereco_logradouro"
                    value={formData.endereco_logradouro}
                    onChange={(e) => handleInputChange('endereco_logradouro', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco_numero">Número</Label>
                    <Input
                      id="endereco_numero"
                      value={formData.endereco_numero}
                      onChange={(e) => handleInputChange('endereco_numero', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco_cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="endereco_cep"
                        type="text"
                        value={cepInput}
                        onChange={(e) => handleCEPInputChange(e.target.value)}
                        onBlur={(e) => handleCEPBlur(e.target.value)}
                        onFocus={() => console.log('[CONFIG] CEP focus')}
                        placeholder="Digite o CEP"
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />
                      {loadingCEP && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {cepError && <p className="text-sm text-destructive">{cepError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_cidade">Cidade</Label>
                    <Input
                      id="endereco_cidade"
                      value={formData.endereco_cidade}
                      onChange={(e) => handleInputChange('endereco_cidade', e.target.value)}
                      placeholder="Digite a cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_estado">Estado</Label>
                    <Select value={formData.endereco_estado} onValueChange={(value) => handleInputChange('endereco_estado', value)}>
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

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveEndereco}
                    disabled={saving === 'endereco'}
                    className="flex items-center gap-2"
                  >
                    {saving === 'endereco' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving === 'endereco' ? 'Salvando...' : 'Salvar Endereço'}
                  </Button>
                </div>
              </div>
            </div>
        </Card>

        {/* Backup e Restauração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Backup e Restauração
            </CardTitle>
            <CardDescription>
              Faça backup dos dados do sistema para segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={gerarBackup}
                disabled={backupLoading}
                className="flex items-center gap-2"
              >
                {backupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {backupLoading ? "Gerando..." : "Gerar Backup"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={restoreLoading}
                    className="flex items-center gap-2"
                  >
                    {restoreLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {restoreLoading ? "Restaurando..." : "Restaurar Backup"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Confirmar Restauração de Backup
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>ATENÇÃO:</strong> Restaurar um backup irá <strong>substituir TODOS os dados atuais</strong> do sistema.
                      <br /><br />
                      Esta ação não pode ser desfeita. Certifique-se de ter um backup atual antes de prosseguir.
                      <br /><br />
                      Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRestoreBackup} className="bg-destructive hover:bg-destructive/90">
                      Sim, Restaurar Backup
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>O backup inclui:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{agendamentos.length} agendamentos</li>
                <li>{assistidos.length} assistidos</li>
                <li>{profissionais.length} profissionais</li>
                <li>Configurações do sistema</li>
              </ul>
              <p className="text-xs">
                O arquivo será baixado no formato JSON com data e hora atual.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
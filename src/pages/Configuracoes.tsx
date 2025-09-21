import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Upload, Smartphone, Building, MapPin, Save, Loader2 } from "lucide-react";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useAssistidos } from "@/hooks/useAssistidos";
import { useProfissionais } from "@/hooks/useProfissionais";
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
  
  const [formData, setFormData] = useState({
    numero_whatsapp_padrao: '',
    nome_instituicao: '',
    endereco_instituicao: '',
  });

  // Atualizar form quando configurações carregarem
  useEffect(() => {
    if (configuracoes.length > 0) {
      setFormData({
        numero_whatsapp_padrao: getConfiguracao('numero_whatsapp_padrao') || '',
        nome_instituicao: getConfiguracao('nome_instituicao') || '',
        endereco_instituicao: getConfiguracao('endereco_instituicao') || '',
      });
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

  const handleInputChange = (chave: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [chave]: valor
    }));
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
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="endereco_instituicao">Endereço</Label>
              <div className="flex gap-2">
                <Input
                  id="endereco_instituicao"
                  value={formData.endereco_instituicao}
                  onChange={(e) => handleInputChange('endereco_instituicao', e.target.value)}
                  placeholder="Endereço da APAE"
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSave('endereco_instituicao')}
                  disabled={saving === 'endereco_instituicao'}
                  size="sm"
                >
                  {saving === 'endereco_instituicao' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </CardContent>
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
              
              <Button 
                variant="outline"
                disabled
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Restaurar Backup (Em breve)
              </Button>
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
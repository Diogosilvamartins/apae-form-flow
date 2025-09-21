import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, History } from "lucide-react";
import { toast } from "sonner";

export default function Historico() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: historico, isLoading } = useQuery({
    queryKey: ["historico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historico_respostas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching historico:", error);
        toast.error("Erro ao carregar histórico");
        throw error;
      }

      return data;
    }
  });

  const filteredHistorico = historico?.filter(item =>
    item.motivo_alteracao?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Histórico
          </h1>
          <p className="text-muted-foreground">Auditoria de alterações</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
          <CardDescription>
            {filteredHistorico.length} alteração(ões) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Resposta Anterior</TableHead>
                  <TableHead>Resposta Nova</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistorico.map((item) => (
                  <TableRow key={item.id_historico}>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.motivo_alteracao || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.resposta_anterior ? JSON.stringify(item.resposta_anterior).substring(0, 50) + '...' : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {JSON.stringify(item.resposta_nova).substring(0, 50)}...
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHistorico.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum histórico encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
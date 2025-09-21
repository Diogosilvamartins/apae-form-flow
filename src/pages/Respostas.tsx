import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Respostas() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: respostas, isLoading } = useQuery({
    queryKey: ["respostas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("respostas")
        .select(`
          *,
          assistidos (
            nome
          ),
          perguntas (
            titulo
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching respostas:", error);
        toast.error("Erro ao carregar respostas");
        throw error;
      }

      return data;
    }
  });

  const filteredRespostas = respostas?.filter(resposta =>
    (resposta.assistidos as any)?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resposta.perguntas as any)?.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <MessageSquare className="h-8 w-8 text-primary" />
            Respostas
          </h1>
          <p className="text-muted-foreground">Respostas dos assistidos</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Resposta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Respostas</CardTitle>
          <CardDescription>
            {filteredRespostas.length} resposta(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por assistido ou pergunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assistido</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Resposta</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRespostas.map((resposta) => (
                  <TableRow key={resposta.id_resposta}>
                    <TableCell className="font-medium">
                      {(resposta.assistidos as any)?.nome || '-'}
                    </TableCell>
                    <TableCell>
                      {(resposta.perguntas as any)?.titulo || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {JSON.stringify(resposta.resposta).substring(0, 100)}...
                    </TableCell>
                    <TableCell>
                      {new Date(resposta.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRespostas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhuma resposta encontrada.
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
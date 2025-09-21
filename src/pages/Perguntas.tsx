import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function Perguntas() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: perguntas, isLoading } = useQuery({
    queryKey: ["perguntas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perguntas")
        .select(`
          *,
          categorias (
            nome
          )
        `)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Error fetching perguntas:", error);
        toast.error("Erro ao carregar perguntas");
        throw error;
      }

      return data;
    }
  });

  const filteredPerguntas = perguntas?.filter(pergunta =>
    pergunta.titulo.toLowerCase().includes(searchTerm.toLowerCase())
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
            <HelpCircle className="h-8 w-8 text-primary" />
            Perguntas
          </h1>
          <p className="text-muted-foreground">Questionários do sistema</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Perguntas</CardTitle>
          <CardDescription>
            {filteredPerguntas.length} pergunta(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Obrigatória</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerguntas.map((pergunta) => (
                  <TableRow key={pergunta.id_pergunta}>
                    <TableCell className="font-mono">{pergunta.ordem || '-'}</TableCell>
                    <TableCell className="font-medium">{pergunta.titulo}</TableCell>
                    <TableCell>{(pergunta.categorias as any)?.nome || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pergunta.tipo_pergunta}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pergunta.obrigatoria ? "destructive" : "secondary"}>
                        {pergunta.obrigatoria ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pergunta.ativo ? "default" : "secondary"}>
                        {pergunta.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPerguntas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Nenhuma pergunta encontrada.
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
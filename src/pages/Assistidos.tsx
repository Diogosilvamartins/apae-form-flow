import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function Assistidos() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assistidos, isLoading } = useQuery({
    queryKey: ["assistidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching assistidos:", error);
        toast.error("Erro ao carregar assistidos");
        throw error;
      }

      return data;
    }
  });

  const filteredAssistidos = assistidos?.filter(assistido =>
    assistido.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
            <UserCheck className="h-8 w-8 text-primary" />
            Assistidos
          </h1>
          <p className="text-muted-foreground">Cadastro de pessoas assistidas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assistido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Assistidos</CardTitle>
          <CardDescription>
            {filteredAssistidos.length} assistido(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssistidos.map((assistido) => (
                  <TableRow key={assistido.id_assistido}>
                    <TableCell className="font-medium">{assistido.nome}</TableCell>
                    <TableCell>
                      {assistido.data_nascimento 
                        ? new Date(assistido.data_nascimento).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={assistido.ativo ? "default" : "secondary"}>
                        {assistido.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(assistido.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAssistidos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum assistido encontrado.
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
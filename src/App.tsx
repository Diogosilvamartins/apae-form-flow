import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Usuarios from "./pages/Usuarios";
import Assistidos from "./pages/Assistidos";
import Categorias from "./pages/Categorias";
import Perguntas from "./pages/Perguntas";
import Respostas from "./pages/Respostas";
import Historico from "./pages/Historico";
import Instructions from "./pages/Instructions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/usuarios" element={<AppLayout><Usuarios /></AppLayout>} />
            <Route path="/assistidos" element={<AppLayout><Assistidos /></AppLayout>} />
            <Route path="/categorias" element={<AppLayout><Categorias /></AppLayout>} />
            <Route path="/perguntas" element={<AppLayout><Perguntas /></AppLayout>} />
            <Route path="/respostas" element={<AppLayout><Respostas /></AppLayout>} />
            <Route path="/historico" element={<AppLayout><Historico /></AppLayout>} />
            <Route path="/instrucoes" element={<AppLayout><Instructions /></AppLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

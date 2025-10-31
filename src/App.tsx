import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import { createQueryClient } from "./lib/query-client";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import EventoDetalhes from "./pages/EventoDetalhes";
import Atletas from "./pages/Atletas";
import AtletaDetalhes from "./pages/AtletaDetalhes";
import Equipes from "./pages/Equipes";
import EquipeDetalhes from "./pages/EquipeDetalhes";
import Partidas from "./pages/Partidas";
import Rankings from "./pages/Rankings";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import CadastroAtleta from "./pages/CadastroAtleta";
import CadastroSucesso from "./pages/CadastroSucesso";
import CadastroResponsavel from "./pages/CadastroResponsavel";
import Responsaveis from "./pages/Responsaveis";
import MinhasEquipes from "./pages/MinhasEquipes";
import Admin from "./pages/Admin";
import Relacoes from "./pages/admin/Relacoes";
import Organizador from "./pages/Organizador";
import Responsavel from "./pages/Responsavel";

// Create optimized query client with advanced caching
const queryClient = createQueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cadastro-atleta" element={<CadastroAtleta />} />
                <Route path="/cadastro-responsavel" element={<CadastroResponsavel />} />
                <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/relacoes" element={<Relacoes />} />
                  <Route path="/organizador" element={<Organizador />} />
                  <Route path="/responsavel" element={<Responsavel />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/eventos/:id" element={<EventoDetalhes />} />
                  <Route path="/atletas" element={<Atletas />} />
                  <Route path="/atletas/:id" element={<AtletaDetalhes />} />
                  <Route path="/equipes" element={<Equipes />} />
                  <Route path="/equipes/:id" element={<EquipeDetalhes />} />
                  <Route path="/responsaveis" element={<Responsaveis />} />
                  <Route path="/minhas-equipes" element={<MinhasEquipes />} />
                  <Route path="/partidas" element={<Partidas />} />
                  <Route path="/rankings" element={<Rankings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;

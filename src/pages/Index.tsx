import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  Newspaper,
  ArrowRight,
  Menu,
  X,
  Search,
  Bell,
  Share2,
  Filter,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  Play,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { toast } from "sonner";
import heroImage from "@/assets/hero-sports.jpg";
import sponsor1 from "@/assets/sponsor-1.png";
import sponsor2 from "@/assets/sponsor-2.png";
import sponsor3 from "@/assets/sponsor-3.png";

// Interfaces
interface Partida {
  id: string;
  data_partida: string;
  local: string;
  fase: string;
  placar_a: number;
  placar_b: number;
  finalizada: boolean;
  transmissao_url?: string;
  equipe_a: { nome: string; logo_url: string | null };
  equipe_b: { nome: string; logo_url: string | null };
}

interface Ranking {
  id: string;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  categoria: string;
  equipes: { nome: string; logo_url: string | null } | null;
}

interface Noticia {
  id: number;
  titulo: string;
  resumo: string;
  data: string;
  imagem: string;
  categoria: string;
  destaque: boolean;
}

interface Stats {
  totalPartidas: number;
  partidasHoje: number;
  equipesAtivas: number;
  espectadores: number;
}

// Componentes Auxiliares
const PartidaCard = ({ 
  partida, 
  showScore = false 
}: { 
  partida: Partida; 
  showScore?: boolean 
}) => {
  const isLive = !partida.finalizada && new Date(partida.data_partida) <= new Date();
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-l-4 border-l-primary">
      <div className="h-2 bg-gradient-primary" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(partida.data_partida)}
          </span>
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-red-500 animate-pulse">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  AO VIVO
                </span>
              </Badge>
            )}
            <Badge variant="outline">{partida.fase}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold text-sm">{partida.equipe_a.nome}</p>
            {showScore && (
              <p className="text-3xl font-bold text-primary">{partida.placar_a}</p>
            )}
          </div>

          <div className="px-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {showScore ? "×" : "VS"}
            </div>
          </div>

          <div className="flex-1 text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold text-sm">{partida.equipe_b.nome}</p>
            {showScore && (
              <p className="text-3xl font-bold text-primary">{partida.placar_b}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {partida.local}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Bell className="h-4 w-4 mr-1" />
              Notificar
            </Button>
            {partida.transmissao_url && (
              <Button size="sm" className="flex-1 bg-gradient-primary">
                <Play className="h-4 w-4 mr-1" />
                Assistir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NoticiaCard = ({ noticia }: { noticia: Noticia }) => (
  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
    <div className="relative h-56 overflow-hidden">
      <OptimizedImage
        src={noticia.imagem}
        alt={noticia.titulo}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute top-4 left-4 flex gap-2">
        <Badge className="bg-secondary">{noticia.categoria}</Badge>
        {noticia.destaque && (
          <Badge className="bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-white text-sm mb-2">
          {new Date(noticia.data).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
    <CardContent className="p-6 space-y-3">
      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
        {noticia.titulo}
      </h3>
      <p className="text-muted-foreground text-sm line-clamp-3">{noticia.resumo}</p>
      <div className="flex items-center justify-between pt-2">
        <Button variant="link" className="p-0 h-auto text-primary">
          Ler mais <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="h-2 bg-muted" />
    <CardContent className="p-6 space-y-4">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-16 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </CardContent>
  </Card>
);

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  trend?: string 
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {trend}
            </p>
          )}
        </div>
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente Principal
const Index = () => {
  // Estados
  const [proximasPartidas, setProximasPartidas] = useState<Partida[]>([]);
  const [ultimosResultados, setUltimosResultados] = useState<Partida[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPartidas: 0,
    partidasHoje: 0,
    equipesAtivas: 0,
    espectadores: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch de dados
  const fetchProximasPartidas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("partidas")
        .select(`
          *,
          equipe_a:equipe_a_id(nome, logo_url),
          equipe_b:equipe_b_id(nome, logo_url)
        `)
        .eq("finalizada", false)
        .order("data_partida", { ascending: true })
        .limit(6);

      if (error) throw error;
      if (data) setProximasPartidas(data as any);
    } catch (error) {
      console.error("Erro ao carregar próximas partidas:", error);
      toast.error("Erro ao carregar próximas partidas");
    }
  }, []);

  const fetchUltimosResultados = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("partidas")
        .select(`
          *,
          equipe_a:equipe_a_id(nome, logo_url),
          equipe_b:equipe_b_id(nome, logo_url)
        `)
        .eq("finalizada", true)
        .order("data_partida", { ascending: false })
        .limit(6);

      if (error) throw error;
      if (data) setUltimosResultados(data as any);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
      toast.error("Erro ao carregar resultados");
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("rankings")
        .select(`
          *,
          equipes:equipe_id(nome, logo_url)
        `)
        .order("pontos", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setRankings(data as any);
    } catch (error) {
      console.error("Erro ao carregar rankings:", error);
      toast.error("Erro ao carregar rankings");
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { count: totalPartidas } = await supabase
        .from("partidas")
        .select("*", { count: "exact", head: true });

      const hoje = new Date().toISOString().split("T")[0];
      const { count: partidasHoje } = await supabase
        .from("partidas")
        .select("*", { count: "exact", head: true })
        .gte("data_partida", hoje)
        .lt("data_partida", new Date(Date.now() + 86400000).toISOString());

      const { count: equipesAtivas } = await supabase
        .from("equipes")
        .select("*", { count: "exact", head: true });

      setStats({
        totalPartidas: totalPartidas || 0,
        partidasHoje: partidasHoje || 0,
        equipesAtivas: equipesAtivas || 0,
        espectadores: Math.floor(Math.random() * 50000) + 10000, // Simulado
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }, []);

  const loadNoticias = useCallback(() => {
    const noticiasData: Noticia[] = [
      {
        id: 1,
        titulo: "Palmeiras vence clássico e lidera tabela com autoridade",
        resumo: "Com gol nos acréscimos, Palmeiras vence São Paulo por 2x1 e assume liderança isolada do campeonato com 3 pontos de vantagem.",
        data: "2025-01-20",
        imagem: heroImage,
        categoria: "Campeonato",
        destaque: true,
      },
      {
        id: 2,
        titulo: "Jovem promessa marca hat-trick histórico aos 16 anos",
        resumo: "Atacante da base marca 3 gols em vitória por 4x0 e entra para história como o mais jovem a fazer hat-trick no torneio.",
        data: "2025-01-19",
        imagem: heroImage,
        categoria: "Revelação",
        destaque: true,
      },
      {
        id: 3,
        titulo: "Semifinais definidas após rodada emocionante",
        resumo: "Últimas vagas para semifinal decididas nos pênaltis após jogos equilibrados que emocionaram torcedores.",
        data: "2025-01-18",
        imagem: heroImage,
        categoria: "Torneio",
        destaque: false,
      },
      {
        id: 4,
        titulo: "Novo recorde de público na categoria de base",
        resumo: "Mais de 45 mil torcedores comparecem ao estádio e estabelecem novo recorde de público em jogo juvenil.",
        data: "2025-01-17",
        imagem: heroImage,
        categoria: "Público",
        destaque: false,
      },
      {
        id: 5,
        titulo: "Técnico revela segredo do sucesso da equipe",
        resumo: "Em entrevista exclusiva, treinador campeão compartilha metodologia de trabalho que transformou time em potência.",
        data: "2025-01-16",
        imagem: heroImage,
        categoria: "Entrevista",
        destaque: false,
      },
      {
        id: 6,
        titulo: "Investimentos em categorias de base crescem 40%",
        resumo: "Clubes brasileiros aumentam significativamente investimentos em infraestrutura e formação de atletas jovens.",
        data: "2025-01-15",
        imagem: heroImage,
        categoria: "Mercado",
        destaque: false,
      },
    ];
    setNoticias(noticiasData);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProximasPartidas(),
        fetchUltimosResultados(),
        fetchRankings(),
        fetchStats(),
      ]);
      loadNoticias();
      setIsLoading(false);
    };

    loadData();

    // Atualiza dados a cada 30 segundos
    const interval = setInterval(() => {
      fetchProximasPartidas();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchProximasPartidas, fetchUltimosResultados, fetchRankings, fetchStats, loadNoticias]);

  // Funções auxiliares
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Buscando por: ${searchQuery}`);
      // Implementar lógica de busca
    }
  }, [searchQuery]);

  const handleNotification = useCallback(() => {
    toast.success("Você será notificado sobre esta partida!");
  }, []);

  // Dados filtrados
  const noticiasFiltered = useMemo(() => {
    if (selectedCategory === "todas") return noticias;
    return noticias.filter((n) => n.categoria === selectedCategory);
  }, [noticias, selectedCategory]);

  const categorias = useMemo(() => {
    const cats = ["todas", ...new Set(noticias.map((n) => n.categoria))];
    return cats;
  }, [noticias]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sports Arena - Portal Referência em Eventos Esportivos Juvenis</title>
        <meta
          name="description"
          content="Acompanhe partidas ao vivo, resultados, classificações e notícias dos principais campeonatos esportivos juvenis do Brasil."
        />
        <meta
          name="keywords"
          content="esportes, futebol juvenil, campeonato, partidas ao vivo, rankings"
        />
      </Helmet>

      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Sports Arena
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("partidas")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Partidas
            </button>
            <button
              onClick={() => scrollToSection("resultados")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Resultados
            </button>
            <button
              onClick={() => scrollToSection("rankings")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Rankings
            </button>
            <button
              onClick={() => scrollToSection("noticias")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Notícias
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Estatísticas
            </button>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <Input
              type="search"
              placeholder="Buscar equipes, jogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button type="submit" size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Bell className="h-5 w-5" />
            </Button>
            <Link to="/dashboard">
              <Button size="sm" className="bg-gradient-primary hidden md:flex">
                Área Admin
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 space-y-4 animate-in slide-in-from-top">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection("partidas")}
                className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded hover:bg-muted"
              >
                Partidas
              </button>
              <button
                onClick={() => scrollToSection("resultados")}
                className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded hover:bg-muted"
              >
                Resultados
              </button>
              <button
                onClick={() => scrollToSection("rankings")}
                className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded hover:bg-muted"
              >
                Rankings
              </button>
              <button
                onClick={() => scrollToSection("noticias")}
                className="text-left text-sm font-medium hover:text-primary transition-colors p-2 rounded hover:bg-muted"
              >
                Notícias
              </button>
              <Link to="/dashboard">
                <Button className="w-full bg-gradient-primary">Área Admin</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[700px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105 animate-ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500 text-white animate-pulse px-4 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  {stats.partidasHoje} JOGOS AO VIVO HOJE
                </span>
              </Badge>
              <Badge className="bg-secondary text-white px-4 py-2 text-sm">
                <Users className="h-4 w-4 mr-1" />
                {stats.espectadores.toLocaleString()} espectadores
              </Badge>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              A Emoção do Esporte
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                em Tempo Real
              </span>
            </h1>

            <p className="text-xl text-gray-200 leading-relaxed">
              Plataforma completa para acompanhar todos os jogos, resultados, estatísticas e
              notícias dos melhores campeonatos juvenis do Brasil. Transmissões ao vivo,
              notificações instantâneas e muito mais.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary text-lg px-8 py-6"
                onClick={() => scrollToSection("partidas")}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Ver Jogos de Hoje
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white/20 text-lg px-8 py-6 backdrop-blur"
                onClick={() => scrollToSection("rankings")}
              >
                <Trophy className="mr-2 h-6 w-6" />
                Rankings Completos
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white/20 text-lg px-8 py-6 backdrop-blur"
                onClick={() => scrollToSection("noticias")}
              >
                <Newspaper className="mr-2 h-6 w-6" />
                Últimas Notícias
              </Button>
            </div>

            {/* Live Match Ticker */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Palmeiras 2 x 1 São Paulo</span>
                  <Badge variant="outline" className="border-white/30 text-white">
                    85' - 2º Tempo
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-white hover:text-primary">
                  Assistir Agora
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Estatísticas Rápidas */}
      <section id="stats" className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Trophy}
              label="Total de Partidas"
              value={stats.totalPartidas}
              trend="+12% este mês"
            />
            <StatCard
              icon={Calendar}
              label="Jogos Hoje"
              value={stats.partidasHoje}
              trend="Ao vivo agora"
            />
            <StatCard
              icon={Users}
              label="Equipes Ativas"
              value={stats.equipesAtivas}
              trend="+8 novas"
            />
            <StatCard
              icon={TrendingUp}
              label="Espectadores"
              value={`${(stats.espectadores / 1000).toFixed(1)}K`}
              trend="+25% hoje"
            />
          </div>
        </div>
      </section>

      {/* Próximas Partidas */}
      <section id="partidas" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <Clock className="h-10 w-10 text-primary" />
                Próximas Partidas
              </h2>
              <p className="text-muted-foreground text-lg">
                Não perca os jogos desta semana • {proximasPartidas.length} partidas agendadas
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Link to="/partidas">
                <Button className="bg-gradient-primary">
                  Ver Todas as Partidas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : proximasPartidas.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proximasPartidas.map((partida) => (
                <PartidaCard key={partida.id} partida={partida} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Calendar className="h-20 w-20 mx-auto text-muted-foreground" />
                <h3 className="text-2xl font-semibold">Nenhuma partida agendada</h3>
                <p className="text-muted-foreground">
                  Novas partidas serão adicionadas em breve
                </p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Últimos Resultados */}
      <section id="resultados" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <Trophy className="h-10 w-10 text-secondary" />
                Últimos Resultados
              </h2>
              <p className="text-muted-foreground text-lg">
                Confira como foram os jogos mais recentes
              </p>
            </div>
            <Link to="/partidas?tab=resultados">
              <Button variant="outline">
                Todos os Resultados
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : ultimosResultados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ultimosResultados.map((partida) => (
                <PartidaCard key={partida.id} partida={partida} showScore />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Trophy className="h-20 w-20 mx-auto text-muted-foreground" />
                <h3 className="text-2xl font-semibold">Nenhum resultado disponível</h3>
                <p className="text-muted-foreground">
                  Resultados serão exibidos após as partidas
                </p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Rankings/Classificação */}
      <section id="rankings" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <TrendingUp className="h-10 w-10 text-primary" />
                Classificação Geral
              </h2>
              <p className="text-muted-foreground text-lg">
                Acompanhe a tabela atualizada do campeonato
              </p>
            </div>
            <Link to="/rankings">
              <Button className="bg-gradient-primary">
                Ver Ranking Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <SkeletonCard />
          ) : (
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-primary text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Posição</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Equipe</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">PTS</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">J</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">V</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">E</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">D</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">GP</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">GC</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">SG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rankings.map((rank, index) => {
                        const saldoGols = rank.gols_pro - rank.gols_contra;
                        const jogos = rank.vitorias + rank.empates + rank.derrotas;
                        const positionColor =
                          index < 4
                            ? "bg-green-100 border-l-4 border-l-green-500"
                            : index >= rankings.length - 2
                            ? "bg-red-100 border-l-4 border-l-red-500"
                            : "";

                        return (
                          <tr
                            key={rank.id}
                            className={`hover:bg-muted/50 transition-colors ${positionColor}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                                  {index + 1}
                                </span>
                                {index < 4 && (
                                  <Trophy className="h-5 w-5 text-green-600" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-semibold text-base">
                                  {rank.equipes?.nome}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-lg text-primary">
                                {rank.pontos}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium">{jogos}</td>
                            <td className="px-6 py-4 text-center text-green-600 font-medium">
                              {rank.vitorias}
                            </td>
                            <td className="px-6 py-4 text-center text-yellow-600 font-medium">
                              {rank.empates}
                            </td>
                            <td className="px-6 py-4 text-center text-red-600 font-medium">
                              {rank.derrotas}
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                              {rank.gols_pro}
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                              {rank.gols_contra}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`font-bold ${
                                  saldoGols > 0
                                    ? "text-green-600"
                                    : saldoGols < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {saldoGols > 0 ? "+" : ""}
                                {saldoGols}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legenda */}
          <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-muted-foreground">Classificação para Semifinais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-muted-foreground">Zona de Rebaixamento</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notícias */}
      <section id="noticias" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <Newspaper className="h-10 w-10 text-primary" />
                Últimas Notícias
              </h2>
              <p className="text-muted-foreground text-lg">
                Fique por dentro de tudo que acontece no mundo esportivo
              </p>
            </div>
            <Button variant="outline">
              Ver Todas as Notícias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat ? "bg-gradient-primary" : ""
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticiasFiltered.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <Bell className="h-16 w-16 mx-auto animate-bounce" />
            <h2 className="text-4xl font-bold">Não Perca Nenhum Lance!</h2>
            <p className="text-xl text-white/90">
              Receba notificações instantâneas sobre jogos ao vivo, resultados e notícias
              exclusivas direto no seu dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
              />
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Inscrever-se
              </Button>
            </div>
            <p className="text-sm text-white/70">
              + de 50.000 fãs já recebem nossas notificações
            </p>
          </div>
        </div>
      </section>

      {/* Patrocinadores */}
      <section id="patrocinadores" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Nossos Patrocinadores</h2>
            <p className="text-muted-foreground text-lg">
              Empresas que investem e acreditam no esporte de base
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[sponsor1, sponsor2, sponsor3, sponsor1, sponsor2, sponsor3].map((sponsor, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-muted/50 rounded-lg hover:shadow-lg transition-all duration-300 grayscale hover:grayscale-0 cursor-pointer group"
              >
                <OptimizedImage
                  src={sponsor}
                  alt={`Patrocinador ${index + 1}`}
                  className="h-12 w-auto object-contain group-hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">Sports Arena</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A plataforma mais completa para acompanhar eventos esportivos juvenis do Brasil.
                Transmissões, resultados e notícias em tempo real.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Navegação</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => scrollToSection("partidas")}
                    className="hover:text-primary transition-colors"
                  >
                    Próximas Partidas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("resultados")}
                    className="hover:text-primary transition-colors"
                  >
                    Últimos Resultados
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("rankings")}
                    className="hover:text-primary transition-colors"
                  >
                    Classificação
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("noticias")}
                    className="hover:text-primary transition-colors"
                  >
                    Notícias
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Competições</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Copa São Paulo de Futebol Júnior
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Campeonato Paulista Sub-20
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Torneio Regional de Base
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Liga Nacional Juvenil
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Contato</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a
                    href="mailto:contato@sportsarena.com.br"
                    className="hover:text-primary transition-colors"
                  >
                    contato@sportsarena.com.br
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <a href="tel:+5511987654321" className="hover:text-primary transition-colors">
                    (11) 98765-4321
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>São Paulo - SP, Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2025 Sports Arena. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
        aria-label="Voltar ao topo"
      >
        <ChevronDown className="h-6 w-6 text-white rotate-180" />
      </button>
    </div>
  );
};

export default Index;

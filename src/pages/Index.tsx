import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Trophy, TrendingUp, Users, Newspaper, ArrowRight,
  Menu, X, Search, Bell, Play, Share2, Bookmark, Filter,
  MapPin, Clock, Star, ChevronRight, Activity, Target,
  Dumbbell, Volleyball, Waves, Disc
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import heroImage from "@/assets/hero-sports.jpg";
import sponsor1 from "@/assets/sponsor-1.png";
import sponsor2 from "@/assets/sponsor-2.png";
import sponsor3 from "@/assets/sponsor-3.png";

// ==================== INTERFACES ====================
interface Partida {
  id: string;
  data_partida: string;
  local: string;
  fase: string;
  placar_a: number;
  placar_b: number;
  finalizada: boolean;
  categoria: string;
  modalidade: string;
  transmissao_url?: string;
  destaque?: boolean;
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
  modalidade: string;
  jogos: number;
  equipes: { nome: string; logo_url: string | null } | null;
}

interface Noticia {
  id: number;
  titulo: string;
  resumo: string;
  data: string;
  imagem: string;
  categoria: string;
  modalidade?: string;
  autor?: string;
  visualizacoes?: number;
}

interface Estatistica {
  label: string;
  valor: string | number;
  icone: any;
  tendencia?: "up" | "down";
  modalidade?: string;
}

// ==================== CONFIGURAÇÃO DE ESPORTES ====================
interface SportConfig {
  id: string;
  nome: string;
  icone: any;
  cor: string;
  corHex: string;
  descricao: string;
}

const SPORTS_CONFIG: SportConfig[] = [
  {
    id: "todos",
    nome: "Todos os Esportes",
    icone: Trophy,
    cor: "bg-gradient-to-r from-blue-500 to-purple-600",
    corHex: "#3b82f6",
    descricao: "Acompanhe todas as modalidades"
  },
  {
    id: "futebol",
    nome: "Futebol",
    icone: Target,
    cor: "bg-gradient-to-r from-green-500 to-emerald-600",
    corHex: "#10b981",
    descricao: "O esporte mais popular"
  },
  {
    id: "volei",
    nome: "Vôlei",
    icone: Volleyball,
    cor: "bg-gradient-to-r from-orange-500 to-red-600",
    corHex: "#f97316",
    descricao: "Quadra e areia"
  },
  {
    id: "basquete",
    nome: "Basquete",
    icone: Activity,
    cor: "bg-gradient-to-r from-yellow-500 to-orange-600",
    corHex: "#eab308",
    descricao: "Dinâmico e emocionante"
  },
  {
    id: "natacao",
    nome: "Natação",
    icone: Waves,
    cor: "bg-gradient-to-r from-cyan-500 to-blue-600",
    corHex: "#06b6d4",
    descricao: "Velocidade e técnica"
  },
  {
    id: "tenis",
    nome: "Tênis",
    icone: Disc,
    cor: "bg-gradient-to-r from-lime-500 to-green-600",
    corHex: "#84cc16",
    descricao: "Habilidade e estratégia"
  },
  {
    id: "atletismo",
    nome: "Atletismo",
    icone: Dumbbell,
    cor: "bg-gradient-to-r from-red-500 to-pink-600",
    corHex: "#ef4444",
    descricao: "Força e resistência"
  }
];

// ==================== COMPONENTES REUTILIZÁVEIS ====================

// Sport Icon Component
const SportIcon = ({ modalidade, className = "h-5 w-5" }: { modalidade: string; className?: string }) => {
  const sport = SPORTS_CONFIG.find(s => s.id === modalidade) || SPORTS_CONFIG[0];
  const IconComponent = sport.icone;
  return <IconComponent className={className} />;
};

// Sport Badge Component
const SportBadge = ({ modalidade, size = "md" }: { modalidade: string; size?: "sm" | "md" | "lg" }) => {
  const sport = SPORTS_CONFIG.find(s => s.id === modalidade) || SPORTS_CONFIG[0];
  const IconComponent = sport.icone;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <Badge className={`${sport.cor} text-white border-0 ${sizeClasses[size]}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {sport.nome}
    </Badge>
  );
};

// Skeleton Loading Component
const SkeletonCard = () => (
  <Card className="overflow-hidden animate-pulse">
    <CardContent className="p-6 space-y-4">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-3/4" />
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = ({
  icon: Icon,
  titulo,
  descricao
}: {
  icon: any;
  titulo: string;
  descricao: string;
}) => (
  <div className="text-center py-16">
    <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
    <h3 className="text-xl font-semibold mb-2">{titulo}</h3>
    <p className="text-muted-foreground max-w-md mx-auto">{descricao}</p>
  </div>
);

// Partida Card Component
const PartidaCard = ({
  partida,
  showScore = false,
  onShare,
  onNotify
}: {
  partida: Partida;
  showScore?: boolean;
  onShare?: (id: string) => void;
  onNotify?: (id: string) => void;
}) => {
  const dataFormatada = new Date(partida.data_partida).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sport = SPORTS_CONFIG.find(s => s.id === partida.modalidade) || SPORTS_CONFIG[0];

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
      <div className={`h-2 ${sport.cor}`} />
      {partida.destaque && (
        <Badge className="absolute top-4 right-4 bg-yellow-500 text-white z-10">
          <Star className="h-3 w-3 mr-1" />
          Destaque
        </Badge>
      )}
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {dataFormatada}
          </span>
          <div className="flex gap-2">
            <SportBadge modalidade={partida.modalidade} size="sm" />
            <Badge variant="outline" className="font-medium">
              {partida.fase}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              {partida.equipe_a.logo_url ? (
                <img src={partida.equipe_a.logo_url} alt="" className="w-8 h-8" />
              ) : (
                <SportIcon modalidade={partida.modalidade} className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <p className="font-bold text-sm">{partida.equipe_a.nome}</p>
            {showScore && (
              <p className="text-3xl font-bold" style={{ color: sport.corHex }}>
                {partida.placar_a}
              </p>
            )}
          </div>
          
          <div className="px-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {showScore ? '×' : 'VS'}
            </div>
            {partida.transmissao_url && (
              <Badge className="mt-2 bg-red-500 text-white">
                <Play className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex-1 text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              {partida.equipe_b.logo_url ? (
                <img src={partida.equipe_b.logo_url} alt="" className="w-8 h-8" />
              ) : (
                <SportIcon modalidade={partida.modalidade} className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <p className="font-bold text-sm">{partida.equipe_b.nome}</p>
            {showScore && (
              <p className="text-3xl font-bold" style={{ color: sport.corHex }}>
                {partida.placar_b}
              </p>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {partida.local}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onShare?.(partida.id)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
            {!showScore && onNotify && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onNotify(partida.id)}
              >
                <Bell className="h-4 w-4 mr-1" />
                Notificar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Notícia Card Component
const NoticiaCard = ({
  noticia,
  onBookmark
}: {
  noticia: Noticia;
  onBookmark?: (id: number) => void;
}) => {
  const sport = noticia.modalidade 
    ? SPORTS_CONFIG.find(s => s.id === noticia.modalidade)
    : null;
  
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
      <div className="relative h-56 overflow-hidden">
        <OptimizedImage
          src={noticia.imagem}
          alt={noticia.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-secondary text-white">
            {noticia.categoria}
          </Badge>
          {sport && <SportBadge modalidade={sport.id} size="sm" />}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(noticia.id);
          }}
        >
          <Bookmark className="h-4 w-4 text-white" />
        </Button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 text-white/80 text-xs mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(noticia.data).toLocaleDateString("pt-BR")}
            </span>
            {noticia.visualizacoes && (
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {noticia.visualizacoes.toLocaleString()} views
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-white line-clamp-2">
            {noticia.titulo}
          </h3>
        </div>
      </div>
      <CardContent className="p-6 space-y-3">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {noticia.resumo}
        </p>
        {noticia.autor && (
          <p className="text-xs text-muted-foreground">Por {noticia.autor}</p>
        )}
        <Button variant="link" className="p-0 h-auto text-primary group-hover:gap-2 transition-all">
          Ler matéria completa
          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================

const Index = () => {
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [selectedSport, setSelectedSport] = useState("todos");
  const [proximasPartidas, setProximasPartidas] = useState<Partida[]>([]);
  const [ultimosResultados, setUltimosResultados] = useState<Partida[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [partidasDestaque, setPartidasDestaque] = useState<Partida[]>([]);

  // Notícias mockadas com modalidades
  const noticias: Noticia[] = [
    {
      id: 1,
      titulo: "Palmeiras vence clássico histórico e dispara na liderança",
      resumo: "Com gol nos acréscimos do segundo tempo, Palmeiras vence São Paulo por 2x1 e assume liderança isolada do campeonato com 5 pontos de vantagem.",
      data: "2025-01-20",
      imagem: heroImage,
      categoria: "Campeonato",
      modalidade: "futebol",
      autor: "Carlos Silva",
      visualizacoes: 15420,
    },
    {
      id: 2,
      titulo: "Seleção brasileira de vôlei conquista ouro no Pan-Americano",
      resumo: "Após partida emocionante, Brasil vence Argentina por 3 sets a 1 e conquista medalha de ouro inédita na categoria sub-19.",
      data: "2025-01-19",
      imagem: heroImage,
      categoria: "Internacional",
      modalidade: "volei",
      autor: "Ana Rodrigues",
      visualizacoes: 23150,
    },
    {
      id: 3,
      titulo: "Nadador brasileiro bate recorde sul-americano nos 100m livre",
      resumo: "Com tempo de 47.8 segundos, jovem de 17 anos estabelece nova marca continental e se classifica para o mundial.",
      data: "2025-01-18",
      imagem: heroImage,
      categoria: "Recordes",
      modalidade: "natacao",
      autor: "Pedro Santos",
      visualizacoes: 18700,
    },
  ];

  // Estatísticas por esporte
  const estatisticas: Estatistica[] = [
    { label: "Partidas Hoje", valor: 24, icone: Calendar, tendencia: "up" },
    { label: "Modalidades Ativas", valor: 6, icone: Trophy },
    { label: "Equipes Cadastradas", valor: 186, icone: Users, tendencia: "up" },
    { label: "Espectadores", valor: "42.5k", icone: Activity },
  ];

  // Sport atual selecionado
  const currentSport = SPORTS_CONFIG.find(s => s.id === selectedSport) || SPORTS_CONFIG[0];

  // ==================== FUNÇÕES DE FETCH ====================

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchProximasPartidas(),
        fetchUltimosResultados(),
        fetchRankings(),
        fetchPartidasDestaque(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProximasPartidas = async () => {
    let query = supabase
      .from("partidas")
      .select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
      .eq("finalizada", false)
      .order("data_partida", { ascending: true })
      .limit(6);

    if (selectedSport !== "todos") {
      query = query.eq("modalidade", selectedSport);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data) setProximasPartidas(data as any);
  };

  const fetchUltimosResultados = async () => {
    let query = supabase
      .from("partidas")
      .select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
      .eq("finalizada", true)
      .order("data_partida", { ascending: false })
      .limit(6);

    if (selectedSport !== "todos") {
      query = query.eq("modalidade", selectedSport);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data) setUltimosResultados(data as any);
  };

  const fetchRankings = async () => {
    let query = supabase
      .from("rankings")
      .select(`*, equipes:equipe_id(nome, logo_url)`)
      .order("pontos", { ascending: false })
      .limit(10);

    if (selectedSport !== "todos") {
      query = query.eq("modalidade", selectedSport);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data) setRankings(data as any);
  };

  const fetchPartidasDestaque = async () => {
    let query = supabase
      .from("partidas")
      .select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
      .eq("destaque", true)
      .eq("finalizada", false)
      .order("data_partida", { ascending: true })
      .limit(3);

    if (selectedSport !== "todos") {
      query = query.eq("modalidade", selectedSport);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data) setPartidasDestaque(data as any);
  };

  // ==================== HANDLERS ====================

  const handleShare = (id: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Sports Arena - Partida',
        text: 'Confira esta partida!',
        url: `${window.location.origin}/partida/${id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/partida/${id}`);
      toast.success("Link copiado para área de transferência!");
    }
  };

  const handleNotify = (id: string) => {
    toast.success("Você receberá uma notificação antes da partida começar!");
  };

  const handleBookmark = (id: number) => {
    toast.success("Notícia salva nos seus favoritos!");
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    toast.success(`Exibindo ${SPORTS_CONFIG.find(s => s.id === sportId)?.nome || 'todos os esportes'}`);
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchData();
  }, [selectedSport]);

  // ==================== FILTROS ====================

  const rankingsFiltrados = useMemo(() => {
    if (selectedCategoria === "todas") return rankings;
    return rankings.filter(r => r.categoria === selectedCategoria);
  }, [rankings, selectedCategoria]);

  const categorias = useMemo(() => {
    const cats = new Set(rankings.map(r => r.categoria));
    return ["todas", ...Array.from(cats)];
  }, [rankings]);

  const noticiasFiltradas = useMemo(() => {
    if (selectedSport === "todos") return noticias;
    return noticias.filter(n => n.modalidade === selectedSport);
  }, [noticias, selectedSport]);

  // ==================== RENDER ====================

  return (
    <>
      <Helmet>
        <title>Sports Arena - Portal Multi-Esportivo Completo</title>
        <meta 
          name="description" 
          content="Acompanhe futebol, vôlei, basquete, natação e mais! Resultados, classificações e notícias em tempo real de todos os esportes." 
        />
        <meta name="keywords" content="esportes, multi-esportivo, futebol, volei, basquete, natação, atletismo, partidas ao vivo" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* ==================== HEADER ==================== */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentSport.cor}`}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold block">Sports Arena</span>
                <span className="text-xs text-muted-foreground">{currentSport.descricao}</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection('partidas')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Partidas
              </button>
              <button 
                onClick={() => scrollToSection('resultados')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Resultados
              </button>
              <button 
                onClick={() => scrollToSection('rankings')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Rankings
              </button>
              <button 
                onClick={() => scrollToSection('noticias')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Notícias
              </button>
              <button 
                onClick={() => scrollToSection('modalidades')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Modalidades
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-xs">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar esportes, times..."
                  className="border-0 bg-transparent focus-visible:ring-0 p-0 h-6"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              <Link to="/dashboard" className="hidden sm:block">
                <Button size="sm" className={currentSport.cor}>
                  Admin
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-background">
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <button 
                  onClick={() => scrollToSection('modalidades')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  🏅 Modalidades
                </button>
                <button 
                  onClick={() => scrollToSection('partidas')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  📅 Partidas
                </button>
                <button 
                  onClick={() => scrollToSection('resultados')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  🏆 Resultados
                </button>
                <button 
                  onClick={() => scrollToSection('rankings')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  📊 Rankings
                </button>
                <button 
                  onClick={() => scrollToSection('noticias')}
                  className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  📰 Notícias
                </button>
                <Link to="/dashboard" className="block">
                  <Button size="sm" className={`w-full ${currentSport.cor}`}>
                    Área Administrativa
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* ==================== HERO SECTION COM SELETOR DE ESPORTES ==================== */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent`} />
          </div>
          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-4xl space-y-8 animate-fade-in">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-600 text-white animate-pulse px-4 py-2">
                  <Play className="h-5 w-5 mr-2 inline" />
                  24 PARTIDAS AO VIVO
                </Badge>
                <Badge className={`${currentSport.cor} text-white px-4 py-2`}>
                  <currentSport.icone className="h-5 w-5 mr-2 inline" />
                  {currentSport.nome.toUpperCase()}
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Multi-Esportivo<br />
                <span className={`bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
                  Todos os Esportes em Um Só Lugar
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 max-w-3xl">
                Futebol, vôlei, basquete, natação e muito mais! Acompanhe resultados, 
                classificações e notícias de todas as modalidades em tempo real.
              </p>

              {/* Seletor de Modalidades */}
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Escolha seu Esporte
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {SPORTS_CONFIG.map((sport) => {
                    const IconComponent = sport.icone;
                    const isActive = selectedSport === sport.id;
                    return (
                      <button
                        key={sport.id}
                        onClick={() => handleSportChange(sport.id)}
                        className={`
                          p-4 rounded-xl transition-all duration-300 group
                          ${isActive 
                            ? `${sport.cor} text-white shadow-lg scale-105` 
                            : 'bg-white/10 text-white hover:bg-white/20'
                          }
                        `}
                      >
                        <IconComponent className={`h-8 w-8 mx-auto mb-2 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                        <span className="text-xs font-semibold block">{sport.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className={`${currentSport.cor} hover:scale-105 transition-transform text-white`}
                  onClick={() => scrollToSection('partidas')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Ver Programação
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 text-white border-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => scrollToSection('rankings')}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Ver Rankings
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-8 w-8 text-white rotate-90" />
          </div>
        </section>

        {/* ==================== ESTATÍSTICAS RÁPIDAS ==================== */}
        <section id="estatisticas" className="py-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {estatisticas.map((stat, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all hover:-translate-y-1 bg-background/80 backdrop-blur"
                >
                  <CardContent className="p-6 text-center space-y-2">
                    <div className={`w-12 h-12 mx-auto ${currentSport.cor} rounded-full flex items-center justify-center mb-3`}>
                      <stat.icone className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold" style={{ color: currentSport.corHex }}>{stat.valor}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {stat.tendencia && (
                      <Badge variant="outline" className="text-xs">
                        {stat.tendencia === "up" ? "↑" : "↓"} Tendência
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SEÇÃO DE MODALIDADES ==================== */}
        <section id="modalidades" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3">Todas as Modalidades</h2>
              <p className="text-muted-foreground text-lg">
                Escolha seu esporte favorito e acompanhe tudo em tempo real
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPORTS_CONFIG.slice(1).map((sport) => {
                const IconComponent = sport.icone;
                return (
                  <Card 
                    key={sport.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      handleSportChange(sport.id);
                      scrollToSection('partidas');
                    }}
                  >
                    <div className={`h-32 ${sport.cor} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <IconComponent className="h-20 w-20 text-white/20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                      <div className="relative p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{sport.nome}</h3>
                          <p className="text-white/80 text-sm">{sport.descricao}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-3xl font-bold" style={{ color: sport.corHex }}>
                            {Math.floor(Math.random() * 50) + 10}
                          </p>
                          <p className="text-sm text-muted-foreground">Partidas esta semana</p>
                        </div>
                        <Button className={sport.cor}>
                          Ver Mais
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== PARTIDAS EM DESTAQUE ==================== */}
        {partidasDestaque.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge className="bg-yellow-500 text-white mb-4 px-4 py-1">
                  <Star className="h-4 w-4 mr-2 inline" />
                  JOGOS IMPERDÍVEIS
                </Badge>
                <h2 className="text-4xl font-bold mb-3">Partidas em Destaque</h2>
                <p className="text-muted-foreground text-lg">Os confrontos mais esperados da semana</p>
              </div>
              
              {isLoading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {partidasDestaque.map((partida) => (
                    <PartidaCard
                      key={partida.id}
                      partida={partida}
                      onShare={handleShare}
                      onNotify={handleNotify}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================== PRÓXIMAS PARTIDAS ==================== */}
        <section id="partidas" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">Próximas Partidas</h2>
                <p className="text-muted-foreground text-lg">
                  {selectedSport === "todos" 
                    ? "Acompanhe todos os esportes" 
                    : `Calendário de ${currentSport.nome}`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Link to="/partidas">
                  <Button className={currentSport.cor}>
                    Ver Todas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : proximasPartidas.length === 0 ? (
              <EmptyState
                icon={Calendar}
                titulo="Nenhuma partida agendada"
                descricao={`No momento não há partidas de ${currentSport.nome.toLowerCase()} programadas.`}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proximasPartidas.map((partida) => (
                  <PartidaCard
                    key={partida.id}
                    partida={partida}
                    onShare={handleShare}
                    onNotify={handleNotify}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==================== ÚLTIMOS RESULTADOS ==================== */}
        <section id="resultados" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">Últimos Resultados</h2>
                <p className="text-muted-foreground text-lg">
                  Confira como foram os jogos mais recentes
                </p>
              </div>
              <Link to="/partidas">
                <Button className={currentSport.cor}>
                  Ver Todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : ultimosResultados.length === 0 ? (
              <EmptyState
                icon={Trophy}
                titulo="Nenhum resultado disponível"
                descricao="Ainda não há resultados de partidas finalizadas."
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ultimosResultados.map((partida) => (
                  <PartidaCard
                    key={partida.id}
                    partida={partida}
                    showScore={true}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==================== RANKINGS ==================== */}
        <section id="rankings" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">Classificação</h2>
                <p className="text-muted-foreground text-lg">
                  Tabelas atualizadas de {currentSport.nome.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-3">
                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link to="/rankings">
                  <Button className={currentSport.cor}>
                    Tabela Completa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {isLoading ? (
              <SkeletonCard />
            ) : rankingsFiltrados.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                titulo="Nenhum ranking disponível"
                descricao="Ainda não há dados de classificação para esta categoria."
              />
            ) : (
              <Card className="overflow-hidden shadow-xl">
                <div className={`h-2 ${currentSport.cor}`} />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: currentSport.corHex }} className="text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold">POS</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">EQUIPE</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">J</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">PTS</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">V</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">E</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">D</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">GP</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">GC</th>
                          <th className="px-6 py-4 text-center text-sm font-bold">SG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rankingsFiltrados.map((rank, index) => {
                          const isTop3 = index < 3;
                          const saldoGols = rank.gols_pro - rank.gols_contra;
                          
                          return (
                            <tr 
                              key={rank.id} 
                              className={`hover:bg-muted/50 transition-colors ${isTop3 ? 'bg-green-50/50 dark:bg-green-950/20' : ''}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <span 
                                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white`}
                                    style={{
                                      background: index === 0 ? '#FFD700' :
                                                 index === 1 ? '#C0C0C0' :
                                                 index === 2 ? '#CD7F32' :
                                                 currentSport.corHex
                                    }}
                                  >
                                    {index + 1}
                                  </span>
                                  {isTop3 && (
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {rank.equipes?.logo_url ? (
                                    <img 
                                      src={rank.equipes.logo_url} 
                                      alt="" 
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                      <SportIcon modalidade={rank.modalidade} className="w-5 h-5" />
                                    </div>
                                  )}
                                  <span className="font-semibold">{rank.equipes?.nome}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-muted-foreground">
                                {rank.vitorias + rank.empates + rank.derrotas}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-bold text-lg" style={{ color: currentSport.corHex }}>
                                  {rank.pontos}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center text-green-600 font-semibold">
                                {rank.vitorias}
                              </td>
                              <td className="px-6 py-4 text-center text-yellow-600 font-semibold">
                                {rank.empates}
                              </td>
                              <td className="px-6 py-4 text-center text-red-600 font-semibold">
                                {rank.derrotas}
                              </td>
                              <td className="px-6 py-4 text-center font-semibold">
                                {rank.gols_pro}
                              </td>
                              <td className="px-6 py-4 text-center font-semibold">
                                {rank.gols_contra}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`font-bold ${
                                  saldoGols > 0 ? 'text-green-600' :
                                  saldoGols < 0 ? 'text-red-600' :
                                  'text-muted-foreground'
                                }`}>
                                  {saldoGols > 0 ? '+' : ''}{saldoGols}
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
          </div>
        </section>

        {/* ==================== NOTÍCIAS ==================== */}
        <section id="noticias" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">Últimas Notícias</h2>
                <p className="text-muted-foreground text-lg">
                  Fique por dentro do mundo esportivo
                </p>
              </div>
              <Button className={currentSport.cor}>
                <Newspaper className="mr-2 h-5 w-5" />
                Ver Todas
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasFiltradas.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  noticia={noticia}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PATROCINADORES ==================== */}
        <section id="patrocinadores" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3">Nossos Patrocinadores</h2>
              <p className="text-muted-foreground text-lg">
                Empresas que apoiam o esporte de base
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {[sponsor1, sponsor2, sponsor3, sponsor1, sponsor2, sponsor3].map((sponsor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-6 bg-muted rounded-xl hover:shadow-xl transition-all grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
                >
                  <OptimizedImage
                    src={sponsor}
                    alt={`Patrocinador ${index + 1}`}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== CTA SECTION ==================== */}
        <section className={`py-20 ${currentSport.cor} text-white`}>
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <currentSport.icone className="h-16 w-16 mx-auto text-white/80" />
              <h2 className="text-4xl md:text-5xl font-bold">
                Não Perca Nenhuma Jogada!
              </h2>
              <p className="text-xl text-white/90">
                Receba notificações de {currentSport.nome.toLowerCase()}, suas equipes favoritas 
                e muito mais diretamente no seu dispositivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: currentSport.corHex }}>
                  <Bell className="mr-2 h-5 w-5" />
                  Ativar Notificações
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Users className="mr-2 h-5 w-5" />
                  Criar Conta Grátis
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FOOTER ==================== */}
        <footer className="bg-card border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${currentSport.cor}`}>
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">Sports Arena</span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  O portal multi-esportivo mais completo do Brasil. Acompanhe futebol, vôlei, 
                  basquete, natação e muito mais em tempo real.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-lg">Esportes</h4>
                <ul className="space-y-3">
                  {SPORTS_CONFIG.slice(1, 5).map((sport) => (
                    <li key={sport.id}>
                      <button 
                        onClick={() => handleSportChange(sport.id)}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <sport.icone className="h-4 w-4" />
                        {sport.nome}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-lg">Navegação</h4>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => scrollToSection('partidas')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Partidas
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('resultados')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Resultados
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('rankings')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Rankings
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('noticias')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Notícias
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-lg">Contato</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>📧</span>
                    <span>contato@sportsarena.com.br</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📱</span>
                    <span>(11) 98765-4321</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📍</span>
                    <span>São Paulo - SP, Brasil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🕐</span>
                    <span>24/7 - Acompanhe sempre</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  © 2025 Sports Arena. Todos os direitos reservados. Portal Multi-Esportivo 🏆⚽🏐🏀🏊🎾
                </p>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">
                    Termos de Uso
                  </a>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacidade
                  </a>
                  <a href="#" className="hover:text-primary transition-colors">
                    Cookies
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;

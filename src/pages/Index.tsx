import { useEffect, useState, useMemo, useCallback } from “react”;
import { Link } from “react-router-dom”;
import { Helmet } from “react-helmet-async”;
import { supabase } from “@/integrations/supabase/client”;
import { Button } from “@/components/ui/button”;
import { Card, CardContent } from “@/components/ui/card”;
import { Badge } from “@/components/ui/badge”;
import {
Calendar, Trophy, TrendingUp, Users, Newspaper, ArrowRight,
Menu, X, Search, Bell, Play, Share2, Bookmark, Filter,
MapPin, Clock, Star, ChevronRight, Activity, Target
} from “lucide-react”;
import { OptimizedImage } from “@/components/OptimizedImage”;
import { Input } from “@/components/ui/input”;
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from “@/components/ui/select”;
import { toast } from “sonner”;
import heroImage from “@/assets/hero-sports.jpg”;
import sponsor1 from “@/assets/sponsor-1.png”;
import sponsor2 from “@/assets/sponsor-2.png”;
import sponsor3 from “@/assets/sponsor-3.png”;

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
autor?: string;
visualizacoes?: number;
}

interface Estatistica {
label: string;
valor: string | number;
icone: any;
tendencia?: “up” | “down”;
}

// ==================== COMPONENTES REUTILIZÁVEIS ====================

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
const dataFormatada = new Date(partida.data_partida).toLocaleDateString(“pt-BR”, {
day: “2-digit”,
month: “short”,
hour: “2-digit”,
minute: “2-digit”,
});

return (
<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
<div className={`h-2 ${showScore ? 'bg-gradient-secondary' : 'bg-gradient-primary'}`} />
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
<Badge variant="outline" className="font-medium">
{partida.fase}
</Badge>
</div>

```
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
          {partida.equipe_a.logo_url ? (
            <img src={partida.equipe_a.logo_url} alt="" className="w-8 h-8" />
          ) : (
            <Trophy className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <p className="font-bold text-sm">{partida.equipe_a.nome}</p>
        {showScore && (
          <p className="text-3xl font-bold text-primary">{partida.placar_a}</p>
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
            <Trophy className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <p className="font-bold text-sm">{partida.equipe_b.nome}</p>
        {showScore && (
          <p className="text-3xl font-bold text-primary">{partida.placar_b}</p>
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
```

);
};

// Notícia Card Component
const NoticiaCard = ({
noticia,
onBookmark
}: {
noticia: Noticia;
onBookmark?: (id: number) => void;
}) => (
<Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
<div className="relative h-56 overflow-hidden">
<OptimizedImage
src={noticia.imagem}
alt={noticia.titulo}
className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
<Badge className="absolute top-4 left-4 bg-secondary text-white">
{noticia.categoria}
</Badge>
<Button
variant=“ghost”
size=“icon”
className=“absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30”
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
{new Date(noticia.data).toLocaleDateString(“pt-BR”)}
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

// ==================== COMPONENTE PRINCIPAL ====================

const Index = () => {
// Estados
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState(””);
const [selectedCategoria, setSelectedCategoria] = useState(“todas”);
const [selectedSport, setSelectedSport] = useState(“todos”);
const [proximasPartidas, setProximasPartidas] = useState<Partida[]>([]);
const [ultimosResultados, setUltimosResultados] = useState<Partida[]>([]);
const [rankings, setRankings] = useState<Ranking[]>([]);
const [partidasDestaque, setPartidasDestaque] = useState<Partida[]>([]);

// Notícias mockadas com mais dados
const noticias: Noticia[] = [
{
id: 1,
titulo: “Palmeiras vence clássico histórico e dispara na liderança”,
resumo: “Com gol nos acréscimos do segundo tempo, Palmeiras vence São Paulo por 2x1 e assume liderança isolada do campeonato com 5 pontos de vantagem.”,
data: “2025-01-20”,
imagem: heroImage,
categoria: “Campeonato”,
autor: “Carlos Silva”,
visualizacoes: 15420,
},
{
id: 2,
titulo: “Revelação de 16 anos faz hat-trick em partida histórica”,
resumo: “Jovem atacante marca três gols em 15 minutos e entra para a história como o mais jovem a fazer hat-trick no torneio sub-17.”,
data: “2025-01-19”,
imagem: heroImage,
categoria: “Destaque”,
autor: “Ana Rodrigues”,
visualizacoes: 23150,
},
{
id: 3,
titulo: “Semifinais definidas em noite de emoções e pênaltis”,
resumo: “Últimas vagas para semifinal são decididas nos pênaltis após jogos equilibrados. Confrontos prometem grande espetáculo.”,
data: “2025-01-18”,
imagem: heroImage,
categoria: “Copa”,
autor: “Pedro Santos”,
visualizacoes: 18700,
},
];

// Estatísticas gerais
const estatisticas: Estatistica[] = [
{ label: “Partidas Hoje”, valor: 8, icone: Calendar, tendencia: “up” },
{ label: “Times Cadastrados”, valor: 64, icone: Users },
{ label: “Gols na Rodada”, valor: 127, icone: Target, tendencia: “up” },
{ label: “Espectadores”, valor: “12.5k”, icone: Activity },
];

// ==================== FUNÇÕES DE FETCH ====================

const fetchData = useCallback(async () => {
try {
setIsLoading(true);
await Promise.all([
fetchProximasPartidas(),
fetchUltimosResultados(),
fetchRankings(),
fetchPartidasDestaque(),
]);
} catch (error) {
console.error(“Erro ao carregar dados:”, error);
toast.error(“Erro ao carregar dados. Tente novamente.”);
} finally {
setIsLoading(false);
}
}, []);

const fetchProximasPartidas = async () => {
const { data, error } = await supabase
.from(“partidas”)
.select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
.eq(“finalizada”, false)
.order(“data_partida”, { ascending: true })
.limit(6);

```
if (error) throw error;
if (data) setProximasPartidas(data as any);
```

};

const fetchUltimosResultados = async () => {
const { data, error } = await supabase
.from(“partidas”)
.select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
.eq(“finalizada”, true)
.order(“data_partida”, { ascending: false })
.limit(6);

```
if (error) throw error;
if (data) setUltimosResultados(data as any);
```

};

const fetchRankings = async () => {
const { data, error } = await supabase
.from(“rankings”)
.select(`*, equipes:equipe_id(nome, logo_url)`)
.order(“pontos”, { ascending: false })
.limit(10);

```
if (error) throw error;
if (data) setRankings(data as any);
```

};

const fetchPartidasDestaque = async () => {
const { data, error } = await supabase
.from(“partidas”)
.select(`*, equipe_a:equipe_a_id(nome, logo_url), equipe_b:equipe_b_id(nome, logo_url)`)
.eq(“destaque”, true)
.eq(“finalizada”, false)
.order(“data_partida”, { ascending: true })
.limit(3);

```
if (error) throw error;
if (data) setPartidasDestaque(data as any);
```

};

// ==================== HANDLERS ====================

const handleShare = (id: string) => {
if (navigator.share) {
navigator.share({
title: ‘Sports Arena - Partida’,
text: ‘Confira esta partida!’,
url: `${window.location.origin}/partida/${id}`,
}).catch(console.error);
} else {
navigator.clipboard.writeText(`${window.location.origin}/partida/${id}`);
toast.success(“Link copiado para área de transferência!”);
}
};

const handleNotify = (id: string) => {
toast.success(“Você receberá uma notificação antes da partida começar!”);
};

const handleBookmark = (id: number) => {
toast.success(“Notícia salva nos seus favoritos!”);
};

const scrollToSection = (id: string) => {
setMobileMenuOpen(false);
const element = document.getElementById(id);
element?.scrollIntoView({ behavior: ‘smooth’, block: ‘start’ });
};

// ==================== EFFECTS ====================

useEffect(() => {
fetchData();
}, [fetchData]);

// ==================== FILTROS ====================

const rankingsFiltrados = useMemo(() => {
if (selectedCategoria === “todas”) return rankings;
return rankings.filter(r => r.categoria === selectedCategoria);
}, [rankings, selectedCategoria]);

const categorias = useMemo(() => {
const cats = new Set(rankings.map(r => r.categoria));
return [“todas”, …Array.from(cats)];
}, [rankings]);

// ==================== RENDER ====================

return (
<>
<Helmet>
<title>Sports Arena - Portal Completo de Esportes Juvenis</title>
<meta 
name="description" 
content="Acompanhe em tempo real partidas, resultados, classificações e notícias dos melhores campeonatos esportivos juvenis do Brasil." 
/>
<meta name="keywords" content="esportes, futebol juvenil, campeonato, partidas ao vivo, classificação" />
</Helmet>

```
  <div className="min-h-screen bg-background">
    {/* ==================== HEADER ==================== */}
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary animate-pulse" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Sports Arena
          </span>
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
            onClick={() => scrollToSection('estatisticas')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Estatísticas
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar times, partidas..."
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
            <Button size="sm" className="bg-gradient-primary">
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
            <button 
              onClick={() => scrollToSection('estatisticas')}
              className="text-left text-sm font-medium hover:text-primary transition-colors py-2"
            >
              📈 Estatísticas
            </button>
            <Link to="/dashboard" className="block">
              <Button size="sm" className="w-full bg-gradient-primary">
                Área Administrativa
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>

    {/* ==================== HERO SECTION ==================== */}
    <section className="relative h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      </div>
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl space-y-6 animate-fade-in">
          <Badge className="bg-red-600 text-white animate-pulse px-4 py-1">
            <Play className="h-4 w-4 mr-2 inline" />
            8 PARTIDAS AO VIVO AGORA
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            A Emoção do Esporte<br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Em Tempo Real
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Acompanhe todos os jogos, resultados, estatísticas e notícias dos melhores 
            campeonatos juvenis do Brasil. Sua dose diária de esporte está aqui!
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:scale-105 transition-transform"
              onClick={() => scrollToSection('partidas')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Ver Programação Completa
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
                <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                  <stat.icone className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-primary">{stat.valor}</p>
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
    <section id="partidas" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Próximas Partidas</h2>
            <p className="text-muted-foreground text-lg">
              Não perca nenhum jogo desta semana
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
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
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : proximasPartidas.length === 0 ? (
          <EmptyState
            icon={Calendar}
            titulo="Nenhuma partida agendada"
            descricao="No momento não há partidas programadas. Volte em breve para conferir novos jogos!"
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
    <section id="resultados" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Últimos Resultados</h2>
            <p className="text-muted-foreground text-lg">
              Confira como foram os jogos mais recentes
            </p>
          </div>
          <Link to="/partidas">
            <Button className="bg-gradient-secondary">
              Ver Todos os Resultados
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

    {/* ==================== RANKINGS COM FILTROS ==================== */}
    <section id="rankings" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Classificação Geral</h2>
            <p className="text-muted-foreground text-lg">
              Acompanhe a tabela atualizada do campeonato
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
              <Button className="bg-gradient-primary">
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
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-primary text-white">
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
                              <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-primary/70'
                              }`}>
                                {index + 1}
                              </span>
                              {isTop3 && (
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {rank.equipes?.logo_url && (
                                <img 
                                  src={rank.equipes.logo_url} 
                                  alt="" 
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="font-semibold">{rank.equipes?.nome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-muted-foreground">
                            {rank.vitorias + rank.empates + rank.derrotas}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-lg text-primary">{rank.pontos}</span>
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
    <section id="noticias" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Últimas Notícias</h2>
            <p className="text-muted-foreground text-lg">
              Fique por dentro de tudo que acontece no mundo esportivo
            </p>
          </div>
          <Button className="bg-gradient-secondary">
            <Newspaper className="mr-2 h-5 w-5" />
            Ver Todas as Notícias
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
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
    <section id="patrocinadores" className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Nossos Patrocinadores</h2>
          <p className="text-muted-foreground text-lg">
            Empresas que investem e acreditam no esporte de base
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {[sponsor1, sponsor2, sponsor3, sponsor1, sponsor2, sponsor3].map((sponsor, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-background rounded-xl hover:shadow-xl transition-all grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
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
    <section className="py-20 bg-gradient-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Não Perca Nenhum Lance!
          </h2>
          <p className="text-xl text-white/90">
            Receba notificações sobre suas equipes favoritas, partidas ao vivo e 
            muito mais diretamente no seu dispositivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
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
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Sports Arena</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              O portal mais completo de esportes juvenis do Brasil. Acompanhe partidas, 
              resultados, rankings e notícias em tempo real.
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
            <h4 className="font-bold mb-4 text-lg">Competições</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">
                Copa São Paulo Sub-17
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Campeonato Paulista Sub-20
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Torneio Regional
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                Liga Metropolitana
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
                <span>Seg-Sex: 8h às 18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Sports Arena. Todos os direitos reservados. Desenvolvido com ❤️ para o esporte brasileiro.
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
```

);
};

export default Index;
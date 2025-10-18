import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, TrendingUp, Users, Newspaper, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";
import sponsor1 from "@/assets/sponsor-1.png";
import sponsor2 from "@/assets/sponsor-2.png";
import sponsor3 from "@/assets/sponsor-3.png";

interface Partida {
  id: string;
  data_partida: string;
  local: string;
  fase: string;
  placar_a: number;
  placar_b: number;
  finalizada: boolean;
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

const Index = () => {
  const [proximasPartidas, setProximasPartidas] = useState<Partida[]>([]);
  const [ultimosResultados, setUltimosResultados] = useState<Partida[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);

  useEffect(() => {
    fetchProximasPartidas();
    fetchUltimosResultados();
    fetchRankings();
  }, []);

  const fetchProximasPartidas = async () => {
    const { data } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(nome, logo_url),
        equipe_b:equipe_b_id(nome, logo_url)
      `)
      .eq("finalizada", false)
      .order("data_partida", { ascending: true })
      .limit(3);

    if (data) setProximasPartidas(data as any);
  };

  const fetchUltimosResultados = async () => {
    const { data } = await supabase
      .from("partidas")
      .select(`
        *,
        equipe_a:equipe_a_id(nome, logo_url),
        equipe_b:equipe_b_id(nome, logo_url)
      `)
      .eq("finalizada", true)
      .order("data_partida", { ascending: false })
      .limit(3);

    if (data) setUltimosResultados(data as any);
  };

  const fetchRankings = async () => {
    const { data } = await supabase
      .from("rankings")
      .select(`
        *,
        equipes:equipe_id(nome, logo_url)
      `)
      .order("pontos", { ascending: false })
      .limit(5);

    if (data) setRankings(data as any);
  };

  const noticias = [
    {
      id: 1,
      titulo: "Palmeiras vence clássico e lidera tabela",
      resumo: "Com gol nos acréscimos, Palmeiras vence São Paulo e assume liderança isolada do campeonato.",
      data: "2025-01-20",
      imagem: heroImage,
    },
    {
      id: 2,
      titulo: "Jovem promessa marca 3 gols em partida histórica",
      resumo: "Atacante de 16 anos faz hat-trick e entra para história do torneio.",
      data: "2025-01-19",
      imagem: heroImage,
    },
    {
      id: 3,
      titulo: "Semifinais definidas após rodada emocionante",
      resumo: "Últimas vagas para semifinal são decididas nos pênaltis.",
      data: "2025-01-18",
      imagem: heroImage,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sports Arena
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#partidas" className="text-sm font-medium hover:text-primary transition-colors">
              Partidas
            </a>
            <a href="#resultados" className="text-sm font-medium hover:text-primary transition-colors">
              Resultados
            </a>
            <a href="#rankings" className="text-sm font-medium hover:text-primary transition-colors">
              Rankings
            </a>
            <a href="#noticias" className="text-sm font-medium hover:text-primary transition-colors">
              Notícias
            </a>
            <a href="#patrocinadores" className="text-sm font-medium hover:text-primary transition-colors">
              Patrocinadores
            </a>
          </nav>
          <Link to="/dashboard">
            <Button size="sm" className="bg-gradient-primary">
              Área Administrativa
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <Badge className="bg-secondary text-white">AO VIVO</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              A Emoção do Esporte em Tempo Real
            </h1>
            <p className="text-xl text-gray-200">
              Acompanhe todos os jogos, resultados e estatísticas dos melhores campeonatos juvenis.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-gradient-primary">
                <Calendar className="mr-2 h-5 w-5" />
                Ver Programação
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                <TrendingUp className="mr-2 h-5 w-5" />
                Rankings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Próximas Partidas */}
      <section id="partidas" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Próximas Partidas</h2>
              <p className="text-muted-foreground">Não perca os jogos desta semana</p>
            </div>
            <Link to="/partidas">
              <Button variant="outline">
                Ver Todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {proximasPartidas.map((partida) => (
              <Card key={partida.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(partida.data_partida).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge variant="outline">{partida.fase}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <p className="font-semibold">{partida.equipe_a.nome}</p>
                    </div>
                    <div className="px-4 text-2xl font-bold text-muted-foreground">VS</div>
                    <div className="flex-1 text-center">
                      <p className="font-semibold">{partida.equipe_b.nome}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm text-muted-foreground text-center">
                    {partida.local}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Últimos Resultados */}
      <section id="resultados" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Últimos Resultados</h2>
              <p className="text-muted-foreground">Confira como foram os jogos recentes</p>
            </div>
            <Link to="/partidas">
              <Button variant="outline">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ultimosResultados.map((partida) => (
              <Card key={partida.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-gradient-secondary" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(partida.data_partida).toLocaleDateString("pt-BR")}</span>
                    <Badge>{partida.fase}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1 text-center space-y-2">
                      <p className="font-semibold">{partida.equipe_a.nome}</p>
                      <p className="text-3xl font-bold text-primary">{partida.placar_a}</p>
                    </div>
                    <div className="px-4 text-xl font-bold text-muted-foreground">×</div>
                    <div className="flex-1 text-center space-y-2">
                      <p className="font-semibold">{partida.equipe_b.nome}</p>
                      <p className="text-3xl font-bold text-primary">{partida.placar_b}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm text-muted-foreground text-center">
                    {partida.local}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section id="rankings" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Classificação</h2>
              <p className="text-muted-foreground">Acompanhe a tabela do campeonato</p>
            </div>
            <Link to="/rankings">
              <Button variant="outline">
                Ver Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Equipe</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">PTS</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">V</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">E</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">D</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">GP</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">GC</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">SG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rankings.map((rank, index) => (
                      <tr key={rank.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold">{rank.equipes?.nome}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">{rank.pontos}</td>
                        <td className="px-6 py-4 text-center">{rank.vitorias}</td>
                        <td className="px-6 py-4 text-center">{rank.empates}</td>
                        <td className="px-6 py-4 text-center">{rank.derrotas}</td>
                        <td className="px-6 py-4 text-center">{rank.gols_pro}</td>
                        <td className="px-6 py-4 text-center">{rank.gols_contra}</td>
                        <td className="px-6 py-4 text-center font-semibold">
                          {rank.gols_pro - rank.gols_contra}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Notícias */}
      <section id="noticias" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Últimas Notícias</h2>
              <p className="text-muted-foreground">Fique por dentro de tudo que acontece</p>
            </div>
            <Button variant="outline">
              <Newspaper className="mr-2 h-4 w-4" />
              Ver Todas
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <Card key={noticia.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={noticia.imagem}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-secondary">
                    {new Date(noticia.data).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {noticia.titulo}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{noticia.resumo}</p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Ler mais <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Patrocinadores */}
      <section id="patrocinadores" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Nossos Patrocinadores</h2>
            <p className="text-muted-foreground">Empresas que apoiam o esporte de base</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[sponsor1, sponsor2, sponsor3, sponsor1, sponsor2, sponsor3].map((sponsor, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-background rounded-lg hover:shadow-md transition-shadow grayscale hover:grayscale-0"
              >
                <img src={sponsor} alt={`Patrocinador ${index + 1}`} className="h-12 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Sports Arena</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O melhor portal de esportes juvenis do Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#partidas" className="hover:text-primary transition-colors">Partidas</a></li>
                <li><a href="#resultados" className="hover:text-primary transition-colors">Resultados</a></li>
                <li><a href="#rankings" className="hover:text-primary transition-colors">Rankings</a></li>
                <li><a href="#noticias" className="hover:text-primary transition-colors">Notícias</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Competições</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Copa São Paulo</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Campeonato Paulista</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Torneio Regional</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@sportsarena.com.br</li>
                <li>(11) 98765-4321</li>
                <li>São Paulo - SP</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Sports Arena. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

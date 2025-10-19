import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Users2, Trophy } from "lucide-react";
import PlacarTempoReal from "@/components/PlacarTempoReal";

export default function Dashboard() {
  const [stats, setStats] = useState({
    eventos: 0,
    atletas: 0,
    equipes: 0,
    partidas: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [eventos, atletas, equipes, partidas] = await Promise.all([
        supabase.from("eventos").select("id", { count: "exact", head: true }),
        supabase.from("atletas").select("id", { count: "exact", head: true }),
        supabase.from("equipes").select("id", { count: "exact", head: true }),
        supabase.from("partidas").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        eventos: eventos.count || 0,
        atletas: atletas.count || 0,
        equipes: equipes.count || 0,
        partidas: partidas.count || 0,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Eventos Ativos",
      value: stats.eventos,
      icon: Calendar,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Atletas Cadastrados",
      value: stats.atletas,
      icon: Users,
      gradient: "from-secondary to-secondary/80",
    },
    {
      title: "Equipes",
      value: stats.equipes,
      icon: Users2,
      gradient: "from-accent to-accent/80",
    },
    {
      title: "Partidas",
      value: stats.partidas,
      icon: Trophy,
      gradient: "from-info to-info/80",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gerenciamento esportivo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card
            key={card.title}
            className="overflow-hidden transition-all hover:shadow-lg animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlacarTempoReal />

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao SportManager! 🏆</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Este é seu painel de controle para gerenciar eventos esportivos. Aqui você pode:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Criar e gerenciar eventos esportivos de diferentes modalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span>Cadastrar atletas e montar equipes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Organizar partidas e registrar resultados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-info font-bold">•</span>
                <span>Acompanhar rankings e estatísticas em tempo real</span>
              </li>
            </ul>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Novo:
                </span>{" "}
                Rankings são atualizados automaticamente após cada partida finalizada!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

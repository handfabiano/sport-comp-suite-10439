import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function PopularBanco() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const popularBanco = async () => {
    setLoading(true);
    setLogs([]);
    setSucesso(false);
    setErro(false);

    try {
      addLog("🚀 Iniciando povoamento do banco de dados...");

      // =====================================================
      // 1. CRIAR ORGANIZADOR
      // =====================================================
      addLog("\n👤 Criando organizador Carlos Mendes...");

      const { data: orgData, error: orgError } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: "carlos.mendes@eventos.com",
          password: "senha123",
          nome: "Carlos Mendes",
          role: "organizador"
        }
      });

      if (orgError && !orgError.message?.includes("already")) {
        throw new Error(`Erro ao criar organizador: ${orgError.message}`);
      }

      const organizadorId = orgData?.user?.id;
      addLog("✅ Organizador criado!");

      // =====================================================
      // 2. CRIAR EVENTO
      // =====================================================
      addLog("\n🏆 Criando competição Copa Regional de Futebol 2025...");

      const { data: evento, error: eventoError } = await supabase
        .from("eventos")
        .insert({
          nome: "Copa Regional de Futebol 2025",
          descricao: "Campeonato regional de futebol com participação de equipes de diversas cidades. Categorias sub-17 e sub-19.",
          local: "Estádio Municipal de São Paulo",
          data_inicio: "2025-03-15",
          data_fim: "2025-04-30",
          status: "inscricoes_abertas",
          organizador_id: organizadorId,
          modalidade: "Futebol",
          tipo_competicao: "Eliminação Simples"
        })
        .select()
        .single();

      if (eventoError) throw new Error(`Erro ao criar evento: ${eventoError.message}`);
      addLog("✅ Competição criada!");

      // =====================================================
      // 3. CRIAR RESPONSÁVEIS E EQUIPES
      // =====================================================
      const responsaveis = [
        { nome: "Ana Silva", email: "ana.silva@equipes.com", equipe: "Tigres FC", cidade: "São Paulo", estado: "SP" },
        { nome: "Bruno Santos", email: "bruno.santos@equipes.com", equipe: "Águias United", cidade: "Rio de Janeiro", estado: "RJ" },
        { nome: "Carla Oliveira", email: "carla.oliveira@equipes.com", equipe: "Leões do Sul", cidade: "Curitiba", estado: "PR" },
        { nome: "Diego Costa", email: "diego.costa@equipes.com", equipe: "Falcões FC", cidade: "Campinas", estado: "SP" },
        { nome: "Eduardo Lima", email: "eduardo.lima@equipes.com", equipe: "Panteras Negras", cidade: "Santos", estado: "SP" },
        { nome: "Fernanda Rocha", email: "fernanda.rocha@equipes.com", equipe: "Tubarões Azuis", cidade: "Niterói", estado: "RJ" },
        { nome: "Gabriel Martins", email: "gabriel.martins@equipes.com", equipe: "Lobos da Serra", cidade: "Petrópolis", estado: "RJ" },
        { nome: "Helena Alves", email: "helena.alves@equipes.com", equipe: "Dragões Vermelhos", cidade: "Sorocaba", estado: "SP" }
      ];

      addLog("\n👥 Criando 8 responsáveis e equipes...");

      const equipes = [];

      for (let i = 0; i < responsaveis.length; i++) {
        const resp = responsaveis[i];
        addLog(`  ${i + 1}. ${resp.nome} → ${resp.equipe}`);

        // Criar responsável
        const { data: respData, error: respError } = await supabase.functions.invoke("admin-create-user", {
          body: {
            email: resp.email,
            password: "senha123",
            nome: resp.nome,
            role: "responsavel"
          }
        });

        if (respError && !respError.message?.includes("already")) {
          addLog(`    ⚠️ Aviso: ${respError.message}`);
          continue;
        }

        const userId = respData?.user?.id;

        // Criar registro na tabela responsaveis
        await supabase.from("responsaveis").upsert({
          user_id: userId,
          nome: resp.nome,
          email: resp.email,
          telefone: `(11) 9876-${5432 + i}`
        });

        // Criar equipe
        const { data: equipe, error: equipeError } = await supabase
          .from("equipes")
          .insert({
            nome: resp.equipe,
            cidade: resp.cidade,
            estado: resp.estado,
            descricao: `Equipe de ${resp.cidade}`,
            responsavel_id: userId,
            evento_id: evento.id
          })
          .select()
          .single();

        if (equipeError) {
          addLog(`    ⚠️ Erro ao criar equipe: ${equipeError.message}`);
          continue;
        }

        equipes.push({ ...equipe, responsavel_id: userId });
        addLog(`    ✅ Criado!`);
      }

      addLog(`\n✅ ${equipes.length} equipes criadas!`);

      // =====================================================
      // 4. CRIAR ATLETAS
      // =====================================================
      addLog("\n⚽ Criando 48 atletas (6 por equipe)...");

      const nomes = [
        ["João Pedro Silva", "Gabriel Santos", "Lucas Oliveira", "Rafael Costa", "Matheus Lima", "Pedro Henrique"],
        ["Vinicius Souza", "Bruno Fernandes", "Rodrigo Alves", "Felipe Ribeiro", "André Mendes", "Thiago Martins"],
        ["Diego Rocha", "Gustavo Pinto", "Marcelo Silva", "Eduardo Santos", "Fernando Costa", "Leonardo Lima"],
        ["Julio César", "Igor Souza", "Daniel Oliveira", "Carlos Eduardo", "Renato Alves", "Paulo Henrique"],
        ["Alexandre Silva", "Renan Costa", "Fabio Santos", "Henrique Lima", "Ricardo Alves", "Sergio Oliveira"],
        ["Márcio Rocha", "Wesley Pinto", "Hugo Silva", "Caio Santos", "Vitor Costa", "Samuel Lima"],
        ["Arthur Mendes", "Nicolas Alves", "Bernardo Oliveira", "Miguel Santos", "Davi Costa", "Enzo Lima"],
        ["Lorenzo Rocha", "Heitor Pinto", "Theo Silva", "Murilo Santos", "Pietro Costa", "Benicio Lima"]
      ];

      const datas = ["2007-03-15", "2008-07-22", "2007-11-08", "2008-01-30", "2007-05-17", "2008-09-12"];

      let totalAtletas = 0;

      for (let e = 0; e < equipes.length; e++) {
        const equipe = equipes[e];
        addLog(`  Equipe ${e + 1}: ${equipe.nome}`);

        for (let a = 0; a < 6; a++) {
          const ano = parseInt(datas[a].split("-")[0]);
          const idade = 2025 - ano;
          const categoria = idade <= 17 ? "Sub-17" : "Sub-19";

          const { data: atleta, error: atletaError } = await supabase
            .from("atletas")
            .insert({
              nome: nomes[e][a],
              data_nascimento: datas[a],
              sexo: "masculino",
              categoria: categoria,
              documento: `${100 + e}${200 + a}.${300}.${400}-${a}${e}`,
              user_id: equipe.responsavel_id
            })
            .select()
            .single();

          if (atletaError) {
            addLog(`    ⚠️ Erro: ${atletaError.message}`);
            continue;
          }

          await supabase.from("equipe_atletas").insert({
            equipe_id: equipe.id,
            atleta_id: atleta.id
          });

          totalAtletas++;
        }
        addLog(`    ✅ 6 atletas criados`);
      }

      addLog(`\n✅ ${totalAtletas} atletas criados!`);

      // =====================================================
      // 5. CRIAR INSCRIÇÕES
      // =====================================================
      addLog("\n📝 Criando inscrições...");

      for (const equipe of equipes) {
        await supabase.from("inscricoes").insert({
          equipe_id: equipe.id,
          evento_id: evento.id,
          status: "pendente"
        });
      }

      addLog(`✅ ${equipes.length} inscrições criadas!`);

      // =====================================================
      // RESUMO
      // =====================================================
      addLog("\n" + "=".repeat(50));
      addLog("🎉 POVOAMENTO CONCLUÍDO COM SUCESSO!");
      addLog("=".repeat(50));
      addLog("\n📊 DADOS CRIADOS:");
      addLog("  ✅ 1 Organizador");
      addLog("  ✅ 8 Responsáveis");
      addLog("  ✅ 1 Competição");
      addLog("  ✅ 8 Equipes");
      addLog(`  ✅ ${totalAtletas} Atletas`);
      addLog("  ✅ 8 Inscrições");

      addLog("\n🔐 CREDENCIAIS:");
      addLog("  Organizador: carlos.mendes@eventos.com / senha123");
      addLog("  Responsáveis: todos com senha123");

      setSucesso(true);
      toast.success("Banco populado com sucesso!");

    } catch (error: any) {
      addLog(`\n❌ ERRO: ${error.message}`);
      setErro(true);
      toast.error("Erro ao popular banco: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6" />
            Popular Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este recurso vai criar dados de teste no banco:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>1 Organizador (Carlos Mendes)</li>
                <li>8 Responsáveis com suas equipes</li>
                <li>1 Competição (Copa Regional 2025)</li>
                <li>48 Atletas (6 por equipe)</li>
                <li>8 Inscrições pendentes</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={popularBanco}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Populando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Popular Banco de Dados
                </>
              )}
            </Button>
          </div>

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {sucesso && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {erro && <XCircle className="h-4 w-4 text-red-500" />}
                  Log de Execução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {logs.join("\n")}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {sucesso && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <strong>Sucesso!</strong> Agora você pode:
                <ul className="list-disc list-inside mt-2">
                  <li>Fazer login como organizador: carlos.mendes@eventos.com / senha123</li>
                  <li>Fazer login como responsável: ana.silva@equipes.com / senha123</li>
                  <li>Testar todo o fluxo do sistema!</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

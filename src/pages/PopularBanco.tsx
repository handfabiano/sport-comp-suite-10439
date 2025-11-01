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

  const criarUsuario = async (email: string, senha: string, nome: string, role: string) => {
    try {
      // Criar usuário com signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Usuário não foi criado");

      const userId = data.user.id;

      // Criar profile (ignorar se já existe)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        nome,
        email
      });
      if (profileError && !profileError.message?.includes('duplicate')) {
        console.error('Erro ao criar profile:', profileError);
      }

      // Criar role (ignorar se já existe)
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role
      });
      if (roleError && !roleError.message?.includes('duplicate')) {
        console.error('Erro ao criar role:', roleError);
      }

      return userId;
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        // Usuário já existe, buscar ID
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        return data?.id;
      }
      throw error;
    }
  };

  const popularBanco = async () => {
    setLoading(true);
    setLogs([]);
    setSucesso(false);
    setErro(false);

    // Salvar sessão atual
    const { data: { session: sessaoOriginal } } = await supabase.auth.getSession();

    try {
      addLog("🚀 Iniciando povoamento do banco de dados...");

      // =====================================================
      // 1. CRIAR ORGANIZADOR
      // =====================================================
      addLog("\n👤 Criando organizador Carlos Mendes...");

      const organizadorId = await criarUsuario(
        "carlos.mendes@eventos.com",
        "senha123",
        "Carlos Mendes",
        "organizador"
      );

      addLog("✅ Organizador criado!");

      // =====================================================
      // 2. FAZER LOGIN COMO ORGANIZADOR (para criar evento)
      // =====================================================
      addLog("\n🔐 Fazendo login como organizador...");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: "carlos.mendes@eventos.com",
        password: "senha123"
      });

      if (loginError) {
        throw new Error(`Erro ao fazer login como organizador: ${loginError.message}`);
      }

      addLog("✅ Login realizado!");

      // =====================================================
      // 3. CRIAR EVENTO
      // =====================================================
      addLog("\n🏆 Criando competição Copa Regional de Futebol 2025...");

      // Tentar criar o evento ou buscar se já existe
      let evento;
      let eventoId;

      const { data: eventoExistente } = await supabase
        .from("eventos")
        .select()
        .eq("nome", "Copa Regional de Futebol 2025")
        .single();

      if (eventoExistente) {
        evento = eventoExistente;
        eventoId = eventoExistente.id;
        addLog("  ℹ️ Evento já existe, usando evento existente");
      } else {
        const { data: novoEvento, error: eventoError } = await supabase
          .from("eventos")
          .insert({
            nome: "Copa Regional de Futebol 2025",
            descricao: "Campeonato regional de futebol com participação de equipes de diversas cidades. Categorias sub-17 e sub-19.",
            local: "Estádio Municipal de São Paulo",
            data_inicio: "2025-03-15",
            data_fim: "2025-04-30",
            status: "inscricoes_abertas",
            organizador_id: organizadorId,
            modalidade: "futebol",
            tipo_competicao: "Eliminação Simples"
          })
          .select()
          .single();

        if (eventoError) {
          throw new Error(`Erro ao criar evento: ${eventoError.message}`);
        }

        evento = novoEvento;
        eventoId = novoEvento.id;
      }

      addLog("✅ Competição criada!");

      // =====================================================
      // 4. CRIAR RESPONSÁVEIS E EQUIPES
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
        const userId = await criarUsuario(
          resp.email,
          "senha123",
          resp.nome,
          "responsavel"
        );

        // Criar registro na tabela responsaveis
        const { error: respError } = await supabase.from("responsaveis").insert({
          user_id: userId,
          nome: resp.nome,
          email: resp.email,
          telefone: `(11) 9876-${5432 + i}`
        });

        // Ignorar erro de duplicado
        if (respError && !respError.message?.includes('duplicate')) {
          throw respError;
        }

        // Criar equipe ou buscar se já existe
        let equipe;
        const { data: equipeExistente } = await supabase
          .from("equipes")
          .select()
          .eq("nome", resp.equipe)
          .single();

        if (equipeExistente) {
          equipe = equipeExistente;
        } else {
          const { data: novaEquipe, error: equipeError } = await supabase
            .from("equipes")
            .insert({
              nome: resp.equipe,
              cidade: resp.cidade,
              estado: resp.estado,
              descricao: `Equipe de ${resp.cidade}`,
              responsavel_id: userId,
              evento_id: eventoId
            })
            .select()
            .single();

          if (equipeError) {
            addLog(`    ⚠️ Erro ao criar equipe: ${equipeError.message}`);
            continue;
          }
          equipe = novaEquipe;
        }

        equipes.push({ ...equipe, responsavel_id: userId });
        addLog(`    ✅ Criado!`);
      }

      addLog(`\n✅ ${equipes.length} equipes criadas!`);

      // =====================================================
      // 5. CRIAR ATLETAS
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
            if (!atletaError.message?.includes('duplicate')) {
              addLog(`    ⚠️ Erro: ${atletaError.message}`);
            }
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
      // 6. CRIAR INSCRIÇÕES
      // =====================================================
      addLog("\n📝 Criando inscrições...");

      for (const equipe of equipes) {
        // Verificar se já existe
        const { data: inscricaoExistente } = await supabase
          .from("inscricoes")
          .select()
          .eq("equipe_id", equipe.id)
          .eq("evento_id", eventoId)
          .single();

        if (!inscricaoExistente) {
          await supabase.from("inscricoes").insert({
            equipe_id: equipe.id,
            evento_id: eventoId,
            status: "pendente"
          });
        }
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

      addLog("\n📧 IMPORTANTE:");
      addLog("  Verifique o email de confirmação dos usuários!");
      addLog("  (Se necessário, confirme os emails manualmente no Supabase)");

      setSucesso(true);
      toast.success("Banco populado com sucesso!");

    } catch (error: any) {
      addLog(`\n❌ ERRO: ${error.message}`);
      setErro(true);
      toast.error("Erro ao popular banco: " + error.message);
    } finally {
      // Restaurar sessão original
      if (sessaoOriginal) {
        await supabase.auth.setSession(sessaoOriginal);
      }
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
              <p className="mt-2 text-sm font-semibold">
                ⚠️ Pode levar 1-2 minutos para completar
              </p>
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
                  Populando... Aguarde
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
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                  <li>Ir em "Painel Organizador" → "Inscrições" e aprovar as 8 equipes</li>
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

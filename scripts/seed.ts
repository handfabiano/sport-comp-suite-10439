import { createClient } from '@supabase/supabase-js';

// Você precisa pegar essas credenciais no Lovable/Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('\n📋 Você precisa:');
  console.log('1. Criar arquivo .env.local na raiz do projeto');
  console.log('2. Adicionar as variáveis (veja instruções no COMO_POPULAR.md)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Iniciando povoamento do banco de dados...\n');

async function popularBanco() {
  try {
    // =====================================================
    // 1. CRIAR ORGANIZADOR
    // =====================================================
    console.log('👤 Criando organizador...');

    const { data: organizador, error: orgError } = await supabase.auth.admin.createUser({
      email: 'carlos.mendes@eventos.com',
      password: 'senha123',
      email_confirm: true,
      user_metadata: {
        nome: 'Carlos Mendes'
      }
    });

    if (orgError && orgError.message !== 'User already registered') {
      throw orgError;
    }

    const organizadorId = organizador?.user?.id;
    console.log('✅ Organizador criado!');

    // Criar profile e role do organizador
    if (organizadorId) {
      await supabase.from('profiles').upsert({
        id: organizadorId,
        nome: 'Carlos Mendes',
        email: 'carlos.mendes@eventos.com'
      });

      await supabase.from('user_roles').upsert({
        user_id: organizadorId,
        role: 'organizador'
      });
    }

    // =====================================================
    // 2. CRIAR EVENTO
    // =====================================================
    console.log('\n🏆 Criando competição...');

    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .insert({
        nome: 'Copa Regional de Futebol 2025',
        descricao: 'Campeonato regional de futebol com participação de equipes de diversas cidades. Categorias sub-17 e sub-19.',
        local: 'Estádio Municipal de São Paulo',
        data_inicio: '2025-03-15',
        data_fim: '2025-04-30',
        status: 'inscricoes_abertas',
        organizador_id: organizadorId,
        modalidade: 'Futebol',
        tipo_competicao: 'Eliminação Simples'
      })
      .select()
      .single();

    if (eventoError) throw eventoError;
    console.log('✅ Competição criada: Copa Regional de Futebol 2025');

    // =====================================================
    // 3. CRIAR RESPONSÁVEIS E EQUIPES
    // =====================================================
    const responsaveis = [
      { nome: 'Ana Silva', email: 'ana.silva@equipes.com', equipe: 'Tigres FC', cidade: 'São Paulo', estado: 'SP', descricao: 'Equipe tradicional de São Paulo com foco em formação de base' },
      { nome: 'Bruno Santos', email: 'bruno.santos@equipes.com', equipe: 'Águias United', cidade: 'Rio de Janeiro', estado: 'RJ', descricao: 'Time carioca conhecido pela garra e determinação' },
      { nome: 'Carla Oliveira', email: 'carla.oliveira@equipes.com', equipe: 'Leões do Sul', cidade: 'Curitiba', estado: 'PR', descricao: 'Representantes do sul com tradição vitoriosa' },
      { nome: 'Diego Costa', email: 'diego.costa@equipes.com', equipe: 'Falcões FC', cidade: 'Campinas', estado: 'SP', descricao: 'Equipe jovem e promissora do interior paulista' },
      { nome: 'Eduardo Lima', email: 'eduardo.lima@equipes.com', equipe: 'Panteras Negras', cidade: 'Santos', estado: 'SP', descricao: 'Time da baixada santista com estilo ofensivo' },
      { nome: 'Fernanda Rocha', email: 'fernanda.rocha@equipes.com', equipe: 'Tubarões Azuis', cidade: 'Niterói', estado: 'RJ', descricao: 'Equipe fluminense com tradição em categorias de base' },
      { nome: 'Gabriel Martins', email: 'gabriel.martins@equipes.com', equipe: 'Lobos da Serra', cidade: 'Petrópolis', estado: 'RJ', descricao: 'Time serrano conhecido pela resistência física' },
      { nome: 'Helena Alves', email: 'helena.alves@equipes.com', equipe: 'Dragões Vermelhos', cidade: 'Sorocaba', estado: 'SP', descricao: 'Equipe combativa do interior com grande torcida' }
    ];

    console.log('\n👥 Criando 8 responsáveis e equipes...');

    const equipes = [];

    for (let i = 0; i < responsaveis.length; i++) {
      const resp = responsaveis[i];
      console.log(`\n  ${i + 1}. ${resp.nome} → ${resp.equipe}`);

      // Criar usuário responsável
      const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: resp.email,
        password: 'senha123',
        email_confirm: true,
        user_metadata: {
          nome: resp.nome
        }
      });

      if (userError && userError.message !== 'User already registered') {
        console.error(`   ❌ Erro ao criar ${resp.nome}:`, userError.message);
        continue;
      }

      const userId = user?.user?.id;

      if (!userId) {
        console.error(`   ❌ Não foi possível obter ID do usuário ${resp.nome}`);
        continue;
      }

      // Criar profile
      await supabase.from('profiles').upsert({
        id: userId,
        nome: resp.nome,
        email: resp.email
      });

      // Criar role
      await supabase.from('user_roles').upsert({
        user_id: userId,
        role: 'responsavel'
      });

      // Criar registro na tabela responsaveis
      await supabase.from('responsaveis').upsert({
        user_id: userId,
        nome: resp.nome,
        email: resp.email,
        telefone: `(11) 9876-${5432 + i}`
      });

      // Criar equipe
      const { data: equipe, error: equipeError } = await supabase
        .from('equipes')
        .insert({
          nome: resp.equipe,
          cidade: resp.cidade,
          estado: resp.estado,
          descricao: resp.descricao,
          responsavel_id: userId,
          evento_id: evento.id
        })
        .select()
        .single();

      if (equipeError) {
        console.error(`   ❌ Erro ao criar equipe ${resp.equipe}:`, equipeError.message);
        continue;
      }

      equipes.push({ ...equipe, responsavel_id: userId });
      console.log(`   ✅ ${resp.nome} e ${resp.equipe} criados!`);
    }

    console.log(`\n✅ ${equipes.length} equipes criadas com sucesso!`);

    // =====================================================
    // 4. CRIAR ATLETAS
    // =====================================================
    console.log('\n⚽ Criando 48 atletas (6 por equipe)...');

    const nomes = [
      ['João Pedro Silva', 'Gabriel dos Santos', 'Lucas Oliveira', 'Rafael Costa', 'Matheus Lima', 'Pedro Henrique'],
      ['Vinicius Souza', 'Bruno Fernandes', 'Rodrigo Alves', 'Felipe Ribeiro', 'André Mendes', 'Thiago Martins'],
      ['Diego Rocha', 'Gustavo Pinto', 'Marcelo Silva', 'Eduardo Santos', 'Fernando Costa', 'Leonardo Lima'],
      ['Julio César', 'Igor Souza', 'Daniel Oliveira', 'Carlos Eduardo', 'Renato Alves', 'Paulo Henrique'],
      ['Alexandre Silva', 'Renan Costa', 'Fabio Santos', 'Henrique Lima', 'Ricardo Alves', 'Sergio Oliveira'],
      ['Márcio Rocha', 'Wesley Pinto', 'Hugo Silva', 'Caio Santos', 'Vitor Costa', 'Samuel Lima'],
      ['Arthur Mendes', 'Nicolas Alves', 'Bernardo Oliveira', 'Miguel Santos', 'Davi Costa', 'Enzo Lima'],
      ['Lorenzo Rocha', 'Heitor Pinto', 'Theo Silva', 'Murilo Santos', 'Pietro Costa', 'Benicio Lima']
    ];

    const datasNascimento = [
      ['2007-03-15', '2008-07-22', '2007-11-08', '2008-01-30', '2007-05-17', '2008-09-12'],
      ['2007-04-20', '2008-06-15', '2007-12-03', '2008-02-28', '2007-08-09', '2008-10-25'],
      ['2007-01-14', '2008-05-19', '2007-09-27', '2008-03-11', '2007-07-06', '2008-11-22'],
      ['2007-02-18', '2008-06-23', '2007-10-30', '2008-04-14', '2007-08-08', '2008-12-19'],
      ['2007-03-22', '2008-07-27', '2007-11-05', '2008-05-16', '2007-09-10', '2008-01-24'],
      ['2007-04-26', '2008-08-31', '2007-12-09', '2008-06-20', '2007-10-14', '2008-02-28'],
      ['2007-05-30', '2008-09-05', '2007-01-13', '2008-07-24', '2007-11-18', '2008-03-02'],
      ['2007-06-03', '2008-10-09', '2007-02-17', '2008-08-28', '2007-12-22', '2008-04-06']
    ];

    let totalAtletas = 0;

    for (let e = 0; e < equipes.length; e++) {
      const equipe = equipes[e];
      console.log(`\n  Equipe ${e + 1}: ${equipe.nome}`);

      for (let a = 0; a < 6; a++) {
        const idade = new Date().getFullYear() - parseInt(datasNascimento[e][a].split('-')[0]);
        const categoria = idade <= 17 ? 'Sub-17' : 'Sub-19';

        // Criar atleta
        const { data: atleta, error: atletaError } = await supabase
          .from('atletas')
          .insert({
            nome: nomes[e][a],
            data_nascimento: datasNascimento[e][a],
            sexo: 'masculino',
            categoria: categoria,
            documento: `${100 + e}${200 + a}.${300 + a}.${400 + a}-${a}${e}`,
            user_id: equipe.responsavel_id
          })
          .select()
          .single();

        if (atletaError) {
          console.error(`    ❌ Erro ao criar atleta ${nomes[e][a]}:`, atletaError.message);
          continue;
        }

        // Vincular atleta à equipe
        await supabase.from('equipe_atletas').insert({
          equipe_id: equipe.id,
          atleta_id: atleta.id
        });

        totalAtletas++;
        console.log(`    ✅ ${nomes[e][a]} (${categoria})`);
      }
    }

    console.log(`\n✅ ${totalAtletas} atletas criados e vinculados às equipes!`);

    // =====================================================
    // 5. CRIAR INSCRIÇÕES
    // =====================================================
    console.log('\n📝 Criando inscrições...');

    for (const equipe of equipes) {
      await supabase.from('inscricoes').insert({
        equipe_id: equipe.id,
        evento_id: evento.id,
        status: 'pendente'
      });
    }

    console.log(`✅ ${equipes.length} inscrições criadas (status: pendente)!`);

    // =====================================================
    // RESUMO
    // =====================================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 POVOAMENTO CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 RESUMO:');
    console.log(`  ✅ 1 Organizador`);
    console.log(`  ✅ 8 Responsáveis`);
    console.log(`  ✅ 1 Competição (Copa Regional de Futebol 2025)`);
    console.log(`  ✅ 8 Equipes`);
    console.log(`  ✅ ${totalAtletas} Atletas`);
    console.log(`  ✅ 8 Inscrições pendentes`);

    console.log('\n🔐 CREDENCIAIS DE ACESSO:');
    console.log('\n  ORGANIZADOR:');
    console.log('    Email: carlos.mendes@eventos.com');
    console.log('    Senha: senha123');

    console.log('\n  RESPONSÁVEIS (todos com senha: senha123):');
    responsaveis.forEach(r => {
      console.log(`    ${r.email.padEnd(30)} → ${r.equipe}`);
    });

    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('  1. Faça login como organizador');
    console.log('  2. Vá em "Painel Organizador" → "Inscrições Recebidas"');
    console.log('  3. Aprove as 8 inscrições pendentes');
    console.log('  4. Teste como responsável!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO durante o povoamento:', error);
    process.exit(1);
  }
}

// Executar
popularBanco()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

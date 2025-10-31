# 🚀 Como Popular o Banco de Dados

Como você está usando Lovable com Supabase integrado, siga esses passos para popular o banco com dados de teste.

---

## 📋 Passo 1: Pegar as Credenciais do Supabase

### 1.1 Acesse o Dashboard do Supabase

1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto (o que está conectado ao Lovable)

### 1.2 Pegue a URL do Projeto

1. No menu lateral, clique em **"Settings"** (Configurações)
2. Clique em **"API"**
3. Copie a **"Project URL"**
   - Exemplo: `https://abcdefgh.supabase.co`

### 1.3 Pegue a Service Role Key (IMPORTANTE!)

1. Ainda na página **"Settings" → "API"**
2. Role até encontrar **"Project API keys"**
3. Procure por **"service_role"** (NÃO é a "anon" key!)
4. Clique em **"Reveal"** para mostrar a chave
5. Copie a chave completa (é uma string grande começando com `eyJ...`)

⚠️ **IMPORTANTE**: A Service Role Key é SECRETA! Nunca compartilhe ou commite ela no git!

---

## 📋 Passo 2: Configurar as Variáveis de Ambiente

### 2.1 Criar arquivo .env.local

Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
# No terminal, na raiz do projeto:
touch .env.local
```

### 2.2 Adicionar as credenciais

Abra o arquivo `.env.local` e adicione:

```bash
# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Service Role Key (a chave secreta que você copiou)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
```

**Substitua** pelos valores que você copiou do dashboard!

---

## 📋 Passo 3: Instalar Dependências (se necessário)

```bash
npm install
```

Ou se preferir yarn:

```bash
yarn install
```

---

## 📋 Passo 4: Executar o Script de Povoamento

Agora execute o script:

```bash
npm run seed
```

Ou com yarn:

```bash
yarn seed
```

---

## 🎯 O que o Script Faz

O script vai criar automaticamente:

```
✅ 1 Organizador (Carlos Mendes)
✅ 8 Responsáveis de Equipe
✅ 1 Competição (Copa Regional de Futebol 2025)
✅ 8 Equipes (diferentes cidades)
✅ 48 Atletas (6 por equipe)
✅ 8 Inscrições (todas pendentes)
```

---

## 📊 Progresso Durante a Execução

Você verá algo assim:

```
🚀 Iniciando povoamento do banco de dados...

👤 Criando organizador...
✅ Organizador criado!

🏆 Criando competição...
✅ Competição criada: Copa Regional de Futebol 2025

👥 Criando 8 responsáveis e equipes...

  1. Ana Silva → Tigres FC
   ✅ Ana Silva e Tigres FC criados!

  2. Bruno Santos → Águias United
   ✅ Bruno Santos e Águias United criados!

  ... (continua)

✅ 8 equipes criadas com sucesso!

⚽ Criando 48 atletas (6 por equipe)...

  Equipe 1: Tigres FC
    ✅ João Pedro Silva (Sub-19)
    ✅ Gabriel dos Santos (Sub-17)
    ... (continua)

✅ 48 atletas criados e vinculados às equipes!

📝 Criando inscrições...
✅ 8 inscrições criadas (status: pendente)!

============================================================
🎉 POVOAMENTO CONCLUÍDO COM SUCESSO!
============================================================
```

---

## 🔐 Credenciais de Acesso

Após o povoamento, use essas credenciais para fazer login:

### ORGANIZADOR
```
Email: carlos.mendes@eventos.com
Senha: senha123
```

### RESPONSÁVEIS (todos com senha: senha123)
```
ana.silva@equipes.com        → Tigres FC
bruno.santos@equipes.com     → Águias United
carla.oliveira@equipes.com   → Leões do Sul
diego.costa@equipes.com      → Falcões FC
eduardo.lima@equipes.com     → Panteras Negras
fernanda.rocha@equipes.com   → Tubarões Azuis
gabriel.martins@equipes.com  → Lobos da Serra
helena.alves@equipes.com     → Dragões Vermelhos
```

---

## 🎮 Testando o Sistema

### 1. Como Organizador
```
1. Login: carlos.mendes@eventos.com / senha123
2. Menu: "Painel Organizador"
3. Aba: "Inscrições Recebidas"
4. Você verá: 8 inscrições pendentes
5. Aprove cada uma clicando em "Aprovar"
```

### 2. Como Responsável
```
1. Login: ana.silva@equipes.com / senha123
2. Menu: "Painel Responsável"
3. Aba: "Minha Equipe" → Ver Tigres FC
4. Aba: "Meus Atletas" → Ver 6 jogadores
5. Aba: "Inscrições" → Ver status da inscrição
```

---

## ❓ Problemas Comuns

### "❌ ERRO: Variáveis de ambiente não configuradas!"

**Solução**: Você não criou o arquivo `.env.local` ou não colocou as variáveis corretas.
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Verifique se copiou corretamente a URL e a Service Role Key

### "User already registered"

**Isso é normal!** Se você executar o script novamente, ele vai pular usuários que já existem.

### "Failed to fetch"

**Solução**: Verifique sua conexão com internet e se as credenciais estão corretas.

### Script não encontrado

**Solução**: Execute `npm install` primeiro para instalar as dependências.

---

## 🔄 Executar Novamente

Se quiser limpar tudo e popular novamente:

### Opção 1: Limpar pelo Dashboard

1. Vá no dashboard do Supabase
2. Vá em "Table Editor"
3. Delete os dados das tabelas na ordem:
   - equipe_atletas
   - inscricoes
   - atletas
   - equipes
   - eventos
   - responsaveis
   - user_roles (só as roles: organizador, responsavel)
   - profiles (só os profiles criados pelo script)

### Opção 2: Execute o script novamente

O script usa `upsert` então vai sobrescrever dados existentes.

---

## 📁 Arquivos Importantes

- `scripts/seed.ts` - Script de povoamento
- `.env.local` - Suas credenciais (NÃO commitar!)
- `.env.example` - Exemplo de como deve ser o .env.local
- `DADOS_POVOAMENTO.md` - Documentação completa dos dados

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique se o arquivo `.env.local` existe e tem as credenciais corretas
2. Verifique se instalou as dependências (`npm install`)
3. Verifique se está na raiz do projeto ao executar o comando
4. Veja os erros no console - eles geralmente indicam o problema

---

## ✅ Checklist Final

Antes de executar, certifique-se:

- [ ] Acessou o dashboard do Supabase
- [ ] Copiou a Project URL
- [ ] Copiou a Service Role Key (não a anon key!)
- [ ] Criou o arquivo `.env.local`
- [ ] Adicionou as credenciais no `.env.local`
- [ ] Executou `npm install`
- [ ] Executou `npm run seed`

---

**Pronto! Agora você tem uma competição completa para testar! 🎉**

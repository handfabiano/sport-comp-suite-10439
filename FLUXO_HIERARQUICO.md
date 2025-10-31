# 📊 Fluxo Hierárquico do Sistema

## 🎯 Visão Geral

O sistema agora possui uma **estrutura hierárquica clara** onde cada tipo de usuário tem suas próprias páginas e responsabilidades específicas:

```
┌─────────────────┐
│  ADMINISTRADOR  │ ← Gerencia TODO o sistema
└────────┬────────┘
         │
    ┌────▼────────┐
    │ ORGANIZADOR │ ← Cria eventos e gerencia responsáveis
    └────┬────────┘
         │
    ┌────▼──────────┐
    │ RESPONSÁVEL   │ ← Cria equipe e gerencia atletas
    └────┬──────────┘
         │
    ┌────▼────┐
    │ ATLETA  │ ← Participa das competições
    └─────────┘
```

---

## 👑 1. ADMINISTRADOR

### Acesso
- Página: `/admin`
- Menu: "Administração"

### O que pode fazer
✅ **Gerenciar Usuários** (NOVO!)
- Criar usuários de qualquer tipo
- Editar informações e roles
- Deletar usuários

✅ **Gerenciar Tudo**
- Ver e gerenciar atletas
- Ver e gerenciar responsáveis
- Ver e gerenciar equipes
- Ver e gerenciar competições
- Aprovar/rejeitar inscrições

### Abas no Painel
1. **Usuários** - CRUD completo de usuários
2. **Atletas** - Visualizar todos os atletas
3. **Responsáveis** - Visualizar todos os responsáveis
4. **Equipes** - Visualizar todas as equipes
5. **Competições** - Visualizar todas as competições
6. **Inscrições** - Visualizar todas as inscrições

---

## 🏆 2. ORGANIZADOR

### Acesso
- Página: `/organizador`
- Menu: "Painel Organizador"

### O que pode fazer
✅ **Gerenciar Competições**
- Criar novos eventos esportivos
- Editar eventos existentes
- Definir datas, locais, regras
- Abrir/fechar inscrições

✅ **Gerenciar Responsáveis de Equipe**
- Convidar responsáveis por e-mail
- Criar responsáveis diretamente
- Ver lista de responsáveis

✅ **Aprovar Inscrições**
- Ver inscrições de equipes
- Aprovar ou rejeitar inscrições
- Acompanhar status

### Abas no Painel
1. **Minhas Competições** - CRUD de eventos
2. **Responsáveis de Equipe** - Adicionar e ver responsáveis
3. **Inscrições Recebidas** - Aprovar/rejeitar inscrições

### Fluxo Típico
```
1. Organizador cria uma competição
2. Organizador convida/cria responsáveis
3. Organizador abre inscrições
4. Aguarda inscrições de equipes
5. Aprova ou rejeita cada inscrição
6. Inicia a competição
```

---

## 👥 3. RESPONSÁVEL

### Acesso
- Página: `/responsavel`
- Menu: "Painel Responsável"

### O que pode fazer
✅ **Gerenciar Sua Equipe**
- Criar uma equipe
- Editar informações da equipe
- Definir nome, cidade, estado

✅ **Gerenciar Seus Atletas**
- Adicionar atletas à equipe
- Editar dados dos atletas
- Remover atletas
- Vincular automaticamente à equipe

✅ **Fazer Inscrições**
- Ver competições disponíveis
- Inscrever equipe em competições
- Acompanhar status das inscrições

### Abas no Painel
1. **Minha Equipe** - Criar/editar equipe
2. **Meus Atletas** - CRUD de atletas
3. **Inscrições** - Fazer inscrições e acompanhar status

### Fluxo Típico
```
1. Responsável cria sua equipe
2. Responsável adiciona atletas
3. Responsável vê competições disponíveis
4. Responsável inscreve a equipe
5. Aguarda aprovação do organizador
6. Participa da competição
```

---

## 🏃 4. ATLETA

### Acesso
- Visualiza suas próprias informações
- Vê eventos em que está inscrito

### O que pode fazer
✅ Ver seus dados
✅ Ver equipe que pertence
✅ Ver competições que vai participar

---

## 📋 Fluxo Completo Passo a Passo

### Cenário: Criar uma Competição de Futebol

#### Passo 1: Admin cria o Organizador
```
Admin → Painel Admin → Usuários → Criar Usuário
  Nome: Carlos Organizador
  Email: carlos@eventos.com
  Senha: senha123
  Tipo: Organizador
```

#### Passo 2: Organizador cria a Competição
```
Carlos faz login → Painel Organizador → Minhas Competições → Criar
  Nome: Copa Municipal de Futebol 2025
  Local: Estádio Municipal
  Data Início: 01/03/2025
  Data Fim: 30/03/2025
  Status: Inscrições Abertas
```

#### Passo 3: Organizador adiciona Responsáveis
```
Carlos → Painel Organizador → Responsáveis de Equipe → Adicionar

Responsável 1:
  Nome: Ana Silva
  Email: ana@time.com

Responsável 2:
  Nome: Pedro Santos
  Email: pedro@time.com
```

#### Passo 4: Responsável 1 cria Equipe
```
Ana faz login → Painel Responsável → Minha Equipe → Criar
  Nome: Tigres FC
  Cidade: São Paulo
  Estado: SP
```

#### Passo 5: Responsável 1 adiciona Atletas
```
Ana → Meus Atletas → Adicionar Atleta (repetir para cada)

Atleta 1:
  Nome: João Silva
  Data Nascimento: 15/05/2005
  Sexo: Masculino
  Categoria: Sub-19

Atleta 2:
  Nome: Maria Costa
  Data Nascimento: 20/08/2006
  Sexo: Feminino
  Categoria: Sub-18
```

#### Passo 6: Responsável faz Inscrição
```
Ana → Inscrições → Competições Disponíveis
  Vê: Copa Municipal de Futebol 2025
  Clica: Inscrever
  Status: Pendente
```

#### Passo 7: Organizador aprova Inscrição
```
Carlos → Inscrições Recebidas
  Vê: Tigres FC - Ana Silva - Pendente
  Clica: Aprovar
  Status: Aprovada ✅
```

#### Passo 8: Responsável vê aprovação
```
Ana → Inscrições → Minhas Inscrições
  Vê: Copa Municipal - Aprovada ✅
```

---

## 🎨 Navegação no Menu

### Admin vê:
- Dashboard
- **Administração**
- Painel Organizador (também tem acesso)
- Eventos
- Atletas
- Equipes
- Partidas
- Rankings
- Responsáveis

### Organizador vê:
- Dashboard
- **Painel Organizador** ← Sua página principal
- Eventos
- Atletas
- Equipes
- Partidas
- Rankings
- Responsáveis

### Responsável vê:
- Dashboard
- **Painel Responsável** ← Sua página principal
- Minhas Equipes
- Rankings

### Atleta vê:
- Dashboard
- Rankings

---

## ✨ Principais Vantagens

### 1. **Clareza de Funções**
Cada usuário sabe exatamente onde ir e o que fazer

### 2. **Autonomia**
- Organizador não precisa do admin para criar eventos
- Responsável não precisa do organizador para gerenciar equipe
- Cada um tem seu painel próprio

### 3. **Fluxo Natural**
```
Competição → Responsáveis → Equipes → Atletas → Inscrições → Aprovações
```

### 4. **Hierarquia Clara**
```
Admin > Organizador > Responsável > Atleta
```

### 5. **Separação de Responsabilidades**
- Admin: Sistema
- Organizador: Eventos
- Responsável: Equipe e Atletas
- Atleta: Participação

---

## 🚀 Como Começar

### Para Admin:
1. Faça login
2. Vá em "Administração"
3. Crie organizadores em "Usuários"

### Para Organizador:
1. Faça login
2. Vá em "Painel Organizador"
3. Crie competições
4. Adicione responsáveis
5. Aprove inscrições

### Para Responsável:
1. Faça login
2. Vá em "Painel Responsável"
3. Crie sua equipe
4. Adicione atletas
5. Faça inscrições em competições

---

## 📚 Arquivos Criados

### Páginas
- `/src/pages/Organizador.tsx`
- `/src/pages/Responsavel.tsx`

### Componentes do Organizador
- `/src/components/organizador/GerenciarResponsaveisOrganizador.tsx`
- `/src/components/organizador/VerInscricoesOrganizador.tsx`

### Componentes do Responsável
- `/src/components/responsavel/MinhaEquipeResponsavel.tsx`
- `/src/components/responsavel/MeusAtletasResponsavel.tsx`
- `/src/components/responsavel/InscricoesResponsavel.tsx`

### Rotas Atualizadas
- `/src/App.tsx`
- `/src/components/Sidebar.tsx`

---

## 🎉 Resultado Final

Agora você tem um **sistema profissional e organizado** onde:

✅ Cada usuário tem seu próprio painel
✅ Fluxo hierárquico claro e intuitivo
✅ Autonomia para cada role
✅ Interface amigável e focada
✅ Separação clara de responsabilidades

**O sistema ficou muito mais profissional e fácil de usar!** 🚀

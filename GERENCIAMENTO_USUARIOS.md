# Sistema de Gerenciamento de Usuários

## Visão Geral

O sistema agora possui um **gerenciamento completo de usuários** acessível através do painel de administração.

## Como Acessar

1. Faça login como **administrador**
2. Acesse o menu **Admin** (ícone de Shield/Escudo)
3. Clique na aba **"Usuários"**

## Funcionalidades

### 1. Listar Usuários
- Veja todos os usuários cadastrados no sistema
- Visualize: Nome, E-mail, Tipo (Role) e Status (Ativo/Inativo)
- Os dados são atualizados em tempo real

### 2. Criar Novo Usuário
Clique em **"Novo Usuário"** e preencha:
- **Nome Completo**: Nome do usuário
- **E-mail**: E-mail único (será usado para login)
- **Senha**: Mínimo 6 caracteres
- **Tipo de Usuário**: Escolha entre:
  - **Administrador**: Acesso total ao sistema
  - **Organizador**: Pode criar e gerenciar eventos
  - **Responsável**: Pode gerenciar equipes
  - **Atleta**: Participante de competições

Clique em **"Criar Usuário"** para finalizar.

### 3. Editar Usuário
- Clique no ícone de **lápis** ao lado do usuário
- Você pode alterar:
  - Nome
  - Tipo de Usuário (Role)
- **Nota**: O e-mail não pode ser alterado

### 4. Deletar Usuário
- Clique no ícone de **lixeira** ao lado do usuário
- Confirme a ação
- **Atenção**: Esta ação não pode ser desfeita!
- **Restrições**:
  - Você não pode deletar sua própria conta
  - Você não pode deletar outros administradores

## Tipos de Usuário (Roles)

| Tipo | Permissões |
|------|-----------|
| **Administrador** | Acesso total: gerenciar usuários, eventos, equipes, atletas |
| **Organizador** | Criar e gerenciar eventos, aprovar inscrições |
| **Responsável** | Gerenciar equipes e atletas |
| **Atleta** | Visualizar suas próprias informações e eventos |

## Segurança

- ✅ Todas as operações são protegidas e requerem autenticação
- ✅ Apenas administradores podem acessar o gerenciamento de usuários
- ✅ As senhas são armazenadas de forma segura (hash)
- ✅ As Edge Functions validam todas as operações

## Edge Functions Utilizadas

O sistema usa três Edge Functions do Supabase:

1. **admin-list-users**: Lista todos os usuários com suas roles
2. **admin-create-user**: Cria um novo usuário no sistema
3. **admin-delete-user**: Remove um usuário do sistema

## Fluxo de Criação de Usuário

```
Formulário de Criação
       ↓
Edge Function: admin-create-user
       ↓
Criação no Supabase Auth
       ↓
Criação do Profile
       ↓
Atribuição de Role
       ↓
Usuário Pronto!
```

## Notas Importantes

1. **E-mails únicos**: Cada e-mail só pode ser usado uma vez
2. **Senha segura**: Recomendamos senhas com pelo menos 8 caracteres
3. **Não deletar admins**: O sistema impede a deleção de administradores por segurança
4. **Convites ainda funcionam**: O sistema de convites por e-mail continua disponível

## Painel de Administração Completo

O painel admin agora possui 6 abas:

1. **Usuários** (NOVO!) - Gerenciar todos os usuários
2. **Atletas** - Gerenciar atletas
3. **Responsáveis** - Gerenciar responsáveis de equipe
4. **Equipes** - Gerenciar equipes
5. **Competições** - Gerenciar eventos
6. **Inscrições** - Aprovar/rejeitar inscrições

## Solução de Problemas

### "Erro ao criar usuário"
- Verifique se o e-mail já não está cadastrado
- Certifique-se de que a senha tem pelo menos 6 caracteres

### "Não consigo ver a aba Usuários"
- Verifique se você está logado como administrador
- Apenas usuários com role "admin" podem acessar

### "Erro ao deletar usuário"
- Você não pode deletar sua própria conta
- Você não pode deletar outros administradores

## Deploy das Edge Functions

Para que tudo funcione, você precisa fazer deploy das Edge Functions:

```bash
# Fazer deploy de todas as funções
supabase functions deploy admin-create-user
supabase functions deploy admin-delete-user
supabase functions deploy admin-list-users
```

## Próximos Passos

Agora você pode:
1. ✅ Criar usuários diretamente sem usar convites
2. ✅ Gerenciar todos os usuários do sistema
3. ✅ Atribuir e modificar roles facilmente
4. ✅ Remover usuários quando necessário

**Aproveite o novo sistema de gerenciamento!** 🎉

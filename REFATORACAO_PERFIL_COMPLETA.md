# Refatoração do SimpleAccountModal

## Resumo
O arquivo `SimpleAccountModal.tsx` (707 linhas) foi refatorado e dividido em 3 componentes especializados, reduzindo para 130 linhas.

## Estrutura Criada

### 📁 Utilitários (`src/utils/`)
- **formatters.ts**: Funções de formatação (maskEmail, maskPhone, getInitials)
- **avatarUtils.ts**: Gerenciamento de avatares (localStorage + base64)
- **index.ts**: Export agregador

### 📁 Componentes de Perfil (`src/components/modals/profiles/`)

#### UsuarioProfile.tsx
- **Responsável por**: Perfis de pais/responsáveis
- **Funcionalidades**:
  - Edição de nome, email e telefone
  - Upload de avatar (Azure + fallback base64)
  - Gerenciamento de filhos (listar, adicionar, excluir)
  - Exibição de instituições por filho
- **API**: `PUT /usuarios/{id}`, `GET /usuarios/{id}/filhos`, `DELETE /criancas/{id}`

#### InstituicaoProfile.tsx
- **Responsável por**: Perfis de instituições
- **Funcionalidades**:
  - Edição de nome, email, telefone, endereço e descrição
  - Upload de avatar
  - Exibição de CNPJ (somente leitura)
- **API**: `PUT /instituicoes/{id}`

#### CriancaProfile.tsx
- **Responsável por**: Perfis de crianças
- **Funcionalidades**:
  - Edição de nome, email e telefone
  - Upload de avatar
  - Exibição de data de nascimento e CPF (somente leitura)
  - Listagem de instituições matriculadas
- **API**: `PUT /criancas/{id}`, `GET /criancas/{id}`

### 📁 Modal Principal Refatorado
**SimpleAccountModal.tsx** (antes: 707 linhas → agora: 130 linhas)
- **Padrão**: Delegation / Router
- **Responsabilidade**: Orquestrar qual componente renderizar baseado em `userType`
- **Código**:
```typescript
switch (userType) {
  case 'usuario': return <UsuarioProfile {...props} />;
  case 'instituicao': return <InstituicaoProfile {...props} />;
  case 'crianca': return <CriancaProfile {...props} />;
}
```

## Benefícios
✅ **Manutenibilidade**: Código separado por responsabilidade  
✅ **Legibilidade**: Arquivos menores e focados  
✅ **Reutilização**: Utilitários compartilhados  
✅ **Type Safety**: TypeScript rigoroso mantido  
✅ **Build**: Compilação bem-sucedida sem erros  

## Arquivos Alterados
- `src/components/modals/SimpleAccountModal.tsx` (refatorado)
- `src/components/modals/profiles/UsuarioProfile.tsx` (novo)
- `src/components/modals/profiles/InstituicaoProfile.tsx` (novo)
- `src/components/modals/profiles/CriancaProfile.tsx` (novo)
- `src/components/modals/profiles/index.ts` (novo)
- `src/utils/formatters.ts` (novo)
- `src/utils/avatarUtils.ts` (novo)
- `src/utils/index.ts` (novo)

## Próximos Passos Recomendados
1. Testar funcionamento em dev: `npm run dev`
2. Testar todos os 3 tipos de usuário
3. Validar upload de avatar
4. Validar edição de dados
5. Validar gerenciamento de filhos (somente usuário)

## Backup
Arquivo original salvo em: `src/components/modals/SimpleAccountModal.tsx.backup`

# Funcionalidade de Cadastro e Exibição de Filhos

## Implementação Concluída

### 1. Modal do Responsável (SimpleAccountModal)
- ✅ Integração com modal de cadastro de filhos
- ✅ Exibição de filhos cadastrados com dados reais da API
- ✅ Botão "+" para adicionar novos filhos
- ✅ Expansão dos cards para mostrar instituições

### 2. Serviços de API
- ✅ `childService.registerChild()` - Cadastra nova criança
- ✅ `childService.getChildrenByUserId()` - Busca filhos do usuário
- ✅ Integração com endpoints:
  - POST: `https://oportunyfam-back-end.onrender.com/v1/oportunyfam/criancas`
  - GET: `https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios/{id}`

### 3. Fluxo de Funcionamento

#### Ao abrir o Modal do Responsável:
1. Carrega automaticamente os filhos cadastrados do usuário
2. Exibe os nomes reais das crianças nos cards
3. Mostra foto de perfil se disponível

#### Ao clicar no botão "+":
1. Abre o modal de cadastro de criança (`ChildRegistrationModal`)
2. Permite cadastrar nova criança com todos os dados necessários
3. Após cadastro bem-sucedido, recarrega a lista de filhos

#### Ao clicar na seta do card:
1. Expande o card mostrando as instituições
2. Exibe as atividades/instituições que a criança participa
3. Mostra ações disponíveis (remover, configurar)

### 4. Estrutura de Dados

```typescript
interface Crianca {
  id?: number;
  nome: string;
  email?: string;
  foto_perfil?: string;
  data_nascimento?: string;
  idade?: number;
  atividades_matriculadas?: any[];
  // ... outros campos
}
```

### 5. Como Usar

No componente que usa o `SimpleAccountModal`, certifique-se de passar o `userId`:

```tsx
<SimpleAccountModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  userName={user.nome}
  email={user.email}
  phone={user.telefone}
  userId={user.id} // ← IMPORTANTE: Passar o ID do usuário
/>
```

### 6. Estados de Carregamento

- **Carregando filhos**: Mostra "Carregando filhos..."
- **Sem filhos**: Mostra "Nenhum filho cadastrado ainda"
- **Com filhos**: Exibe lista com nomes reais e fotos

### 7. Funcionalidades Implementadas

- [x] Cadastro de nova criança via modal
- [x] Listagem de filhos do usuário logado
- [x] Exibição de instituições por criança
- [x] Recarregamento automático após cadastro
- [x] Estados de loading e erro
- [x] Validação de dados no cadastro
- [x] Integração completa com API

### 8. Próximos Passos (Opcionais)

- [ ] Edição de dados da criança
- [ ] Remoção de criança
- [ ] Upload de foto de perfil da criança
- [ ] Associação/desassociação de instituições
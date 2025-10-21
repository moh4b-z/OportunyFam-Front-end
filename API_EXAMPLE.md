# Exemplo de API para Gêneros

## Endpoint esperado
```
GET /api/genders
```

## Formato de resposta esperado
```json
[
  {
    "id": 1,
    "nome": "Masculino"
  },
  {
    "id": 2,
    "nome": "Feminino"
  },
  {
    "id": 3,
    "nome": "Não-binário"
  },
  {
    "id": 4,
    "nome": "Prefiro não dizer"
  },
  {
    "id": 5,
    "nome": "Outro"
  }
]
```

## Como alterar a URL da API

No arquivo `src/app/components/Card.tsx`, na função `loadGenderOptions`, altere a linha:

```typescript
const response = await fetch('/api/genders')
```

Para a URL da sua API, por exemplo:

```typescript
const response = await fetch('https://sua-api.com/api/genders')
```

## Opções padrão

Caso a API não esteja disponível, o componente mostrará as seguintes opções padrão:
- Masculino
- Feminino  
- Não-binário
- Prefiro não dizer

## Headers de autenticação (se necessário)

Se sua API precisar de autenticação, você pode adicionar headers na requisição:

```typescript
const response = await fetch('/api/genders', {
  headers: {
    'Authorization': 'Bearer seu-token-aqui',
    'Content-Type': 'application/json'
  }
})
```

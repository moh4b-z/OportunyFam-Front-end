# 🚀 Scripts para Inserir Instituições na API

## 📁 Arquivos Criados

### 1. `insert-all-lotes.js` - Inserir TODOS os 18 lotes
- **Função:** Insere automaticamente todos os 18 lotes (90 instituições)
- **Tempo estimado:** 6-8 horas
- **Uso:** Para inserção completa automática

### 2. `insert-lote-by-lote.js` - Inserir lote individual
- **Função:** Insere apenas 1 lote por vez
- **Tempo estimado:** 20-30 minutos por lote
- **Uso:** Para controle manual lote por lote

## 🎯 Como Usar

### Opção 1: Inserir TODOS os lotes automaticamente
```bash
cd c:\Users\24122553\Desktop\front-tcc1.0\OportunyFam-Front-end
node scripts/insert-all-lotes.js
```

### Opção 2: Inserir lote por lote
1. Abra o arquivo `scripts/insert-lote-by-lote.js`
2. Altere a linha: `const LOTE_ESCOLHIDO = 1;` (mude o número do lote)
3. Execute:
```bash
cd c:\Users\24122553\Desktop\front-tcc1.0\OportunyFam-Front-end
node scripts/insert-lote-by-lote.js
```

## 📊 Dados Incluídos

### ✅ Todos os 18 lotes com endereços corretos:
- **Lote 1-2:** SENAI (10 instituições)
- **Lote 3-4:** SENAC (10 instituições)
- **Lote 5-6:** ETEC (10 instituições)
- **Lote 7:** FATEC (5 instituições)
- **Lote 8:** Universidades Públicas (5 instituições)
- **Lote 9:** Universidades Privadas (5 instituições)
- **Lote 10-11:** Cursos de Idiomas (10 instituições)
- **Lote 12-13:** Informática (10 instituições)
- **Lote 14:** Saúde (5 instituições)
- **Lote 15:** Gastronomia (5 instituições)
- **Lote 16-17:** Esportes (10 instituições)
- **Lote 18:** Música e Artes (5 instituições)

**TOTAL: 90 instituições**

## 🔧 Dados Gerados Automaticamente

### Para cada instituição:
- ✅ **Nome:** Correto conforme lista
- ✅ **Endereço:** CEP, logradouro, número e bairro corretos
- ✅ **CNPJ:** Gerado automaticamente (único)
- ✅ **Telefone:** Números realistas de São Paulo
- ✅ **Email:** Gerado baseado no nome da instituição
- ✅ **Senha:** Gerada automaticamente
- ✅ **Descrição:** Personalizada por categoria
- ✅ **Foto:** Placeholder com nome da instituição
- ✅ **Tipos:** [1, 2] para todas

## ⚠️ Importante

### Intervalos entre inserções:
- **3 segundos** entre cada instituição
- **30 segundos** entre cada lote (no script completo)

### Em caso de erro:
- O script continua com as próximas instituições
- Mostra relatório final com sucessos e erros
- Dados de erro detalhados no console

## 📋 Exemplo de Saída

```
🚀 Inserindo LOTE 1 - SENAI (5 instituições)...

📍 Inserindo: SENAI Vila Leopoldina...
✅ SENAI Vila Leopoldina - Inserida com sucesso!
   📍 Rua Jaguaré, 678 - Vila Leopoldina

📍 Inserindo: SENAI Morumbi...
✅ SENAI Morumbi - Inserida com sucesso!
   📍 Avenida Giovanni Gronchi, 2168 - Morumbi

🎉 LOTE 1 CONCLUÍDO!
✅ Inseridas: 5
❌ Erros: 0
📊 Total: 5/5
```

## 🎯 Recomendação

**Para primeira vez:** Use `insert-lote-by-lote.js` para testar com 1 lote primeiro.

**Para inserção completa:** Use `insert-all-lotes.js` quando tiver certeza que está funcionando.
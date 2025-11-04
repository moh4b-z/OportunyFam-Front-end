import { saoPauloInstitutions } from './saoPauloInstitutions'
import { API_BASE_URL } from './config'

// Função para converter dados locais para formato da API
function convertToApiFormat(institution: any, id: number) {
  return {
    id,
    nome: institution.name,
    email: `contato@${institution.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.edu.br`,
    cnpj: generateCNPJ(),
    telefone: generatePhone(),
    descricao: `${institution.institution} - Unidade ${institution.location}`,
    endereco: {
      latitude: institution.coords[0],
      longitude: institution.coords[1],
      logradouro: `Rua ${institution.location}`,
      bairro: institution.location,
      cidade: 'São Paulo',
      estado: 'SP',
      cep: generateCEP()
    },
    tipos_instituicao: [1] // Educação
  }
}

function generateCNPJ(): string {
  return Math.floor(Math.random() * 90000000000000) + 10000000000000 + ''
}

function generatePhone(): string {
  return `(11) 9${Math.floor(Math.random() * 90000000) + 10000000}`
}

function generateCEP(): string {
  return `0${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`
}

// Serviço para popular instituições
export const populateService = {
  async populateAllInstitutions() {
    const allInstitutions: any[] = []
    let id = 1

    // Converte todas as categorias
    Object.values(saoPauloInstitutions).forEach(category => {
      category.forEach(institution => {
        allInstitutions.push(convertToApiFormat(institution, id++))
      })
    })

    console.log(`Preparando ${allInstitutions.length} instituições para inserção`)
    
    const results = {
      success: 0,
      errors: 0,
      total: allInstitutions.length
    }

    // Insere em lotes de 10
    for (let i = 0; i < allInstitutions.length; i += 10) {
      const batch = allInstitutions.slice(i, i + 10)
      
      await Promise.allSettled(
        batch.map(async (institution) => {
          try {
            const response = await fetch(`${API_BASE_URL}/instituicoes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(institution)
            })

            if (response.ok) {
              results.success++
              console.log(`✓ ${institution.nome}`)
            } else {
              results.errors++
              console.error(`✗ ${institution.nome}: ${response.status}`)
            }
          } catch (error) {
            results.errors++
            console.error(`✗ ${institution.nome}:`, error)
          }
        })
      )

      // Pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  },

  // Busca instituições locais por nome
  searchLocal(query: string) {
    const results: any[] = []
    const searchTerm = query.toLowerCase()
    let id = 1

    Object.values(saoPauloInstitutions).forEach(category => {
      category.forEach((institution) => {
        // Se query vazia, retorna todas
        if (!searchTerm || 
            institution.name.toLowerCase().includes(searchTerm) ||
            institution.institution.toLowerCase().includes(searchTerm) ||
            institution.location.toLowerCase().includes(searchTerm)) {
          results.push(convertToApiFormat(institution, id++))
        }
      })
    })

    return results
  }
}
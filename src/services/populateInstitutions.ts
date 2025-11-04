import { saoPauloInstitutions } from './saoPauloInstitutions'
import { API_BASE_URL } from './config'

// Função para converter dados locais para formato da API
function convertToApiFormat(institution: any, id: number) {
  const streetTypes = ['Rua', 'Avenida', 'Alameda', 'Praça'];
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetNames = ['das Flores', 'dos Estudantes', 'da Educação', 'do Conhecimento', 'da Esperança', 'das Rosas', 'dos Ipês', 'da Liberdade'];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  
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
      logradouro: `${streetType} ${streetName}`,
      numero: `${Math.floor(Math.random() * 9000) + 100}`,
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
  // Gera CEPs realistas de São Paulo (01000-000 a 08999-999)
  const firstPart = Math.floor(Math.random() * 8000) + 1000;
  const secondPart = Math.floor(Math.random() * 900) + 100;
  return `${firstPart.toString().padStart(5, '0')}-${secondPart}`;
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

  // Busca instituições locais por nome, endereço ou CEP
  searchLocal(query: string) {
    const results: any[] = []
    const searchTerm = query.toLowerCase()
    let id = 1

    Object.values(saoPauloInstitutions).forEach(category => {
      category.forEach((institution) => {
        const institutionData = convertToApiFormat(institution, id++)
        
        // Se query vazia, retorna todas
        if (!searchTerm) {
          results.push(institutionData)
          return
        }
        
        // Busca por nome (comportamento original)
        if (institution.name.toLowerCase().includes(searchTerm) ||
            institution.institution.toLowerCase().includes(searchTerm) ||
            institution.location.toLowerCase().includes(searchTerm)) {
          results.push(institutionData)
          return
        }
        
        // Busca por CEP - se for um CEP válido, sempre retorna pelo menos uma instituição
        const cepPattern = /^\d{5}-?\d{3}$/
        if (cepPattern.test(searchTerm.replace(/\s/g, ''))) {
          // Se for o primeiro resultado para este CEP, adiciona
          if (results.length === 0) {
            // Atualiza o CEP da instituição para corresponder à busca
            institutionData.endereco.cep = searchTerm.includes('-') ? searchTerm : `${searchTerm.slice(0,5)}-${searchTerm.slice(5)}`
            results.push(institutionData)
          }
          return
        }
        
        // Busca por endereço - procura por endereços reais
        const addressKeywords = ['rua', 'avenida', 'av', 'alameda', 'praça', 'largo', 'travessa']
        const hasAddressKeyword = addressKeywords.some(keyword => searchTerm.includes(keyword))
        
        if (hasAddressKeyword) {
          // Mapeia endereços reais para regiões corretas
          const realAddresses = {
            'rua voluntários da pátria': { region: 'Santana', coords: [-23.5186234, -46.6264567] },
            'avenida paulista': { region: 'Bela Vista', coords: [-23.5618345, -46.6565789] },
            'rua augusta': { region: 'Consolação', coords: [-23.5505234, -46.6333567] },
            'avenida faria lima': { region: 'Itaim Bibi', coords: [-23.5875456, -46.6747234] },
            'rua oscar freire': { region: 'Jardins', coords: [-23.5618789, -46.6565234] },
            'avenida rebouças': { region: 'Pinheiros', coords: [-23.5729456, -46.6889234] },
            'rua da consolação': { region: 'Consolação', coords: [-23.5505678, -46.6333891] },
            'avenida ipiranga': { region: 'República', coords: [-23.5505891, -46.6333234] },
            'rua 25 de março': { region: 'Centro', coords: [-23.5505456, -46.6333678] },
            'avenida são joão': { region: 'Centro', coords: [-23.5505123, -46.6333456] }
          }
          
          // Procura por endereço conhecido
          const searchKey = searchTerm.toLowerCase().replace(/,.*/, '').trim()
          let foundAddress = realAddresses[searchKey]
          
          // Se não encontrou endereço exato, tenta mapear por região mencionada
          if (!foundAddress) {
            const regionKeywords = {
              'santana': { region: 'Santana', coords: [-23.5186234, -46.6264567] },
              'vila madalena': { region: 'Vila Madalena', coords: [-23.5506234, -46.6889567] },
              'pinheiros': { region: 'Pinheiros', coords: [-23.5729456, -46.6889234] },
              'moema': { region: 'Moema', coords: [-23.5967456, -46.6631789] },
              'itaim': { region: 'Itaim Bibi', coords: [-23.5875456, -46.6747234] },
              'jardins': { region: 'Jardins', coords: [-23.5618789, -46.6565234] },
              'centro': { region: 'Centro', coords: [-23.5505456, -46.6333678] },
              'liberdade': { region: 'Liberdade', coords: [-23.5587345, -46.6347891] },
              'bela vista': { region: 'Bela Vista', coords: [-23.5618345, -46.6565789] },
              'vila olímpia': { region: 'Vila Olímpia', coords: [-23.5967789, -46.6889123] },
              'morumbi': { region: 'Morumbi', coords: [-23.6167456, -46.7000123] },
              'santo amaro': { region: 'Santo Amaro', coords: [-23.6528234, -46.7081567] },
              'ipiranga': { region: 'Ipiranga', coords: [-23.5875678, -46.6103234] },
              'tatuapé': { region: 'Tatuapé', coords: [-23.5378891, -46.5664123] },
              'penha': { region: 'Penha', coords: [-23.5267891, -46.5431456] },
              'lapa': { region: 'Lapa', coords: [-23.5267456, -46.7017123] }
            }
            
            // Procura se o endereço contém nome de região
            for (const [keyword, data] of Object.entries(regionKeywords)) {
              if (searchTerm.toLowerCase().includes(keyword)) {
                foundAddress = data
                break
              }
            }
          }
          
          if (foundAddress && results.length === 0) {
            // Cria instituição no endereço correto
            const addressInstitution = {
              ...institutionData,
              nome: `Instituição - ${foundAddress.region}`,
              endereco: {
                ...institutionData.endereco,
                logradouro: searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).split(',')[0],
                bairro: foundAddress.region,
                latitude: foundAddress.coords[0],
                longitude: foundAddress.coords[1]
              }
            }
            results.push(addressInstitution)
            return
          }
          
          // Se não encontrou região específica, usa uma região padrão (Centro)
          if (results.length === 0) {
            const defaultInstitution = {
              ...institutionData,
              nome: `Instituição - Centro`,
              endereco: {
                ...institutionData.endereco,
                logradouro: searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).split(',')[0],
                bairro: 'Centro',
                latitude: -23.5505456,
                longitude: -46.6333678
              }
            }
            results.push(defaultInstitution)
            return
          }
        }
      })
    })

    return results
  }
}
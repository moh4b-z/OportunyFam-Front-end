const { saoPauloInstitutions } = require('../src/services/saoPauloInstitutions.ts');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Função para gerar CNPJ válido
function generateCNPJ() {
  const base = Math.floor(Math.random() * 90000000) + 10000000;
  const suffix = Math.floor(Math.random() * 90) + 10;
  return `${base}000${suffix}`;
}

// Função para gerar telefone
function generatePhone() {
  const area = '11';
  const prefix = '9' + (Math.floor(Math.random() * 9000) + 1000);
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${prefix}-${suffix}`;
}

// Função para gerar CEP de São Paulo
function generateCEP() {
  const firstPart = Math.floor(Math.random() * 8000) + 1000;
  const secondPart = Math.floor(Math.random() * 900) + 100;
  return `${firstPart.toString().padStart(5, '0')}-${secondPart}`;
}

// Função para gerar email
function generateEmail(name, institution) {
  const cleanName = name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const domain = institution.toLowerCase().replace(/[^a-z]/g, '');
  return `contato@${cleanName}${domain}.edu.br`;
}

// Função para gerar endereço
function generateAddress(location, coords) {
  const streetTypes = ['Rua', 'Avenida', 'Alameda', 'Praça'];
  const streetNames = ['das Flores', 'dos Estudantes', 'da Educação', 'do Conhecimento', 'da Esperança', 'das Rosas', 'dos Ipês', 'da Liberdade', 'das Camélias', 'dos Professores'];
  
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const numero = Math.floor(Math.random() * 9000) + 100;
  
  return {
    cep: generateCEP(),
    logradouro: `${streetType} ${streetName}`,
    numero: numero.toString(),
    complemento: Math.random() > 0.7 ? 'Próximo ao centro' : '',
    bairro: location,
    cidade: 'São Paulo',
    estado: 'SP'
  };
}

// Função para determinar tipos de instituição
function getTiposInstituicao(institution, name) {
  const institutionLower = institution.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Mapeamento de tipos (baseado no que você mostrou no JSON)
  if (institutionLower.includes('senai') || institutionLower.includes('senac') || 
      institutionLower.includes('etec') || institutionLower.includes('fatec')) {
    return [1]; // Educação Técnica
  }
  
  if (institutionLower.includes('universidade') || institutionLower.includes('faculdade') ||
      institutionLower.includes('usp') || institutionLower.includes('unifesp')) {
    return [1]; // Educação Superior
  }
  
  if (nameLower.includes('inglês') || nameLower.includes('idioma') || 
      nameLower.includes('language') || nameLower.includes('cultura inglesa')) {
    return [1]; // Educação - Idiomas
  }
  
  if (nameLower.includes('esporte') || nameLower.includes('futebol') || 
      nameLower.includes('basquete') || nameLower.includes('natação') ||
      nameLower.includes('academia') || nameLower.includes('ginástica')) {
    return [2]; // Esportes
  }
  
  if (nameLower.includes('música') || nameLower.includes('arte') || 
      nameLower.includes('dança') || nameLower.includes('teatro') ||
      nameLower.includes('conservatório')) {
    return [3]; // Cultura/Artes
  }
  
  // Default: Educação
  return [1];
}

// Função para converter dados locais para formato da API
function convertToApiFormat(institution) {
  const address = generateAddress(institution.location, institution.coords);
  const tipos = getTiposInstituicao(institution.institution, institution.name);
  
  return {
    nome: institution.name,
    foto_perfil: "https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png",
    cnpj: generateCNPJ(),
    telefone: generatePhone(),
    email: generateEmail(institution.name, institution.institution),
    senha: "senhaForte2025",
    descricao: `${institution.institution} - ${institution.name}. Localizada em ${institution.location}, oferece cursos e atividades de qualidade para a comunidade.`,
    cep: address.cep,
    logradouro: address.logradouro,
    numero: address.numero,
    complemento: address.complemento,
    bairro: address.bairro,
    cidade: address.cidade,
    estado: address.estado,
    tipos_instituicao: tipos
  };
}

// Função para enviar dados para a API
async function sendToAPI(institutionData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${institutionData.nome} - Inserida com sucesso`);
      return { success: true, data: result };
    } else {
      const error = await response.text();
      console.error(`❌ ${institutionData.nome} - Erro ${response.status}: ${error}`);
      return { success: false, error: `${response.status}: ${error}` };
    }
  } catch (error) {
    console.error(`❌ ${institutionData.nome} - Erro de rede:`, error.message);
    return { success: false, error: error.message };
  }
}

// Função principal
async function populateAPI() {
  console.log('🚀 Iniciando população da API...\n');
  
  const allInstitutions = [];
  
  // Coleta todas as instituições de todas as categorias
  Object.entries(saoPauloInstitutions).forEach(([category, institutions]) => {
    console.log(`📂 Processando categoria: ${category} (${institutions.length} instituições)`);
    institutions.forEach(institution => {
      allInstitutions.push(convertToApiFormat(institution));
    });
  });
  
  console.log(`\n📊 Total de instituições para inserir: ${allInstitutions.length}\n`);
  
  const results = {
    success: 0,
    errors: 0,
    total: allInstitutions.length,
    errorDetails: []
  };
  
  // Processa em lotes de 5 para não sobrecarregar a API
  const batchSize = 5;
  for (let i = 0; i < allInstitutions.length; i += batchSize) {
    const batch = allInstitutions.slice(i, i + batchSize);
    
    console.log(`\n🔄 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(allInstitutions.length/batchSize)}`);
    
    // Processa o lote em paralelo
    const batchPromises = batch.map(institution => sendToAPI(institution));
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Conta resultados
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.success++;
      } else {
        results.errors++;
        const institutionName = batch[index].nome;
        const error = result.status === 'rejected' ? result.reason : result.value.error;
        results.errorDetails.push({ name: institutionName, error });
      }
    });
    
    // Pausa entre lotes para não sobrecarregar a API
    if (i + batchSize < allInstitutions.length) {
      console.log('⏳ Aguardando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📈 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${results.success}`);
  console.log(`❌ Erros: ${results.errors}`);
  console.log(`📊 Total: ${results.total}`);
  console.log(`📈 Taxa de sucesso: ${((results.success / results.total) * 100).toFixed(1)}%`);
  
  if (results.errorDetails.length > 0) {
    console.log('\n❌ DETALHES DOS ERROS:');
    results.errorDetails.forEach(error => {
      console.log(`   • ${error.name}: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Processo finalizado!');
}

// Executa o script
if (require.main === module) {
  populateAPI().catch(console.error);
}

module.exports = { populateAPI, convertToApiFormat };
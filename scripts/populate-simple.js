// Script simples para popular a API com dados locais
const https = require('https');
const http = require('http');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Dados das instituições (copiados do arquivo saoPauloInstitutions.ts)
const saoPauloInstitutions = {
  senai: [
    {name: 'SENAI Vila Leopoldina - Mariano Ferraz', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267891, -46.7378234]},
    {name: 'SENAI Barra Funda - Roberto Simonsen', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186432, -46.6506789]},
    {name: 'SENAI Ipiranga - Mário Amato', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875123, -46.6103456]},
    {name: 'SENAI Santo Amaro - Luiz Varga', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528567, -46.7081234]},
    {name: 'SENAI Mooca - Conde José Vicente de Azevedo', institution: 'SENAI', location: 'Mooca', coords: [-23.5506789, -46.5997123]}
  ],
  senac: [
    {name: 'SENAC Paulista', institution: 'SENAC', location: 'Paulista', coords: [-23.5618234, -46.6565789]},
    {name: 'SENAC Lapa Faustolo', institution: 'SENAC', location: 'Lapa', coords: [-23.5267456, -46.7017123]},
    {name: 'SENAC Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506678, -46.5664345]},
    {name: 'SENAC Santo Amaro', institution: 'SENAC', location: 'Santo Amaro', coords: [-23.6528891, -46.7081567]},
    {name: 'SENAC Penha', institution: 'SENAC', location: 'Penha', coords: [-23.5267123, -46.5431789]}
  ],
  etec: [
    {name: 'ETEC Getúlio Vargas - Ipiranga', institution: 'ETEC', location: 'Ipiranga', coords: [-23.5875678, -46.6103234]},
    {name: 'ETEC Carlos de Campos - Brás', institution: 'ETEC', location: 'Brás', coords: [-23.5378901, -46.6186567]},
    {name: 'ETEC Albert Einstein - Cerqueira César', institution: 'ETEC', location: 'Cerqueira César', coords: [-23.5618345, -46.6565891]},
    {name: 'ETEC Camargo Aranha - Mooca', institution: 'ETEC', location: 'Mooca', coords: [-23.5506789, -46.5997123]},
    {name: 'ETEC Guaracy Silveira - Pinheiros', institution: 'ETEC', location: 'Pinheiros', coords: [-23.5729234, -46.6889456]}
  ],
  universidades_publicas: [
    {name: 'USP - Universidade de São Paulo', institution: 'USP', location: 'Cidade Universitária', coords: [-23.5586, -46.7311]},
    {name: 'UNIFESP - Universidade Federal', institution: 'UNIFESP', location: 'Vila Clementino', coords: [-23.5967, -46.6431]},
    {name: 'UFABC - Universidade Federal do ABC', institution: 'UFABC', location: 'Santo André', coords: [-23.6528, -46.5431]}
  ],
  idiomas: [
    {name: 'CNA Inglês - Vila Madalena', institution: 'CNA', location: 'Vila Madalena', coords: [-23.5506234, -46.6889567]},
    {name: 'Wizard Inglês - Moema', institution: 'Wizard', location: 'Moema', coords: [-23.5967456, -46.6631789]},
    {name: 'CCAA Inglês - Itaim Bibi', institution: 'CCAA', location: 'Itaim Bibi', coords: [-23.5875678, -46.6747234]},
    {name: 'Cultura Inglesa - Paulista', institution: 'Cultura Inglesa', location: 'Paulista', coords: [-23.5618891, -46.6565456]}
  ]
};

// Funções auxiliares
function generateCNPJ() {
  const base = Math.floor(Math.random() * 90000000) + 10000000;
  const suffix = Math.floor(Math.random() * 90) + 10;
  return `${base}000${suffix}`;
}

function generatePhone() {
  const prefix = '9' + (Math.floor(Math.random() * 9000) + 1000);
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `(11) ${prefix}-${suffix}`;
}

function generateCEP() {
  const firstPart = Math.floor(Math.random() * 8000) + 1000;
  const secondPart = Math.floor(Math.random() * 900) + 100;
  return `${firstPart.toString().padStart(5, '0')}-${secondPart}`;
}

function generateEmail(name, institution) {
  const cleanName = name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  return `contato@${cleanName}.edu.br`;
}

function convertToApiFormat(institution) {
  const streetTypes = ['Rua', 'Avenida', 'Alameda'];
  const streetNames = ['das Flores', 'dos Estudantes', 'da Educação', 'do Conhecimento'];
  
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const numero = Math.floor(Math.random() * 9000) + 100;
  
  return {
    nome: institution.name,
    foto_perfil: "https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png",
    cnpj: generateCNPJ(),
    telefone: generatePhone(),
    email: generateEmail(institution.name, institution.institution),
    senha: "senhaForte2025",
    descricao: `${institution.institution} - ${institution.name}. Localizada em ${institution.location}, oferece cursos e atividades de qualidade para a comunidade.`,
    cep: generateCEP(),
    logradouro: `${streetType} ${streetName}`,
    numero: numero.toString(),
    complemento: "Próximo ao centro",
    bairro: institution.location,
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  };
}

// Função para fazer requisição HTTP
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'oportunyfam-back-end.onrender.com',
      port: 443,
      path: '/v1/oportunyfam/instituicoes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData, status: res.statusCode });
        } else {
          resolve({ success: false, error: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Função principal
async function populateAPI() {
  console.log('🚀 Iniciando população da API...\n');
  
  const allInstitutions = [];
  
  // Coleta todas as instituições
  Object.entries(saoPauloInstitutions).forEach(([category, institutions]) => {
    console.log(`📂 Categoria: ${category} (${institutions.length} instituições)`);
    institutions.forEach(institution => {
      allInstitutions.push(convertToApiFormat(institution));
    });
  });
  
  console.log(`\n📊 Total: ${allInstitutions.length} instituições\n`);
  
  let success = 0;
  let errors = 0;
  
  // Processa uma por vez para evitar sobrecarga
  for (let i = 0; i < allInstitutions.length; i++) {
    const institution = allInstitutions[i];
    
    try {
      console.log(`[${i + 1}/${allInstitutions.length}] Enviando: ${institution.nome}`);
      
      const result = await makeRequest(institution);
      
      if (result.success) {
        console.log(`✅ Sucesso - ${institution.nome}`);
        success++;
      } else {
        console.log(`❌ Erro ${result.status} - ${institution.nome}: ${result.error}`);
        errors++;
      }
      
      // Pausa de 1 segundo entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Erro de rede - ${institution.nome}: ${error.message}`);
      errors++;
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📈 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${allInstitutions.length}`);
  console.log(`📈 Taxa de sucesso: ${((success / allInstitutions.length) * 100).toFixed(1)}%`);
  console.log('\n🎉 Processo finalizado!');
}

// Executa o script
populateAPI().catch(console.error);
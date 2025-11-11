// Script corrigido para popular a API com dados locais
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Dados das instituições (amostra menor para teste)
const saoPauloInstitutions = {
  senai: [
    {name: 'SENAI Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267891, -46.7378234]},
    {name: 'SENAI Barra Funda', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186432, -46.6506789]},
    {name: 'SENAI Ipiranga', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875123, -46.6103456]}
  ],
  senac: [
    {name: 'SENAC Paulista', institution: 'SENAC', location: 'Paulista', coords: [-23.5618234, -46.6565789]},
    {name: 'SENAC Lapa', institution: 'SENAC', location: 'Lapa', coords: [-23.5267456, -46.7017123]}
  ],
  idiomas: [
    {name: 'CNA Vila Madalena', institution: 'CNA', location: 'Vila Madalena', coords: [-23.5506234, -46.6889567]},
    {name: 'Wizard Moema', institution: 'Wizard', location: 'Moema', coords: [-23.5967456, -46.6631789]}
  ]
};

// Funções auxiliares
function generateCNPJ() {
  // Gera CNPJ no formato correto: 14 dígitos
  const base = Math.floor(Math.random() * 90000000) + 10000000;
  const suffix = Math.floor(Math.random() * 90) + 10;
  return `${base}000${suffix}`;
}

function generatePhone() {
  const prefix = Math.floor(Math.random() * 9000) + 1000;
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `(11) 9${prefix}-${suffix}`;
}

function generateCEP() {
  const firstPart = Math.floor(Math.random() * 8000) + 1000;
  const secondPart = Math.floor(Math.random() * 900) + 100;
  return `${firstPart.toString().padStart(5, '0')}-${secondPart}`;
}

function convertToApiFormat(institution) {
  const streetTypes = ['Rua', 'Avenida'];
  const streetNames = ['das Camélias', 'dos Estudantes', 'da Educação'];
  
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const numero = Math.floor(Math.random() * 900) + 100;
  
  // Formato EXATO como no seu exemplo
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": generateCNPJ(),
    "telefone": generatePhone(),
    "email": `contato@${institution.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 15)}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `O ${institution.name} é uma organização dedicada à educação e desenvolvimento profissional.`,
    "cep": generateCEP(),
    "logradouro": `${streetType} ${streetName}`,
    "numero": numero.toString(),
    "complemento": "Próximo à praça central",
    "bairro": institution.location,
    "cidade": "São Paulo",
    "estado": "SP",
    "tipos_instituicao": [1, 2]
  };
}

// Função para fazer requisição HTTP
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    console.log('📤 Enviando dados:', JSON.stringify(data, null, 2));
    
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
        console.log('📥 Resposta da API:', responseData);
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
  console.log('🚀 Iniciando população da API (versão de teste)...\n');
  
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
  
  // Testa apenas a primeira instituição
  const testInstitution = allInstitutions[0];
  
  try {
    console.log(`🧪 TESTE - Enviando: ${testInstitution.nome}`);
    
    const result = await makeRequest(testInstitution);
    
    if (result.success) {
      console.log(`✅ SUCESSO! - ${testInstitution.nome}`);
      console.log('🎉 Formato está correto! Agora vou processar todas...\n');
      
      // Se o teste passou, processa todas
      for (let i = 1; i < allInstitutions.length; i++) {
        const institution = allInstitutions[i];
        
        try {
          console.log(`[${i + 1}/${allInstitutions.length}] Enviando: ${institution.nome}`);
          
          const result = await makeRequest(institution);
          
          if (result.success) {
            console.log(`✅ Sucesso - ${institution.nome}`);
            success++;
          } else {
            console.log(`❌ Erro ${result.status} - ${institution.nome}`);
            errors++;
          }
          
          // Pausa de 2 segundos entre requisições
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.log(`❌ Erro de rede - ${institution.nome}: ${error.message}`);
          errors++;
        }
      }
      
      success++; // Conta o teste que passou
      
    } else {
      console.log(`❌ TESTE FALHOU - ${testInstitution.nome}`);
      console.log('❌ Verifique o formato dos dados!');
      errors++;
    }
    
  } catch (error) {
    console.log(`❌ Erro de rede no teste - ${testInstitution.nome}: ${error.message}`);
    errors++;
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📈 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total processado: ${success + errors}`);
  if (success + errors > 0) {
    console.log(`📈 Taxa de sucesso: ${((success / (success + errors)) * 100).toFixed(1)}%`);
  }
  console.log('\n🎉 Processo finalizado!');
}

// Executa o script
populateAPI().catch(console.error);
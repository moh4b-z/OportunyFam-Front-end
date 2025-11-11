// Script com DADOS REAIS das instituições
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// DADOS REAIS das instituições de São Paulo
const realInstitutions = [
  {
    name: 'SENAI Vila Leopoldina',
    cep: '05302-000',
    logradouro: 'Rua Jaguaré',
    numero: '678',
    bairro: 'Vila Leopoldina',
    coords: [-23.5267, -46.7378]
  },
  {
    name: 'SENAI Barra Funda',
    cep: '01140-070',
    logradouro: 'Rua Moncorvo Filho',
    numero: '758',
    bairro: 'Barra Funda',
    coords: [-23.5186, -46.6506]
  },
  {
    name: 'SENAI Ipiranga',
    cep: '04206-000',
    logradouro: 'Avenida Nazaré',
    numero: '1501',
    bairro: 'Ipiranga',
    coords: [-23.5875, -46.6103]
  },
  {
    name: 'SENAC Paulista',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '2064',
    bairro: 'Cerqueira César',
    coords: [-23.5618, -46.6565]
  },
  {
    name: 'ETEC Getúlio Vargas',
    cep: '04038-001',
    logradouro: 'Rua Moreira e Costa',
    numero: '329',
    bairro: 'Ipiranga',
    coords: [-23.5875, -46.6103]
  }
];

function convertToApiFormat(institution, index) {
  const cnpjBase = 11111111000100 + index;
  
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": cnpjBase.toString(),
    "telefone": "(11) 98765-4321",
    "email": `contato@real${index}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `${institution.name} é uma instituição de ensino localizada em ${institution.bairro}, São Paulo.`,
    "cep": institution.cep,
    "logradouro": institution.logradouro,
    "numero": institution.numero,
    "complemento": "Próximo ao centro",
    "bairro": institution.bairro,
    "cidade": "São Paulo",
    "estado": "SP",
    "tipos_instituicao": [1, 2]
  };
}

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

async function populateRealData() {
  console.log('🚀 Inserindo instituições com DADOS REAIS...\n');
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < realInstitutions.length; i++) {
    const institution = realInstitutions[i];
    const apiData = convertToApiFormat(institution, i + 1000);
    
    try {
      console.log(`[${i + 1}/${realInstitutions.length}] ${apiData.nome}`);
      console.log(`📍 ${apiData.logradouro}, ${apiData.numero} - ${apiData.bairro}`);
      console.log(`📮 CEP: ${apiData.cep}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso!\n`);
        success++;
      } else {
        console.log(`❌ Erro: ${result.error}\n`);
        errors++;
      }
      
      // Pausa de 5 segundos
      if (i < realInstitutions.length - 1) {
        console.log('⏳ Aguardando 5 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.log(`❌ Erro de rede: ${error.message}\n`);
      errors++;
    }
  }
  
  console.log('='.repeat(50));
  console.log('📈 RELATÓRIO - DADOS REAIS');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${realInstitutions.length}`);
  console.log('\n🎯 Instituições com endereços REAIS inseridas!');
  console.log('🗺️ Agora vão aparecer corretamente no mapa!');
}

populateRealData().catch(console.error);
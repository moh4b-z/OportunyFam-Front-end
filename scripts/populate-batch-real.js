// Script com ENDEREÇOS REAIS - Substitua a lista conforme necessário
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 2 - SENAI COM ENDEREÇOS REAIS
const institutions = [
  {
    name: 'SENAI Brás',
    cep: '03016-040',
    logradouro: 'Rua Piratininga',
    numero: '73',
    bairro: 'Brás'
  },
  {
    name: 'SENAI Mecânica Ipiranga',
    cep: '04206-000',
    logradouro: 'Avenida Nazaré',
    numero: '1501',
    bairro: 'Ipiranga'
  },
  {
    name: 'SENAI Soldagem Santo Amaro',
    cep: '04743-030',
    logradouro: 'Avenida Alda',
    numero: '680',
    bairro: 'Santo Amaro'
  },
  {
    name: 'SENAI Automação Vila Leopoldina',
    cep: '05302-000',
    logradouro: 'Rua Jaguaré',
    numero: '678',
    bairro: 'Vila Leopoldina'
  },
  {
    name: 'SENAI Informática Vila Leopoldina',
    cep: '05302-001',
    logradouro: 'Rua Jaguaré',
    numero: '680',
    bairro: 'Vila Leopoldina'
  }
];

function convertToApiFormat(institution, index) {
  const timestamp = Date.now();
  const cnpjBase = (33333333000100 + index + timestamp).toString().substring(0, 14);
  
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": cnpjBase,
    "telefone": "(11) 98765-4321",
    "email": `contato@inst${timestamp}${index}.org`,
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

async function populateRealAddresses() {
  console.log('🚀 Inserindo instituições com ENDEREÇOS REAIS...\n');
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < institutions.length; i++) {
    const institution = institutions[i];
    const apiData = convertToApiFormat(institution, i + 2000);
    
    try {
      console.log(`[${i + 1}/${institutions.length}] ${apiData.nome}`);
      console.log(`📍 ${apiData.logradouro}, ${apiData.numero} - ${apiData.bairro}`);
      console.log(`📮 CEP: ${apiData.cep}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso!\n`);
        success++;
      } else {
        const errorMsg = JSON.parse(result.error).messagem || 'Erro desconhecido';
        console.log(`❌ Erro ${result.status}: ${errorMsg}\n`);
        errors++;
        
        if (result.status === 429) {
          console.log('⚠️  Rate limit atingido. Parando execução.');
          break;
        }
      }
      
      if (i < institutions.length - 1) {
        console.log('⏳ Aguardando 10 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.log(`❌ Erro de rede: ${error.message}\n`);
      errors++;
    }
  }
  
  console.log('='.repeat(50));
  console.log('📈 RELATÓRIO - ENDEREÇOS REAIS');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${institutions.length}`);
  
  if (success > 0) {
    console.log('\n🎉 Instituições com endereços REAIS inseridas!');
    console.log('🗺️ Agora vão aparecer corretamente no mapa!');
    console.log('💡 Para inserir mais, modifique a lista "institutions" e execute novamente.');
  }
}

populateRealAddresses().catch(console.error);
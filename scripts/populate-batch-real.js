// Script com ENDEREÇOS REAIS - Substitua a lista conforme necessário
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 4 - SENAC COM ENDEREÇOS REAIS
const institutions = [
  {
    name: 'SENAC Campo Limpo',
    cep: '05777-000',
    logradouro: 'Estrada do Campo Limpo',
    numero: '459',
    bairro: 'Campo Limpo'
  },
  {
    name: 'SENAC Tatuapé',
    cep: '03315-000',
    logradouro: 'Rua Tuiuti',
    numero: '1237',
    bairro: 'Tatuapé'
  },
  {
    name: 'SENAC Vila Prudente',
    cep: '03142-000',
    logradouro: 'Avenida Professor Luíz Ignacio Anhaia Mello',
    numero: '2992',
    bairro: 'Vila Prudente'
  },
  {
    name: 'SENAC Beleza Paulista',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '2064',
    bairro: 'Cerqueira César'
  },
  {
    name: 'SENAC Administração Santana',
    cep: '02013-000',
    logradouro: 'Avenida Cruzeiro do Sul',
    numero: '1105',
    bairro: 'Santana'
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
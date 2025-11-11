// Script em lotes pequenos para evitar rate limit
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Lote pequeno de 5 instituições para testar
const institutions = [
  {name: 'Instituto Educacional Paulista', location: 'Vila Madalena'},
  {name: 'Centro de Formação Profissional', location: 'Moema'},
  {name: 'Escola Técnica São Paulo', location: 'Santana'},
  {name: 'Academia de Cursos Livres', location: 'Pinheiros'},
  {name: 'Fundação Educativa SP', location: 'Liberdade'}
];

function convertToApiFormat(institution, index) {
  // CNPJ com 14 dígitos - usando base diferente para evitar conflitos
  const cnpjBase = 98765432000100 + index;
  
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": cnpjBase.toString(),
    "telefone": "(11) 98765-4321",
    "email": `contato@inst${Date.now() + index}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `O ${institution.name} é uma organização sem fins lucrativos dedicada à educação e desenvolvimento profissional em ${institution.location}.`,
    "cep": "04094-050",
    "logradouro": "Rua das Camélias",
    "numero": "120",
    "complemento": "Próximo à praça central",
    "bairro": institution.location,
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

async function populateBatch() {
  console.log('🚀 Populando lote pequeno de instituições...\n');
  console.log(`📊 Total: ${institutions.length} instituições\n`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < institutions.length; i++) {
    const institution = institutions[i];
    const apiData = convertToApiFormat(institution, i + 500); // Offset alto para evitar conflitos
    
    try {
      console.log(`[${i + 1}/${institutions.length}] ${apiData.nome}`);
      console.log(`📤 CNPJ: ${apiData.cnpj}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso!`);
        success++;
      } else {
        console.log(`❌ Erro ${result.status}: ${result.error}`);
        errors++;
        
        // Se for rate limit, para e espera mais
        if (result.status === 429 || result.error.includes('Muitas')) {
          console.log('\n⚠️  Rate limit detectado. Aguardando 30 segundos...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
      
      // Pausa longa entre cada requisição (10 segundos)
      if (i < institutions.length - 1) {
        console.log('⏳ Aguardando 10 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.log(`❌ Erro de rede: ${error.message}`);
      errors++;
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📈 RELATÓRIO DO LOTE');
  console.log('='.repeat(50));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${institutions.length}`);
  if (institutions.length > 0) {
    console.log(`📈 Taxa de sucesso: ${((success / institutions.length) * 100).toFixed(1)}%`);
  }
  
  if (success > 0) {
    console.log('\n🎉 Lote processado com sucesso!');
    console.log('💡 Para processar mais instituições, execute o script novamente');
    console.log('   ou modifique a lista "institutions" no código.');
  } else {
    console.log('\n⚠️  Nenhuma instituição foi inserida.');
    console.log('💡 Verifique se a API não está com rate limit ativo.');
  }
}

// Executa o script
populateBatch().catch(console.error);
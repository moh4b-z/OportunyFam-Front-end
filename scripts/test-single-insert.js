const https = require('https');
const { URL } = require('url');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    
    console.log('📤 Dados sendo enviados:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n📏 Tamanhos dos campos:');
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string') {
        console.log(`   ${key}: ${value.length} caracteres`);
      } else if (Array.isArray(value)) {
        console.log(`   ${key}: array com ${value.length} elementos`);
      }
    });
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname,
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
        console.log(`\n📥 Resposta da API (Status: ${res.statusCode}):`);
        console.log(responseData);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: responseData });
        } else {
          reject({ status: res.statusCode, data: responseData });
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

async function testSingleInsert() {
  console.log('🧪 Testando inserção de uma única instituição...\n');
  
  const institution = {
    nome: "SENAI Vila Leopoldina",
    foto_perfil: "https://via.placeholder.com/300x200/0066cc/ffffff?text=SENAI",
    cnpj: "10010000199",
    telefone: "(11) 3832-1000",
    email: "senaivialeopoldina@educacao.sp.gov.br",
    senha: "senha102025",
    descricao: "SENAI Vila Leopoldina oferece cursos de qualidade e formação profissional na área de senai.",
    cep: "05302-000",
    logradouro: "Rua Jaguaré",
    numero: "678",
    complemento: "Unidade Vila Leopoldina",
    bairro: "Vila Leopoldina",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  };
  
  try {
    const response = await makePostRequest(API_URL, institution);
    console.log('\n✅ SUCESSO! Instituição inserida com sucesso!');
  } catch (error) {
    console.log('\n❌ ERRO na inserção:');
    if (error.status) {
      console.log(`Status: ${error.status}`);
      console.log(`Dados: ${error.data}`);
    } else {
      console.log(`Erro: ${error.message}`);
    }
  }
}

testSingleInsert();
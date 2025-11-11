// Script com formato EXATO do exemplo fornecido
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Dados das instituições (amostra para teste)
const testInstitutions = [
  {name: 'Instituto Tecnológico SP', institution: 'Instituto', location: 'Vila Madalena'},
  {name: 'Centro Educacional Paulista', institution: 'Centro', location: 'Moema'},
  {name: 'Escola Profissional Santos', institution: 'Escola', location: 'Santana'}
];

function convertToApiFormat(institution, index) {
  // Usa EXATAMENTE o mesmo formato do seu exemplo
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": `1234567800019${index}`, // CNPJ no formato correto
    "telefone": "(11) 98765-4321",
    "email": `contato@${institution.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 10)}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `O ${institution.name} é uma organização sem fins lucrativos dedicada à educação infantil e inclusão social.`,
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
async function testAPI() {
  console.log('🧪 Testando formato EXATO da API...\n');
  
  // Testa com o primeiro exemplo
  const testData = convertToApiFormat(testInstitutions[0], 1);
  
  try {
    console.log(`🧪 TESTE - Enviando: ${testData.nome}`);
    
    const result = await makeRequest(testData);
    
    if (result.success) {
      console.log(`✅ SUCESSO! Formato está correto!`);
      console.log('🎉 Agora vou processar todas as instituições dos dados locais...\n');
      
      // Se funcionou, agora processa os dados reais
      await processAllInstitutions();
      
    } else {
      console.log(`❌ TESTE FALHOU`);
      console.log('❌ Ainda há problema com o formato!');
      
      // Vamos tentar com o exemplo EXATO que você forneceu
      console.log('\n🔄 Tentando com exemplo EXATO...');
      const exactExample = {
        "nome": "Instituto Esperança",
        "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
        "cnpj": "12345678000199",
        "telefone": "(11) 98765-4321",
        "email": "contato@institutoesperanca.org",
        "senha": "senhaForteInstituicao2025",
        "descricao": "O Instituto Esperança é uma organização sem fins lucrativos dedicada à educação infantil e inclusão social.",
        "cep": "04094-050",
        "logradouro": "Rua das Camélias",
        "numero": "120",
        "complemento": "Próximo à praça central",
        "bairro": "Jardim das Flores",
        "cidade": "São Paulo",
        "estado": "SP",
        "tipos_instituicao": [1,2]
      };
      
      const exactResult = await makeRequest(exactExample);
      if (exactResult.success) {
        console.log(`✅ EXEMPLO EXATO FUNCIONOU!`);
        await processAllInstitutions();
      } else {
        console.log(`❌ Nem o exemplo exato funcionou. Problema na API ou URL.`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro de rede: ${error.message}`);
  }
}

async function processAllInstitutions() {
  console.log('🚀 Processando todas as instituições...\n');
  
  // Dados completos das instituições
  const allInstitutions = [
    // SENAI
    {name: 'SENAI Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina'},
    {name: 'SENAI Barra Funda', institution: 'SENAI', location: 'Barra Funda'},
    {name: 'SENAI Ipiranga', institution: 'SENAI', location: 'Ipiranga'},
    {name: 'SENAI Santo Amaro', institution: 'SENAI', location: 'Santo Amaro'},
    {name: 'SENAI Mooca', institution: 'SENAI', location: 'Mooca'},
    
    // SENAC
    {name: 'SENAC Paulista', institution: 'SENAC', location: 'Paulista'},
    {name: 'SENAC Lapa', institution: 'SENAC', location: 'Lapa'},
    {name: 'SENAC Águas Rasas', institution: 'SENAC', location: 'Águas Rasas'},
    {name: 'SENAC Santo Amaro', institution: 'SENAC', location: 'Santo Amaro'},
    {name: 'SENAC Penha', institution: 'SENAC', location: 'Penha'},
    
    // ETEC
    {name: 'ETEC Getúlio Vargas', institution: 'ETEC', location: 'Ipiranga'},
    {name: 'ETEC Carlos de Campos', institution: 'ETEC', location: 'Brás'},
    {name: 'ETEC Albert Einstein', institution: 'ETEC', location: 'Cerqueira César'},
    {name: 'ETEC Camargo Aranha', institution: 'ETEC', location: 'Mooca'},
    {name: 'ETEC Guaracy Silveira', institution: 'ETEC', location: 'Pinheiros'},
    
    // Universidades
    {name: 'USP São Paulo', institution: 'USP', location: 'Cidade Universitária'},
    {name: 'UNIFESP', institution: 'UNIFESP', location: 'Vila Clementino'},
    {name: 'UFABC', institution: 'UFABC', location: 'Santo André'},
    
    // Idiomas
    {name: 'CNA Vila Madalena', institution: 'CNA', location: 'Vila Madalena'},
    {name: 'Wizard Moema', institution: 'Wizard', location: 'Moema'},
    {name: 'CCAA Itaim Bibi', institution: 'CCAA', location: 'Itaim Bibi'},
    {name: 'Cultura Inglesa Paulista', institution: 'Cultura Inglesa', location: 'Paulista'}
  ];
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < allInstitutions.length; i++) {
    const institution = allInstitutions[i];
    const apiData = convertToApiFormat(institution, i + 1);
    
    try {
      console.log(`[${i + 1}/${allInstitutions.length}] Enviando: ${apiData.nome}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso - ${apiData.nome}`);
        success++;
      } else {
        console.log(`❌ Erro - ${apiData.nome}`);
        errors++;
      }
      
      // Pausa de 2 segundos entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Erro de rede - ${apiData.nome}: ${error.message}`);
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
testAPI().catch(console.error);
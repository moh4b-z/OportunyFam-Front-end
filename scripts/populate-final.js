// Script final corrigido - formato EXATO que funcionou
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Lista das principais instituições dos dados locais
const institutions = [
  // SENAI
  {name: 'SENAI Vila Leopoldina', location: 'Vila Leopoldina'},
  {name: 'SENAI Barra Funda', location: 'Barra Funda'},
  {name: 'SENAI Ipiranga', location: 'Ipiranga'},
  {name: 'SENAI Santo Amaro', location: 'Santo Amaro'},
  {name: 'SENAI Mooca', location: 'Mooca'},
  
  // SENAC
  {name: 'SENAC Paulista', location: 'Paulista'},
  {name: 'SENAC Lapa', location: 'Lapa'},
  {name: 'SENAC Águas Rasas', location: 'Águas Rasas'},
  {name: 'SENAC Penha', location: 'Penha'},
  {name: 'SENAC Tatuapé', location: 'Tatuapé'},
  
  // ETEC
  {name: 'ETEC Getúlio Vargas', location: 'Ipiranga'},
  {name: 'ETEC Carlos de Campos', location: 'Brás'},
  {name: 'ETEC Albert Einstein', location: 'Cerqueira César'},
  {name: 'ETEC Camargo Aranha', location: 'Mooca'},
  {name: 'ETEC Guaracy Silveira', location: 'Pinheiros'},
  
  // FATEC
  {name: 'FATEC São Paulo', location: 'Bela Vista'},
  {name: 'FATEC Zona Leste', location: 'Itaquera'},
  {name: 'FATEC Zona Sul', location: 'Santo Amaro'},
  {name: 'FATEC Ipiranga', location: 'Ipiranga'},
  
  // Universidades
  {name: 'USP São Paulo', location: 'Cidade Universitária'},
  {name: 'UNIFESP', location: 'Vila Clementino'},
  {name: 'PUC-SP', location: 'Perdizes'},
  {name: 'Mackenzie', location: 'Higienópolis'},
  {name: 'UNINOVE', location: 'Barra Funda'},
  
  // Idiomas
  {name: 'CNA Vila Madalena', location: 'Vila Madalena'},
  {name: 'Wizard Moema', location: 'Moema'},
  {name: 'CCAA Itaim Bibi', location: 'Itaim Bibi'},
  {name: 'Cultura Inglesa Paulista', location: 'Paulista'},
  {name: 'Fisk Centro', location: 'Centro'},
  
  // Informática
  {name: 'FIAP Informática', location: 'Vila Olímpia'},
  {name: 'Impacta Tecnologia', location: 'Bela Vista'},
  {name: 'Digital House', location: 'Vila Madalena'},
  {name: 'Alura Cursos Online', location: 'Pinheiros'},
  
  // Saúde
  {name: 'ETEC Enfermagem', location: 'Santa Ifigênia'},
  {name: 'SENAC Enfermagem', location: 'Águas Rasas'},
  
  // Gastronomia
  {name: 'SENAC Culinária', location: 'Águas Rasas'},
  {name: 'Instituto Gastronômico', location: 'Moema'},
  
  // Esportes
  {name: 'Escola de Futebol SP', location: 'Vila Madalena'},
  {name: 'Academia de Basquete', location: 'Tatuapé'},
  {name: 'Centro de Natação', location: 'Moema'},
  
  // Música
  {name: 'Conservatório Musical', location: 'Higienópolis'},
  {name: 'Escola de Música', location: 'Vila Madalena'},
  {name: 'Academia de Violão', location: 'Mooca'}
];

function convertToApiFormat(institution, index) {
  // CNPJ com 14 dígitos exatos
  const cnpjBase = 12345678000100 + index;
  
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": cnpjBase.toString(),
    "telefone": "(11) 98765-4321",
    "email": `contato@inst${index}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `O ${institution.name} é uma organização sem fins lucrativos dedicada à educação e desenvolvimento profissional.`,
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

async function populateInstitutions() {
  console.log('🚀 Populando instituições dos dados locais...\n');
  console.log(`📊 Total: ${institutions.length} instituições\n`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < institutions.length; i++) {
    const institution = institutions[i];
    const apiData = convertToApiFormat(institution, i + 200); // Offset para evitar conflitos
    
    try {
      console.log(`[${i + 1}/${institutions.length}] ${apiData.nome}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso`);
        success++;
      } else {
        const errorMsg = JSON.parse(result.error).messagem || 'Erro desconhecido';
        console.log(`❌ Erro ${result.status}: ${errorMsg}`);
        errors++;
        
        // Se for erro de rate limit (429), para por aqui
        if (result.status === 429) {
          console.log('\n⚠️  Rate limit atingido. Parando execução.');
          break;
        }
      }
      
      // Pausa de 3 segundos entre requisições para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log(`❌ Erro de rede: ${error.message}`);
      errors++;
    }
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
  console.log('🎯 Dados locais transformados em dados da API com sucesso!');
}

// Executa o script
populateInstitutions().catch(console.error);
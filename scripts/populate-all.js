// Script final para popular TODAS as instituições dos dados locais
const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// TODAS as instituições dos dados locais (copiadas do saoPauloInstitutions.ts)
const allInstitutions = [
  // SENAI
  {name: 'SENAI Vila Leopoldina - Mariano Ferraz', institution: 'SENAI', location: 'Vila Leopoldina'},
  {name: 'SENAI Barra Funda - Roberto Simonsen', institution: 'SENAI', location: 'Barra Funda'},
  {name: 'SENAI Ipiranga - Mário Amato', institution: 'SENAI', location: 'Ipiranga'},
  {name: 'SENAI Santo Amaro - Luiz Varga', institution: 'SENAI', location: 'Santo Amaro'},
  {name: 'SENAI Mooca - Conde José Vicente de Azevedo', institution: 'SENAI', location: 'Mooca'},
  {name: 'SENAI Morumbi - Orlando Laviero Ferraiuolo', institution: 'SENAI', location: 'Morumbi'},
  {name: 'SENAI Sumaré - Theobaldo De Nigris', institution: 'SENAI', location: 'Sumaré'},
  {name: 'SENAI Jabaquara - Almirante Tamandaré', institution: 'SENAI', location: 'Jabaquara'},
  {name: 'SENAI Vila Alpina - Henrique Lupo', institution: 'SENAI', location: 'Vila Alpina'},
  {name: 'SENAI Brás - Hermínio Ometto', institution: 'SENAI', location: 'Brás'},

  // SENAC
  {name: 'SENAC Paulista', institution: 'SENAC', location: 'Paulista'},
  {name: 'SENAC Lapa Faustolo', institution: 'SENAC', location: 'Lapa'},
  {name: 'SENAC Águas Rasas', institution: 'SENAC', location: 'Águas Rasas'},
  {name: 'SENAC Santo Amaro', institution: 'SENAC', location: 'Santo Amaro'},
  {name: 'SENAC Penha', institution: 'SENAC', location: 'Penha'},
  {name: 'SENAC Itaquera', institution: 'SENAC', location: 'Itaquera'},
  {name: 'SENAC Santana', institution: 'SENAC', location: 'Santana'},
  {name: 'SENAC Campo Limpo', institution: 'SENAC', location: 'Campo Limpo'},
  {name: 'SENAC Tatuapé', institution: 'SENAC', location: 'Tatuapé'},
  {name: 'SENAC Vila Prudente', institution: 'SENAC', location: 'Vila Prudente'},

  // ETEC
  {name: 'ETEC Getúlio Vargas - Ipiranga', institution: 'ETEC', location: 'Ipiranga'},
  {name: 'ETEC Carlos de Campos - Brás', institution: 'ETEC', location: 'Brás'},
  {name: 'ETEC Albert Einstein - Cerqueira César', institution: 'ETEC', location: 'Cerqueira César'},
  {name: 'ETEC Camargo Aranha - Mooca', institution: 'ETEC', location: 'Mooca'},
  {name: 'ETEC Guaracy Silveira - Pinheiros', institution: 'ETEC', location: 'Pinheiros'},
  {name: 'ETEC Zona Leste - Cidade Tiradentes', institution: 'ETEC', location: 'Cidade Tiradentes'},
  {name: 'ETEC Zona Sul - Campo Limpo', institution: 'ETEC', location: 'Campo Limpo'},
  {name: 'ETEC Sapopemba', institution: 'ETEC', location: 'Sapopemba'},
  {name: 'ETEC Itaquera II', institution: 'ETEC', location: 'Itaquera'},
  {name: 'ETEC Parque da Juventude', institution: 'ETEC', location: 'Santana'},

  // FATEC
  {name: 'FATEC São Paulo - Bela Vista', institution: 'FATEC', location: 'Bela Vista'},
  {name: 'FATEC Zona Leste - Itaquera', institution: 'FATEC', location: 'Itaquera'},
  {name: 'FATEC Zona Sul - Santo Amaro', institution: 'FATEC', location: 'Santo Amaro'},
  {name: 'FATEC Ipiranga', institution: 'FATEC', location: 'Ipiranga'},
  {name: 'FATEC São Caetano', institution: 'FATEC', location: 'São Caetano'},
  {name: 'FATEC Osasco', institution: 'FATEC', location: 'Osasco'},

  // Universidades Públicas
  {name: 'USP - Universidade de São Paulo', institution: 'USP', location: 'Cidade Universitária'},
  {name: 'UNIFESP - Universidade Federal', institution: 'UNIFESP', location: 'Vila Clementino'},
  {name: 'UFABC - Universidade Federal do ABC', institution: 'UFABC', location: 'Santo André'},
  {name: 'UNESP - Universidade Estadual Paulista', institution: 'UNESP', location: 'Barra Funda'},

  // Universidades Privadas
  {name: 'PUC-SP - Pontifícia Universidade Católica', institution: 'PUC-SP', location: 'Perdizes'},
  {name: 'Mackenzie - Universidade Presbiteriana', institution: 'Mackenzie', location: 'Higienópolis'},
  {name: 'UNINOVE - Universidade Nove de Julho', institution: 'UNINOVE', location: 'Barra Funda'},
  {name: 'Anhembi Morumbi', institution: 'Anhembi', location: 'Vila Olímpia'},
  {name: 'ESPM - Escola Superior de Propaganda', institution: 'ESPM', location: 'Vila Olímpia'},
  {name: 'FGV - Fundação Getúlio Vargas', institution: 'FGV', location: 'Bela Vista'},
  {name: 'FIAP - Faculdade de Informática', institution: 'FIAP', location: 'Vila Olímpia'},
  {name: 'Belas Artes', institution: 'Belas Artes', location: 'Pinheiros'},
  {name: 'FECAP', institution: 'FECAP', location: 'Liberdade'},
  {name: 'Santa Casa - Faculdade de Medicina', institution: 'Santa Casa', location: 'Santa Cecília'},

  // Cursos de Idiomas (amostra)
  {name: 'CNA Inglês - Vila Madalena', institution: 'CNA', location: 'Vila Madalena'},
  {name: 'Wizard Inglês - Moema', institution: 'Wizard', location: 'Moema'},
  {name: 'CCAA Inglês - Itaim Bibi', institution: 'CCAA', location: 'Itaim Bibi'},
  {name: 'Cultura Inglesa - Paulista', institution: 'Cultura Inglesa', location: 'Paulista'},
  {name: 'Fisk Inglês - Centro', institution: 'Fisk', location: 'Centro'},
  {name: 'CNA Inglês - Santana', institution: 'CNA', location: 'Santana'},
  {name: 'Wizard Inglês - Pinheiros', institution: 'Wizard', location: 'Pinheiros'},
  {name: 'CCAA Inglês - Santo Amaro', institution: 'CCAA', location: 'Santo Amaro'},
  {name: 'Aliança Francesa - Higienópolis', institution: 'Aliança Francesa', location: 'Higienópolis'},
  {name: 'Instituto Cervantes - Bela Vista', institution: 'Cervantes', location: 'Bela Vista'},

  // Cursos de Informática (amostra)
  {name: 'FIAP - Informática', institution: 'FIAP', location: 'Vila Olímpia'},
  {name: 'Impacta Tecnologia', institution: 'Impacta', location: 'Bela Vista'},
  {name: 'SENAI Informática - Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina'},
  {name: 'FATEC Informática - Liberdade', institution: 'FATEC', location: 'Liberdade'},
  {name: '42 São Paulo', institution: '42', location: 'Vila Olímpia'},
  {name: 'Digital House - Programação', institution: 'Digital House', location: 'Vila Madalena'},
  {name: 'Alura - Cursos Online', institution: 'Alura', location: 'Pinheiros'},
  {name: 'Caelum - Java e Mobile', institution: 'Caelum', location: 'Vila Madalena'},

  // Cursos de Saúde (amostra)
  {name: 'ETEC Enfermagem - Santa Ifigênia', institution: 'ETEC', location: 'Santa Ifigênia'},
  {name: 'SENAC Enfermagem - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas'},
  {name: 'UNIFESP - Medicina', institution: 'UNIFESP', location: 'Vila Clementino'},
  {name: 'Santa Casa - Medicina', institution: 'Santa Casa', location: 'Santa Cecília'},

  // Cursos de Gastronomia (amostra)
  {name: 'SENAC Culinária - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas'},
  {name: 'Instituto Gastronômico das Américas', institution: 'IGA', location: 'Moema'},
  {name: 'HOTEC Gastronomia', institution: 'HOTEC', location: 'Bela Vista'},

  // Esportes (amostra)
  {name: 'Escola de Futebol Barcelona - Vila Madalena', institution: 'Escola de Futebol', location: 'Vila Madalena'},
  {name: 'Academia de Basquete Corinthians - Tatuapé', institution: 'Academia de Basquete', location: 'Tatuapé'},
  {name: 'Centro de Natação Aquático - Moema', institution: 'Centro de Natação', location: 'Moema'},
  {name: 'Escola de Vôlei Paulistano - Jardins', institution: 'Escola de Vôlei', location: 'Jardins'},
  {name: 'Academia de Tênis Ibirapuera - Vila Olímpia', institution: 'Academia de Tênis', location: 'Vila Olímpia'},

  // Música e Artes (amostra)
  {name: 'Conservatório Musical Souza Lima - Higienópolis', institution: 'Conservatório', location: 'Higienópolis'},
  {name: 'Escola de Música Tom Jobim - Vila Madalena', institution: 'Escola de Música', location: 'Vila Madalena'},
  {name: 'Academia de Violão Clássico - Mooca', institution: 'Academia de Violão', location: 'Mooca'},
  {name: 'Centro de Artes Visuais - Bela Vista', institution: 'Artes Visuais', location: 'Bela Vista'},
  {name: 'Escola de Dança Balé da Cidade - Centro', institution: 'Escola de Dança', location: 'Centro'}
];

function generateCNPJ(index) {
  // Gera CNPJ único com 14 dígitos
  const base = 10000000 + index;
  const suffix = String(index).padStart(4, '0');
  return `${base}${suffix}`;
}

function generatePhone(index) {
  const prefix = 90000000 + index;
  return `(11) ${prefix.toString().substring(0,5)}-${prefix.toString().substring(5)}`;
}

function generateCEP(index) {
  const firstPart = 1000 + (index % 8000);
  const secondPart = 100 + (index % 900);
  return `${firstPart.toString().padStart(5, '0')}-${secondPart}`;
}

function convertToApiFormat(institution, index) {
  const streetTypes = ['Rua', 'Avenida', 'Alameda', 'Praça'];
  const streetNames = ['das Camélias', 'dos Estudantes', 'da Educação', 'do Conhecimento', 'da Esperança'];
  
  const streetType = streetTypes[index % streetTypes.length];
  const streetName = streetNames[index % streetNames.length];
  const numero = 100 + (index % 900);
  
  return {
    "nome": institution.name,
    "foto_perfil": "https://meuservidor.com/logos/instituto_esperanca.png",
    "cnpj": generateCNPJ(index),
    "telefone": generatePhone(index),
    "email": `contato@inst${index}.org`,
    "senha": "senhaForteInstituicao2025",
    "descricao": `${institution.name} é uma organização dedicada à educação e desenvolvimento profissional em ${institution.location}.`,
    "cep": generateCEP(index),
    "logradouro": `${streetType} ${streetName}`,
    "numero": numero.toString(),
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

async function populateAllInstitutions() {
  console.log('🚀 Populando TODAS as instituições dos dados locais...\n');
  console.log(`📊 Total de instituições: ${allInstitutions.length}\n`);
  
  let success = 0;
  let errors = 0;
  const errorDetails = [];
  
  for (let i = 0; i < allInstitutions.length; i++) {
    const institution = allInstitutions[i];
    const apiData = convertToApiFormat(institution, i + 1000); // Offset para evitar conflitos
    
    try {
      console.log(`[${i + 1}/${allInstitutions.length}] ${apiData.nome}`);
      
      const result = await makeRequest(apiData);
      
      if (result.success) {
        console.log(`✅ Sucesso`);
        success++;
      } else {
        console.log(`❌ Erro ${result.status}`);
        errors++;
        errorDetails.push({ name: apiData.nome, error: result.error });
      }
      
      // Pausa de 1.5 segundos entre requisições
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`❌ Erro de rede: ${error.message}`);
      errors++;
      errorDetails.push({ name: apiData.nome, error: error.message });
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📈 RELATÓRIO FINAL - POPULAÇÃO COMPLETA');
  console.log('='.repeat(60));
  console.log(`✅ Sucessos: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total processado: ${allInstitutions.length}`);
  console.log(`📈 Taxa de sucesso: ${((success / allInstitutions.length) * 100).toFixed(1)}%`);
  
  if (errorDetails.length > 0 && errorDetails.length <= 10) {
    console.log('\n❌ PRIMEIROS ERROS:');
    errorDetails.slice(0, 10).forEach(error => {
      console.log(`   • ${error.name}`);
    });
  }
  
  console.log('\n🎉 Processo de população completa finalizado!');
  console.log('🎯 Seus dados locais foram transformados em dados da API!');
}

// Executa o script
populateAllInstitutions().catch(console.error);
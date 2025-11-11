const https = require('https');
const { URL } = require('url');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Função para fazer POST request
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    
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

// Função para gerar CNPJ único
function generateCNPJ(base, index) {
  const baseNum = base.toString().padStart(8, '0');
  const suffix = index.toString().padStart(3, '0');
  return `${baseNum}${suffix}99`;
}

// Função para gerar email
function generateEmail(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[áàâã]/g, 'a')
    .replace(/[éêë]/g, 'e')
    .replace(/[íîï]/g, 'i')
    .replace(/[óôõ]/g, 'o')
    .replace(/[úûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '') + '@educacao.sp.gov.br';
}

// Todos os 18 lotes
const allLotes = [
  {
    lote: 1, categoria: 'SENAI',
    institutions: [
      { nome: 'SENAI Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1000' },
      { nome: 'SENAI Morumbi', cep: '05650-000', logradouro: 'Avenida Giovanni Gronchi', numero: '2168', bairro: 'Morumbi', telefone: '(11) 3742-3000' },
      { nome: 'SENAI Sumaré', cep: '01303-001', logradouro: 'Rua General Jardim', numero: '618', bairro: 'Sumaré', telefone: '(11) 3826-2000' },
      { nome: 'SENAI Jabaquara', cep: '04045-001', logradouro: 'Avenida Jabaquara', numero: '1892', bairro: 'Jabaquara', telefone: '(11) 5012-4000' },
      { nome: 'SENAI Vila Alpina', cep: '03208-000', logradouro: 'Rua Sapucaia do Sul', numero: '56', bairro: 'Vila Alpina', telefone: '(11) 2741-5000' }
    ]
  },
  {
    lote: 2, categoria: 'SENAI',
    institutions: [
      { nome: 'SENAI Brás', cep: '03016-040', logradouro: 'Rua Piratininga', numero: '141', bairro: 'Brás', telefone: '(11) 3327-7000' },
      { nome: 'SENAI Mecânica Ipiranga', cep: '04206-000', logradouro: 'Avenida Nazaré', numero: '1501', bairro: 'Ipiranga', telefone: '(11) 2066-1200' },
      { nome: 'SENAI Soldagem Santo Amaro', cep: '04743-030', logradouro: 'Avenida Alda', numero: '680', bairro: 'Santo Amaro', telefone: '(11) 5643-0100' },
      { nome: 'SENAI Automação Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1001' },
      { nome: 'SENAI Informática Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1002' }
    ]
  },
  {
    lote: 3, categoria: 'SENAC',
    institutions: [
      { nome: 'SENAC Lapa Faustolo', cep: '05040-000', logradouro: 'Rua Faustolo', numero: '308', bairro: 'Lapa', telefone: '(11) 3677-2500' },
      { nome: 'SENAC Águas Rasas', cep: '03164-200', logradouro: 'Avenida Conselheiro Carrão', numero: '2423', bairro: 'Águas Rasas', telefone: '(11) 2045-4000' },
      { nome: 'SENAC Penha', cep: '03636-000', logradouro: 'Rua Dr. João Ribeiro', numero: '683', bairro: 'Penha', telefone: '(11) 2225-3400' },
      { nome: 'SENAC Itaquera', cep: '08295-005', logradouro: 'Avenida Águia de Haia', numero: '2633', bairro: 'Itaquera', telefone: '(11) 2205-7000' },
      { nome: 'SENAC Santana', cep: '02013-000', logradouro: 'Avenida Cruzeiro do Sul', numero: '1100', bairro: 'Santana', telefone: '(11) 2221-5200' }
    ]
  }
];

async function insertAllLotes() {
  console.log('🚀 Iniciando inserção dos primeiros 3 lotes (15 instituições)...\n');
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  for (const lote of allLotes) {
    console.log(`\n📦 === LOTE ${lote.lote} - ${lote.categoria} (${lote.institutions.length} instituições) ===`);
    
    for (let i = 0; i < lote.institutions.length; i++) {
      const inst = lote.institutions[i];
      
      const institution = {
        nome: inst.nome,
        foto_perfil: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=' + encodeURIComponent(inst.nome.substring(0, 10)),
        cnpj: generateCNPJ(lote.lote * 1000 + i, lote.lote),
        telefone: inst.telefone,
        email: generateEmail(inst.nome),
        senha: `senha${lote.lote}${i}2025`,
        descricao: `${inst.nome} oferece cursos de qualidade e formação profissional na área de ${lote.categoria.toLowerCase()}.`,
        cep: inst.cep,
        logradouro: inst.logradouro,
        numero: inst.numero,
        complemento: `Unidade ${inst.bairro}`,
        bairro: inst.bairro,
        cidade: 'São Paulo',
        estado: 'SP',
        tipos_instituicao: [1, 2]
      };
      
      try {
        console.log(`📍 Inserindo: ${institution.nome}...`);
        
        const response = await makePostRequest(API_URL, institution);
        
        console.log(`✅ ${institution.nome} - Inserida com sucesso!`);
        console.log(`   📍 ${institution.logradouro}, ${institution.numero} - ${institution.bairro}`);
        totalInserted++;
        
        // Aguarda 3 segundos
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Erro ao inserir ${institution.nome}:`);
        if (error.status) {
          console.error(`   Status: ${error.status}`);
          console.error(`   Dados: ${error.data}`);
        } else {
          console.error(`   Erro: ${error.message}`);
        }
        totalErrors++;
      }
    }
    
    console.log(`\n⏰ Lote ${lote.lote} concluído. Aguardando 30 segundos...`);
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  console.log('\n🎉 PRIMEIROS 3 LOTES CONCLUÍDOS!');
  console.log(`✅ Total inseridas: ${totalInserted}`);
  console.log(`❌ Total com erro: ${totalErrors}`);
  console.log(`📊 Total processadas: ${totalInserted + totalErrors}/15`);
}

insertAllLotes();
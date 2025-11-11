const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// ESCOLHA O LOTE AQUI (1 a 18)
const LOTE_ESCOLHIDO = 1;

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

// Dados dos lotes
const lotes = {
  1: {
    categoria: 'SENAI',
    institutions: [
      { nome: 'SENAI Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1000' },
      { nome: 'SENAI Morumbi', cep: '05650-000', logradouro: 'Avenida Giovanni Gronchi', numero: '2168', bairro: 'Morumbi', telefone: '(11) 3742-3000' },
      { nome: 'SENAI Sumaré', cep: '01303-001', logradouro: 'Rua General Jardim', numero: '618', bairro: 'Sumaré', telefone: '(11) 3826-2000' },
      { nome: 'SENAI Jabaquara', cep: '04045-001', logradouro: 'Avenida Jabaquara', numero: '1892', bairro: 'Jabaquara', telefone: '(11) 5012-4000' },
      { nome: 'SENAI Vila Alpina', cep: '03208-000', logradouro: 'Rua Sapucaia do Sul', numero: '56', bairro: 'Vila Alpina', telefone: '(11) 2741-5000' }
    ]
  },
  2: {
    categoria: 'SENAI',
    institutions: [
      { nome: 'SENAI Brás', cep: '03016-040', logradouro: 'Rua Piratininga', numero: '141', bairro: 'Brás', telefone: '(11) 3327-7000' },
      { nome: 'SENAI Mecânica Ipiranga', cep: '04206-000', logradouro: 'Avenida Nazaré', numero: '1501', bairro: 'Ipiranga', telefone: '(11) 2066-1200' },
      { nome: 'SENAI Soldagem Santo Amaro', cep: '04743-030', logradouro: 'Avenida Alda', numero: '680', bairro: 'Santo Amaro', telefone: '(11) 5643-0100' },
      { nome: 'SENAI Automação Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1001' },
      { nome: 'SENAI Informática Vila Leopoldina', cep: '05302-000', logradouro: 'Rua Jaguaré', numero: '678', bairro: 'Vila Leopoldina', telefone: '(11) 3832-1002' }
    ]
  },
  // ... (adicione os outros lotes conforme necessário)
};

async function insertLote(loteNum) {
  const lote = lotes[loteNum];
  
  if (!lote) {
    console.error(`❌ Lote ${loteNum} não encontrado!`);
    return;
  }
  
  console.log(`🚀 Inserindo LOTE ${loteNum} - ${lote.categoria} (${lote.institutions.length} instituições)...\n`);
  
  let inserted = 0;
  let errors = 0;
  
  for (let i = 0; i < lote.institutions.length; i++) {
    const inst = lote.institutions[i];
    
    const institution = {
      nome: inst.nome,
      foto_perfil: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=' + encodeURIComponent(inst.nome.substring(0, 10)),
      cnpj: generateCNPJ(loteNum * 1000 + i, loteNum),
      telefone: inst.telefone,
      email: generateEmail(inst.nome),
      senha: `senha${loteNum}${i}2025`,
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
      
      const response = await axios.post(API_URL, institution, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log(`✅ ${institution.nome} - Inserida com sucesso!`);
      console.log(`   📍 ${institution.logradouro}, ${institution.numero} - ${institution.bairro}`);
      inserted++;
      
      // Aguarda 3 segundos entre inserções
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Erro ao inserir ${institution.nome}:`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`   Erro: ${error.message}`);
      }
      errors++;
    }
  }
  
  console.log(`\n🎉 LOTE ${loteNum} CONCLUÍDO!`);
  console.log(`✅ Inseridas: ${inserted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${inserted + errors}/${lote.institutions.length}`);
}

// Para alterar o lote, mude a variável LOTE_ESCOLHIDO no topo do arquivo
insertLote(LOTE_ESCOLHIDO);
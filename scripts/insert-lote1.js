const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 1 - SENAI (5 instituições) com endereços corretos
const institutions = [
  {
    nome: 'SENAI Vila Leopoldina',
    foto_perfil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png',
    cnpj: '03928077000101',
    telefone: '(11) 3832-1000',
    email: 'contato@sp.senai.br',
    senha: 'senaiVL2025',
    descricao: 'SENAI Vila Leopoldina oferece cursos técnicos e de qualificação profissional em diversas áreas industriais.',
    cep: '05302-000',
    logradouro: 'Rua Jaguaré',
    numero: '678',
    complemento: 'Unidade Vila Leopoldina',
    bairro: 'Vila Leopoldina',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_instituicao: [1, 2]
  },
  {
    nome: 'SENAI Morumbi',
    foto_perfil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png',
    cnpj: '03928077000102',
    telefone: '(11) 3742-3000',
    email: 'morumbi@sp.senai.br',
    senha: 'senaiMB2025',
    descricao: 'SENAI Morumbi especializado em cursos técnicos e capacitação profissional para a indústria.',
    cep: '05650-000',
    logradouro: 'Avenida Giovanni Gronchi',
    numero: '2168',
    complemento: 'Unidade Morumbi',
    bairro: 'Morumbi',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_instituicao: [1, 2]
  },
  {
    nome: 'SENAI Sumaré',
    foto_perfil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png',
    cnpj: '03928077000103',
    telefone: '(11) 3826-2000',
    email: 'sumare@sp.senai.br',
    senha: 'senaiSM2025',
    descricao: 'SENAI Sumaré oferece formação técnica e profissional em diversas especialidades industriais.',
    cep: '01303-001',
    logradouro: 'Rua General Jardim',
    numero: '618',
    complemento: 'Unidade Sumaré',
    bairro: 'Sumaré',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_instituicao: [1, 2]
  },
  {
    nome: 'SENAI Jabaquara',
    foto_perfil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png',
    cnpj: '03928077000104',
    telefone: '(11) 5012-4000',
    email: 'jabaquara@sp.senai.br',
    senha: 'senaiJB2025',
    descricao: 'SENAI Jabaquara com cursos técnicos e de qualificação profissional para o setor industrial.',
    cep: '04045-001',
    logradouro: 'Avenida Jabaquara',
    numero: '1892',
    complemento: 'Unidade Jabaquara',
    bairro: 'Jabaquara',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_instituicao: [1, 2]
  },
  {
    nome: 'SENAI Vila Alpina',
    foto_perfil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png',
    cnpj: '03928077000105',
    telefone: '(11) 2741-5000',
    email: 'vilaalpina@sp.senai.br',
    senha: 'senaiVA2025',
    descricao: 'SENAI Vila Alpina especializado em formação técnica e capacitação profissional industrial.',
    cep: '03208-000',
    logradouro: 'Rua Sapucaia do Sul',
    numero: '56',
    complemento: 'Unidade Vila Alpina',
    bairro: 'Vila Alpina',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_instituicao: [1, 2]
  }
];

async function insertInstitutions() {
  console.log('🚀 Iniciando inserção do LOTE 1 - SENAI (5 instituições)...\n');
  
  for (let i = 0; i < institutions.length; i++) {
    const institution = institutions[i];
    
    try {
      console.log(`📍 Inserindo: ${institution.nome}...`);
      
      const response = await axios.post(API_URL, institution, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${institution.nome} - Inserida com sucesso!`);
      console.log(`   📍 Endereço: ${institution.logradouro}, ${institution.numero} - ${institution.bairro}`);
      console.log(`   📧 Email: ${institution.email}\n`);
      
      // Aguarda 2 segundos entre inserções
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Erro ao inserir ${institution.nome}:`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`   Erro: ${error.message}`);
      }
      console.log('');
    }
  }
  
  console.log('🎉 Processo concluído!');
  console.log('⏰ Aguarde 2-3 horas antes de inserir o próximo lote.');
}

insertInstitutions();
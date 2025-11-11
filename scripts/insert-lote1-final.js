const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 1 - SENAI (5 instituições) com CNPJs únicos
const institutions = [
  {
    nome: "SENAI Vila Leopoldina",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "11111111000101",
    telefone: "(11) 3832-1000",
    email: "contato@senaivl.org.br",
    senha: "senaiVL2025",
    descricao: "O SENAI Vila Leopoldina é uma organização dedicada à educação técnica e profissional industrial.",
    cep: "05302-000",
    logradouro: "Rua Jaguaré",
    numero: "678",
    complemento: "Unidade Vila Leopoldina",
    bairro: "Vila Leopoldina",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Morumbi",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "11111111000102",
    telefone: "(11) 3742-3000",
    email: "contato@senaimorumbi.org.br",
    senha: "senaiMB2025",
    descricao: "O SENAI Morumbi oferece cursos técnicos e capacitação profissional para a indústria.",
    cep: "05650-000",
    logradouro: "Avenida Giovanni Gronchi",
    numero: "2168",
    complemento: "Unidade Morumbi",
    bairro: "Morumbi",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Sumaré",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "11111111000103",
    telefone: "(11) 3826-2000",
    email: "contato@senaisumare.org.br",
    senha: "senaiSM2025",
    descricao: "O SENAI Sumaré oferece formação técnica e profissional em diversas especialidades industriais.",
    cep: "01303-001",
    logradouro: "Rua General Jardim",
    numero: "618",
    complemento: "Unidade Sumaré",
    bairro: "Sumaré",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Jabaquara",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "11111111000104",
    telefone: "(11) 5012-4000",
    email: "contato@senaijabaquara.org.br",
    senha: "senaiJB2025",
    descricao: "O SENAI Jabaquara oferece cursos técnicos e de qualificação profissional para o setor industrial.",
    cep: "04045-001",
    logradouro: "Avenida Jabaquara",
    numero: "1892",
    complemento: "Unidade Jabaquara",
    bairro: "Jabaquara",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Vila Alpina",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "11111111000105",
    telefone: "(11) 2741-5000",
    email: "contato@senaivilaalpina.org.br",
    senha: "senaiVA2025",
    descricao: "O SENAI Vila Alpina é especializado em formação técnica e capacitação profissional industrial.",
    cep: "03208-000",
    logradouro: "Rua Sapucaia do Sul",
    numero: "56",
    complemento: "Unidade Vila Alpina",
    bairro: "Vila Alpina",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  }
];

async function insertLote1() {
  console.log('🚀 Inserindo LOTE 1 - SENAI (5 instituições)...\n');
  
  let inserted = 0;
  let errors = 0;
  
  for (let i = 0; i < institutions.length; i++) {
    const institution = institutions[i];
    
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
      console.log(`   📧 ${institution.email}\n`);
      inserted++;
      
      // Aguarda 3 segundos
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
      console.log('');
    }
  }
  
  console.log('🎉 LOTE 1 CONCLUÍDO!');
  console.log(`✅ Inseridas: ${inserted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${inserted + errors}/5`);
}

insertLote1();
const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 3 - SENAC (5 instituições)
const institutions = [
  {
    nome: "SENAC Lapa Faustolo",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Senac_logo.svg/1200px-Senac_logo.svg.png",
    cnpj: "33333333000301",
    telefone: "(11) 3677-2500",
    email: "contato@senaclapafaustolo.org.br",
    senha: "senacLF2025",
    descricao: "O SENAC Lapa Faustolo oferece cursos técnicos e de qualificação profissional.",
    cep: "05040-000",
    logradouro: "Rua Faustolo",
    numero: "308",
    complemento: "Unidade Lapa Faustolo",
    bairro: "Lapa",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAC Águas Rasas",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Senac_logo.svg/1200px-Senac_logo.svg.png",
    cnpj: "33333333000302",
    telefone: "(11) 2045-4000",
    email: "contato@senacaguasrasas.org.br",
    senha: "senacAR2025",
    descricao: "O SENAC Águas Rasas oferece formação profissional em diversas áreas.",
    cep: "03164-200",
    logradouro: "Avenida Conselheiro Carrão",
    numero: "2423",
    complemento: "Unidade Águas Rasas",
    bairro: "Águas Rasas",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAC Penha",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Senac_logo.svg/1200px-Senac_logo.svg.png",
    cnpj: "33333333000303",
    telefone: "(11) 2225-3400",
    email: "contato@senacpenha.org.br",
    senha: "senacPN2025",
    descricao: "O SENAC Penha oferece cursos técnicos e capacitação profissional.",
    cep: "03636-000",
    logradouro: "Rua Dr. João Ribeiro",
    numero: "683",
    complemento: "Unidade Penha",
    bairro: "Penha",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAC Itaquera",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Senac_logo.svg/1200px-Senac_logo.svg.png",
    cnpj: "33333333000304",
    telefone: "(11) 2205-7000",
    email: "contato@senacitaquera.org.br",
    senha: "senacIT2025",
    descricao: "O SENAC Itaquera oferece formação técnica e profissional de qualidade.",
    cep: "08295-005",
    logradouro: "Avenida Águia de Haia",
    numero: "2633",
    complemento: "Unidade Itaquera",
    bairro: "Itaquera",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAC Santana",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Senac_logo.svg/1200px-Senac_logo.svg.png",
    cnpj: "33333333000305",
    telefone: "(11) 2221-5200",
    email: "contato@senacsantana.org.br",
    senha: "senacST2025",
    descricao: "O SENAC Santana oferece cursos técnicos e de capacitação profissional.",
    cep: "02013-000",
    logradouro: "Avenida Cruzeiro do Sul",
    numero: "1100",
    complemento: "Unidade Santana",
    bairro: "Santana",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  }
];

async function insertLote3() {
  console.log('🚀 Inserindo LOTE 3 - SENAC (5 instituições)...\n');
  
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
  
  console.log('🎉 LOTE 3 CONCLUÍDO!');
  console.log(`✅ Inseridas: ${inserted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${inserted + errors}/5`);
}

insertLote3();
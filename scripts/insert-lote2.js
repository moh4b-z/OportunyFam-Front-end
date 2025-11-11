const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// LOTE 2 - SENAI (5 instituições)
const institutions = [
  {
    nome: "SENAI Brás",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "22222222000201",
    telefone: "(11) 3327-7000",
    email: "contato@senaibras.org.br",
    senha: "senaiBR2025",
    descricao: "O SENAI Brás oferece cursos técnicos e capacitação profissional para a indústria.",
    cep: "03016-040",
    logradouro: "Rua Piratininga",
    numero: "141",
    complemento: "Unidade Brás",
    bairro: "Brás",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Mecânica Ipiranga",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "22222222000202",
    telefone: "(11) 2066-1200",
    email: "contato@senaimecipiranga.org.br",
    senha: "senaiMI2025",
    descricao: "O SENAI Mecânica Ipiranga é especializado em cursos de mecânica industrial.",
    cep: "04206-000",
    logradouro: "Avenida Nazaré",
    numero: "1501",
    complemento: "Unidade Mecânica",
    bairro: "Ipiranga",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Soldagem Santo Amaro",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "22222222000203",
    telefone: "(11) 5643-0100",
    email: "contato@senaisoldagemsa.org.br",
    senha: "senaiSA2025",
    descricao: "O SENAI Soldagem Santo Amaro oferece cursos especializados em soldagem industrial.",
    cep: "04743-030",
    logradouro: "Avenida Alda",
    numero: "680",
    complemento: "Unidade Soldagem",
    bairro: "Santo Amaro",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Automação Vila Leopoldina",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "22222222000204",
    telefone: "(11) 3832-1001",
    email: "contato@senaiautomacao.org.br",
    senha: "senaiAU2025",
    descricao: "O SENAI Automação Vila Leopoldina é especializado em automação industrial.",
    cep: "05302-000",
    logradouro: "Rua Jaguaré",
    numero: "678",
    complemento: "Unidade Automação",
    bairro: "Vila Leopoldina",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  },
  {
    nome: "SENAI Informática Vila Leopoldina",
    foto_perfil: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/SENAI_logo.svg/1200px-SENAI_logo.svg.png",
    cnpj: "22222222000205",
    telefone: "(11) 3832-1002",
    email: "contato@senaiinformatica.org.br",
    senha: "senaiIN2025",
    descricao: "O SENAI Informática Vila Leopoldina oferece cursos de tecnologia da informação.",
    cep: "05302-000",
    logradouro: "Rua Jaguaré",
    numero: "678",
    complemento: "Unidade Informática",
    bairro: "Vila Leopoldina",
    cidade: "São Paulo",
    estado: "SP",
    tipos_instituicao: [1, 2]
  }
];

async function insertLote2() {
  console.log('🚀 Inserindo LOTE 2 - SENAI (5 instituições)...\n');
  
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
  
  console.log('🎉 LOTE 2 CONCLUÍDO!');
  console.log(`✅ Inseridas: ${inserted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${inserted + errors}/5`);
}

insertLote2();
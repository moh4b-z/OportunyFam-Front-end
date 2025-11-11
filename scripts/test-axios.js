const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

async function testWithAxios() {
  console.log('🧪 Testando com axios...\n');
  
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
  
  console.log('📤 Dados sendo enviados:');
  console.log(JSON.stringify(institution, null, 2));
  
  try {
    const response = await axios.post(API_URL, institution, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('\n✅ SUCESSO!');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
  } catch (error) {
    console.log('\n❌ ERRO:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Erro de request:', error.message);
    } else {
      console.log('Erro:', error.message);
    }
  }
}

testWithAxios();
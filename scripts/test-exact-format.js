const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

async function testExactFormat() {
  console.log('🧪 Testando com formato exato do exemplo...\n');
  
  // Usando exatamente o formato do seu exemplo
  const institution = {
    "nome": "SENAI Vila Leopoldina",
    "foto_perfil": "https://meuservidor.com/logos/senai_vila_leopoldina.png",
    "cnpj": "12345678000199",
    "telefone": "(11) 3832-1000",
    "email": "contato@senaivl.org",
    "senha": "senhaForteInstituicao2025",
    "descricao": "O SENAI Vila Leopoldina é uma organização dedicada à educação técnica e profissional.",
    "cep": "05302-000",
    "logradouro": "Rua Jaguaré",
    "numero": "678",
    "complemento": "Próximo ao metrô",
    "bairro": "Vila Leopoldina",
    "cidade": "São Paulo",
    "estado": "SP",
    "tipos_instituicao": [1,2]
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
    } else {
      console.log('Erro:', error.message);
    }
  }
}

testExactFormat();
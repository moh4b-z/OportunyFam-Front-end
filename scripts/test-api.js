const https = require('https');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

function makeGetRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'oportunyfam-back-end.onrender.com',
      port: 443,
      path: '/v1/oportunyfam/instituicoes',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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

    req.end();
  });
}

async function testApi() {
  console.log('🔍 Testando API - Buscando todas as instituições...\n');

  try {
    const result = await makeGetRequest();

    if (result.success) {
      console.log('📄 Resposta da API:');
      console.log(result.data.substring(0, 500) + '...\n');

      let response;
      let institutions;
      try {
        response = JSON.parse(result.data);
        if (!response.instituicoes || !Array.isArray(response.instituicoes)) {
          console.log('❌ A resposta da API não contém um array de instituições.');
          return;
        }
        institutions = response.instituicoes;
        console.log(`✅ Sucesso! Encontradas ${institutions.length} instituições na API.\n`);
      } catch (parseError) {
        console.log('❌ Erro ao fazer parse da resposta JSON:', parseError.message);
        return;
      }

      // Filtrar instituições do LOTE 16 (ESPORTES)
      const lote16Institutions = institutions.filter(inst =>
        inst.nome.includes('Escola de Futebol Barcelona') ||
        inst.nome.includes('Academia de Basquete Corinthians') ||
        inst.nome.includes('Centro de Natação Aquático') ||
        inst.nome.includes('Escola de Vôlei Paulistano') ||
        inst.nome.includes('Academia de Tênis Ibirapuera')
      );

      console.log('🏢 INSTITUIÇÕES DO LOTE 16 (ESPORTES) ENCONTRADAS:');
      console.log('='.repeat(60));

      if (lote16Institutions.length > 0) {
        lote16Institutions.forEach((inst, index) => {
          console.log(`${index + 1}. ${inst.nome}`);
          console.log(`   📍 ${inst.endereco?.logradouro || 'N/A'}, ${inst.endereco?.numero || 'N/A'} - ${inst.endereco?.bairro || 'N/A'}`);
          console.log(`   📮 CEP: ${inst.endereco?.cep || 'N/A'}`);
          console.log(`   📧 ${inst.email}`);
          console.log(`   🆔 ID: ${inst.instituicao_id}`);
          console.log('');
        });

        console.log(`🎉 TOTAL: ${lote16Institutions.length} instituições do LOTE 16 inseridas com sucesso!`);
        console.log('🗺️ Elas agora aparecem na barra de pesquisa e no mapa com endereços reais.');
      } else {
        console.log('❌ Nenhuma instituição do LOTE 16 encontrada na API.');
        console.log('💡 Execute o script populate-batch-real.js para inserir.');
      }

    } else {
      console.log(`❌ Erro na API: ${result.status} - ${result.error}`);
    }

  } catch (error) {
    console.log(`❌ Erro de rede: ${error.message}`);
  }
}

testApi().catch(console.error);

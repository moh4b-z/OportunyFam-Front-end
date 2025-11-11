const axios = require('axios');

const API_URL = 'https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes';

// Função para gerar CNPJ único
function generateCNPJ(lote, index) {
  const base = (lote * 100 + index + 10).toString().padStart(8, '1');
  return `${base}000${(index + 1).toString().padStart(2, '0')}`;
}

// Função para gerar email
function generateEmail(nome) {
  return nome.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[áàâã]/g, 'a')
    .replace(/[éêë]/g, 'e')
    .replace(/[íîï]/g, 'i')
    .replace(/[óôõ]/g, 'o')
    .replace(/[úûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '') + '@educacao.sp.gov.br';
}

// Todos os 18 lotes com endereços corretos
const allLotes = [
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
  },
  {
    lote: 4, categoria: 'SENAC',
    institutions: [
      { nome: 'SENAC Campo Limpo', cep: '05777-000', logradouro: 'Estrada do Campo Limpo', numero: '459', bairro: 'Campo Limpo', telefone: '(11) 5511-7800' },
      { nome: 'SENAC Tatuapé', cep: '03315-000', logradouro: 'Rua Tuiuti', numero: '1237', bairro: 'Tatuapé', telefone: '(11) 2225-3500' },
      { nome: 'SENAC Vila Prudente', cep: '03142-000', logradouro: 'Avenida Professor Luiz Ignácio Anhaia Mello', numero: '2992', bairro: 'Vila Prudente', telefone: '(11) 2274-2300' },
      { nome: 'SENAC Beleza Paulista', cep: '01310-100', logradouro: 'Avenida Paulista', numero: '2064', bairro: 'Cerqueira César', telefone: '(11) 3284-4300' },
      { nome: 'SENAC Administração Santana', cep: '02013-000', logradouro: 'Avenida Cruzeiro do Sul', numero: '1100', bairro: 'Santana', telefone: '(11) 2221-5201' }
    ]
  },
  {
    lote: 5, categoria: 'ETEC',
    institutions: [
      { nome: 'ETEC Getúlio Vargas', cep: '04038-001', logradouro: 'Rua Moreira e Costa', numero: '329', bairro: 'Ipiranga', telefone: '(11) 2066-4200' },
      { nome: 'ETEC Carlos de Campos', cep: '03016-040', logradouro: 'Rua Piratininga', numero: '73', bairro: 'Brás', telefone: '(11) 3327-8000' },
      { nome: 'ETEC Albert Einstein', cep: '01414-001', logradouro: 'Avenida Tiradentes', numero: '615', bairro: 'Cerqueira César', telefone: '(11) 3324-4500' },
      { nome: 'ETEC Camargo Aranha', cep: '03164-000', logradouro: 'Rua Alcântara Machado', numero: '2445', bairro: 'Mooca', telefone: '(11) 2605-3200' },
      { nome: 'ETEC Guaracy Silveira', cep: '05425-070', logradouro: 'Rua Pio XI', numero: '1100', bairro: 'Pinheiros', telefone: '(11) 3021-4400' }
    ]
  },
  {
    lote: 6, categoria: 'ETEC',
    institutions: [
      { nome: 'ETEC Zona Leste', cep: '08295-005', logradouro: 'Avenida Águia de Haia', numero: '2983', bairro: 'Cidade Tiradentes', telefone: '(11) 2205-8000' },
      { nome: 'ETEC Zona Sul', cep: '05777-000', logradouro: 'Estrada do Campo Limpo', numero: '459', bairro: 'Campo Limpo', telefone: '(11) 5511-8900' },
      { nome: 'ETEC Sapopemba', cep: '03345-000', logradouro: 'Rua Sapopemba', numero: '131', bairro: 'Sapopemba', telefone: '(11) 2741-6000' },
      { nome: 'ETEC Itaquera II', cep: '08295-005', logradouro: 'Avenida Águia de Haia', numero: '2633', bairro: 'Itaquera', telefone: '(11) 2205-7001' },
      { nome: 'ETEC Parque da Juventude', cep: '02013-000', logradouro: 'Avenida Cruzeiro do Sul', numero: '2630', bairro: 'Santana', telefone: '(11) 2221-6300' }
    ]
  },
  {
    lote: 7, categoria: 'FATEC',
    institutions: [
      { nome: 'FATEC São Paulo', cep: '01310-100', logradouro: 'Rua Asdrubal do Nascimento', numero: '241', bairro: 'Bela Vista', telefone: '(11) 3284-5500' },
      { nome: 'FATEC Zona Leste', cep: '08295-005', logradouro: 'Avenida Águia de Haia', numero: '2983', bairro: 'Itaquera', telefone: '(11) 2205-9000' },
      { nome: 'FATEC Zona Sul', cep: '04829-300', logradouro: 'Avenida Engenheiro George Craig', numero: '2601', bairro: 'Santo Amaro', telefone: '(11) 5643-1200' },
      { nome: 'FATEC Ipiranga', cep: '04206-000', logradouro: 'Avenida Yervant Kissajikian', numero: '158', bairro: 'Ipiranga', telefone: '(11) 2066-5300' },
      { nome: 'FATEC São Caetano', cep: '09560-135', logradouro: 'Rua Luis Pasteur', numero: '102', bairro: 'São Caetano', telefone: '(11) 4239-3200' }
    ]
  },
  {
    lote: 8, categoria: 'UNIVERSIDADES',
    institutions: [
      { nome: 'USP Universidade de São Paulo', cep: '05508-010', logradouro: 'Rua da Reitoria', numero: '374', bairro: 'Cidade Universitária', telefone: '(11) 3091-3200' },
      { nome: 'UNIFESP Universidade Federal', cep: '04023-062', logradouro: 'Rua Botucatu', numero: '740', bairro: 'Vila Clementino', telefone: '(11) 5576-4000' },
      { nome: 'UFABC Universidade Federal do ABC', cep: '09210-580', logradouro: 'Avenida dos Estados', numero: '5001', bairro: 'Santo André', telefone: '(11) 4996-0000' },
      { nome: 'UNESP Universidade Estadual', cep: '01140-070', logradouro: 'Rua Mário de Andrade', numero: '664', bairro: 'Barra Funda', telefone: '(11) 5627-0100' },
      { nome: 'PUC-SP Pontifícia Universidade', cep: '05014-901', logradouro: 'Rua Monte Alegre', numero: '984', bairro: 'Perdizes', telefone: '(11) 3670-8000' }
    ]
  },
  {
    lote: 9, categoria: 'UNIVERSIDADES PRIVADAS',
    institutions: [
      { nome: 'Mackenzie Universidade Presbiteriana', cep: '01302-907', logradouro: 'Rua da Consolação', numero: '930', bairro: 'Higienópolis', telefone: '(11) 2114-8000' },
      { nome: 'UNINOVE Universidade Nove de Julho', cep: '01156-050', logradouro: 'Rua Vergueiro', numero: '235', bairro: 'Barra Funda', telefone: '(11) 3665-9000' },
      { nome: 'Anhembi Morumbi', cep: '04094-050', logradouro: 'Rua Casa do Ator', numero: '275', bairro: 'Vila Olímpia', telefone: '(11) 4040-8000' },
      { nome: 'ESPM Escola Superior de Propaganda', cep: '04094-050', logradouro: 'Rua Dr. Álvaro Alvim', numero: '123', bairro: 'Vila Olímpia', telefone: '(11) 5085-4500' },
      { nome: 'FGV Fundação Getúlio Vargas', cep: '01310-100', logradouro: 'Rua Itapeva', numero: '474', bairro: 'Bela Vista', telefone: '(11) 3799-7700' }
    ]
  },
  {
    lote: 10, categoria: 'CURSOS DE IDIOMAS',
    institutions: [
      { nome: 'CNA Inglês Vila Madalena', cep: '05433-000', logradouro: 'Rua Harmonia', numero: '356', bairro: 'Vila Madalena', telefone: '(11) 3815-2200' },
      { nome: 'Wizard Inglês Moema', cep: '04038-001', logradouro: 'Avenida Ibirapuera', numero: '2332', bairro: 'Moema', telefone: '(11) 5051-3300' },
      { nome: 'CCAA Inglês Itaim Bibi', cep: '04542-000', logradouro: 'Rua Joaquim Floriano', numero: '466', bairro: 'Itaim Bibi', telefone: '(11) 3078-4400' },
      { nome: 'Cultura Inglesa Paulista', cep: '01310-100', logradouro: 'Avenida Paulista', numero: '2073', bairro: 'Paulista', telefone: '(11) 3170-1500' },
      { nome: 'Fisk Inglês Centro', cep: '01310-100', logradouro: 'Rua Augusta', numero: '1508', bairro: 'Centro', telefone: '(11) 3259-6600' }
    ]
  },
  {
    lote: 11, categoria: 'CURSOS DE IDIOMAS',
    institutions: [
      { nome: 'CNA Inglês Santana', cep: '02013-000', logradouro: 'Avenida Cruzeiro do Sul', numero: '1100', bairro: 'Santana', telefone: '(11) 2221-7700' },
      { nome: 'Wizard Inglês Pinheiros', cep: '05425-070', logradouro: 'Rua dos Pinheiros', numero: '870', bairro: 'Pinheiros', telefone: '(11) 3021-8800' },
      { nome: 'CCAA Inglês Santo Amaro', cep: '04743-030', logradouro: 'Rua Amador Bueno', numero: '504', bairro: 'Santo Amaro', telefone: '(11) 5643-9900' },
      { nome: 'Aliança Francesa Higienópolis', cep: '01302-907', logradouro: 'Rua General Jardim', numero: '618', bairro: 'Higienópolis', telefone: '(11) 3259-1100' },
      { nome: 'Instituto Cervantes Bela Vista', cep: '01310-100', logradouro: 'Rua Itapeva', numero: '474', bairro: 'Bela Vista', telefone: '(11) 3170-2200' }
    ]
  },
  {
    lote: 12, categoria: 'INFORMÁTICA',
    institutions: [
      { nome: 'FIAP Faculdade de Informática', cep: '04094-902', logradouro: 'Avenida Lins de Vasconcelos', numero: '1222', bairro: 'Vila Olímpia', telefone: '(11) 3385-8010' },
      { nome: 'Impacta Tecnologia', cep: '01310-100', logradouro: 'Rua Coronel Oscar Porto', numero: '836', bairro: 'Bela Vista', telefone: '(11) 3254-8300' },
      { nome: 'FATEC Informática Liberdade', cep: '01506-000', logradouro: 'Rua da Liberdade', numero: '532', bairro: 'Liberdade', telefone: '(11) 3208-2100' },
      { nome: '42 São Paulo', cep: '04094-050', logradouro: 'Rua Nunes Machado', numero: '155', bairro: 'Vila Olímpia', telefone: '(11) 3040-4200' },
      { nome: 'Digital House Programação', cep: '05433-000', logradouro: 'Rua Mourato Coelho', numero: '1404', bairro: 'Vila Madalena', telefone: '(11) 3815-5500' }
    ]
  },
  {
    lote: 13, categoria: 'INFORMÁTICA',
    institutions: [
      { nome: 'Alura Cursos Online', cep: '05425-070', logradouro: 'Rua Vergueiro', numero: '3185', bairro: 'Pinheiros', telefone: '(11) 4003-3030' },
      { nome: 'Caelum Java e Mobile', cep: '05433-000', logradouro: 'Rua Vergueiro', numero: '3185', bairro: 'Vila Madalena', telefone: '(11) 3815-6600' },
      { nome: 'Lambda3 .NET e Cloud', cep: '04542-000', logradouro: 'Rua Joaquim Floriano', numero: '466', bairro: 'Itaim Bibi', telefone: '(11) 3078-7700' },
      { nome: 'K21 Desenvolvimento Ágil', cep: '04094-050', logradouro: 'Rua Dr. Álvaro Alvim', numero: '123', bairro: 'Vila Olímpia', telefone: '(11) 3040-8800' },
      { nome: 'Globalcode Java Expert', cep: '04038-001', logradouro: 'Avenida Ibirapuera', numero: '2927', bairro: 'Moema', telefone: '(11) 5051-9900' }
    ]
  },
  {
    lote: 14, categoria: 'SAÚDE',
    institutions: [
      { nome: 'ETEC Enfermagem Santa Ifigênia', cep: '01201-010', logradouro: 'Rua Santa Ifigênia', numero: '454', bairro: 'Santa Ifigênia', telefone: '(11) 3324-1100' },
      { nome: 'SENAC Enfermagem Águas Rasas', cep: '03164-200', logradouro: 'Avenida Conselheiro Carrão', numero: '2423', bairro: 'Águas Rasas', telefone: '(11) 2045-2200' },
      { nome: 'UNIFESP Medicina', cep: '04023-062', logradouro: 'Rua Botucatu', numero: '740', bairro: 'Vila Clementino', telefone: '(11) 5576-3300' },
      { nome: 'Santa Casa Medicina', cep: '01221-020', logradouro: 'Rua Dr. Cesário Mota Jr', numero: '112', bairro: 'Santa Cecília', telefone: '(11) 2176-7000' },
      { nome: 'SENAC Enfermagem Santo Amaro', cep: '04743-030', logradouro: 'Rua Amador Bueno', numero: '504', bairro: 'Santo Amaro', telefone: '(11) 5643-4400' }
    ]
  },
  {
    lote: 15, categoria: 'GASTRONOMIA',
    institutions: [
      { nome: 'SENAC Culinária Águas Rasas', cep: '03164-200', logradouro: 'Avenida Conselheiro Carrão', numero: '2423', bairro: 'Águas Rasas', telefone: '(11) 2045-5500' },
      { nome: 'Instituto Gastronômico das Américas', cep: '04038-001', logradouro: 'Avenida Ibirapuera', numero: '2927', bairro: 'Moema', telefone: '(11) 5051-6600' },
      { nome: 'HOTEC Gastronomia', cep: '01310-100', logradouro: 'Rua Augusta', numero: '1826', bairro: 'Bela Vista', telefone: '(11) 3259-7700' },
      { nome: 'SENAC Culinária Lapa', cep: '05040-000', logradouro: 'Rua Faustolo', numero: '308', bairro: 'Lapa', telefone: '(11) 3677-8800' },
      { nome: 'Centro Culinário Vila Madalena', cep: '05433-000', logradouro: 'Rua Aspicuelta', numero: '422', bairro: 'Vila Madalena', telefone: '(11) 3815-9900' }
    ]
  },
  {
    lote: 16, categoria: 'ESPORTES',
    institutions: [
      { nome: 'Escola de Futebol Barcelona', cep: '05433-000', logradouro: 'Rua Harmonia', numero: '765', bairro: 'Vila Madalena', telefone: '(11) 3815-1100' },
      { nome: 'Academia de Basquete Corinthians', cep: '03315-000', logradouro: 'Rua Tuiuti', numero: '1237', bairro: 'Tatuapé', telefone: '(11) 2225-2200' },
      { nome: 'Centro de Natação Aquático', cep: '04038-001', logradouro: 'Avenida Ibirapuera', numero: '3103', bairro: 'Moema', telefone: '(11) 5051-3300' },
      { nome: 'Escola de Vôlei Paulistano', cep: '01310-100', logradouro: 'Rua Oscar Freire', numero: '379', bairro: 'Jardins', telefone: '(11) 3170-4400' },
      { nome: 'Academia de Tênis Ibirapuera', cep: '04094-050', logradouro: 'Rua Funchal', numero: '418', bairro: 'Vila Olímpia', telefone: '(11) 3040-5500' }
    ]
  },
  {
    lote: 17, categoria: 'ESPORTES',
    institutions: [
      { nome: 'Centro de Artes Marciais', cep: '01506-000', logradouro: 'Rua da Liberdade', numero: '532', bairro: 'Liberdade', telefone: '(11) 3208-6600' },
      { nome: 'Escola de Futebol Santos', cep: '04743-030', logradouro: 'Rua Amador Bueno', numero: '504', bairro: 'Santo Amaro', telefone: '(11) 5643-7700' },
      { nome: 'Academia de Ginástica Rítmica', cep: '05425-070', logradouro: 'Rua dos Pinheiros', numero: '870', bairro: 'Pinheiros', telefone: '(11) 3021-8800' },
      { nome: 'Centro de Judô Ippon', cep: '02013-000', logradouro: 'Avenida Cruzeiro do Sul', numero: '1100', bairro: 'Santana', telefone: '(11) 2221-9900' },
      { nome: 'Escola de Capoeira Cordão de Ouro', cep: '05040-000', logradouro: 'Rua Faustolo', numero: '308', bairro: 'Lapa', telefone: '(11) 3677-1100' }
    ]
  },
  {
    lote: 18, categoria: 'MÚSICA E ARTES',
    institutions: [
      { nome: 'Conservatório Musical Souza Lima', cep: '01302-907', logradouro: 'Rua General Jardim', numero: '618', bairro: 'Higienópolis', telefone: '(11) 3259-2200' },
      { nome: 'Escola de Música Tom Jobim', cep: '05433-000', logradouro: 'Rua Harmonia', numero: '356', bairro: 'Vila Madalena', telefone: '(11) 3815-3300' },
      { nome: 'Academia de Violão Clássico', cep: '03164-000', logradouro: 'Rua Alcântara Machado', numero: '2445', bairro: 'Mooca', telefone: '(11) 2605-4400' },
      { nome: 'Centro de Artes Visuais', cep: '01310-100', logradouro: 'Rua Augusta', numero: '1826', bairro: 'Bela Vista', telefone: '(11) 3259-5500' },
      { nome: 'Escola de Dança Balé da Cidade', cep: '01310-100', logradouro: 'Rua Augusta', numero: '1508', bairro: 'Centro', telefone: '(11) 3259-6600' }
    ]
  }
];

async function insertAllLotes() {
  console.log('🚀 Iniciando inserção de TODOS OS 17 LOTES RESTANTES (85 instituições)...\n');
  console.log('⚠️  LOTE 1 já foi inserido com sucesso anteriormente.\n');
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  for (const lote of allLotes) {
    console.log(`\n📦 === LOTE ${lote.lote} - ${lote.categoria} (${lote.institutions.length} instituições) ===`);
    
    for (let i = 0; i < lote.institutions.length; i++) {
      const inst = lote.institutions[i];
      
      const institution = {
        nome: inst.nome,
        foto_perfil: `https://via.placeholder.com/300x200/0066cc/ffffff?text=${encodeURIComponent(lote.categoria)}`,
        cnpj: generateCNPJ(lote.lote, i),
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
        
        const response = await axios.post(API_URL, institution, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        console.log(`✅ ${institution.nome} - Inserida com sucesso!`);
        console.log(`   📍 ${institution.logradouro}, ${institution.numero} - ${institution.bairro}`);
        totalInserted++;
        
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
        totalErrors++;
      }
    }
    
    console.log(`\n⏰ Lote ${lote.lote} concluído. Aguardando 30 segundos antes do próximo lote...`);
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  console.log('\n🎉 TODOS OS 17 LOTES RESTANTES CONCLUÍDOS!');
  console.log(`✅ Total inseridas: ${totalInserted}`);
  console.log(`❌ Total com erro: ${totalErrors}`);
  console.log(`📊 Total processadas: ${totalInserted + totalErrors}/85`);
  console.log('\n🏆 RESUMO FINAL:');
  console.log('   • LOTE 1: 5 instituições (já inseridas)');
  console.log(`   • LOTES 2-18: ${totalInserted} instituições inseridas`);
  console.log(`   • TOTAL GERAL: ${5 + totalInserted} instituições na API!`);
}

insertAllLotes();
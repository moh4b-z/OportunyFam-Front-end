// BASE MASSIVA DE INSTITUIÇÕES DE SÃO PAULO - EDUCAÇÃO, ESPORTES E CULTURA
export const saoPauloInstitutions: Record<string, Array<{
  name: string;
  institution: string;
  location: string;
  coords: [number, number];  // Garantindo que coords seja uma tupla [number, number]
}>> = {
  // SENAI - TODAS AS UNIDADES
  senai: [
    {name: 'SENAI Vila Leopoldina - Mariano Ferraz', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267891, -46.7378234]},
    {name: 'SENAI Barra Funda - Roberto Simonsen', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186432, -46.6506789]},
    {name: 'SENAI Ipiranga - Mário Amato', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875123, -46.6103456]},
    {name: 'SENAI Santo Amaro - Luiz Varga', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528567, -46.7081234]},
    {name: 'SENAI Mooca - Conde José Vicente de Azevedo', institution: 'SENAI', location: 'Mooca', coords: [-23.5506789, -46.5997123]},
    {name: 'SENAI Morumbi - Orlando Laviero Ferraiuolo', institution: 'SENAI', location: 'Morumbi', coords: [-23.6167234, -46.7000567]},
    {name: 'SENAI Sumaré - Theobaldo De Nigris', institution: 'SENAI', location: 'Sumaré', coords: [-23.5378456, -46.6747891]},
    {name: 'SENAI Jabaquara - Almirante Tamandaré', institution: 'SENAI', location: 'Jabaquara', coords: [-23.6528123, -46.6431789]},
    {name: 'SENAI Vila Alpina - Henrique Lupo', institution: 'SENAI', location: 'Vila Alpina', coords: [-23.5729567, -46.5664234]},
    {name: 'SENAI Brás - Hermínio Ometto', institution: 'SENAI', location: 'Brás', coords: [-23.5378234, -46.6186567]}
  ],
  
  // SENAC - TODAS AS UNIDADES
  senac: [
    {name: 'SENAC Paulista', institution: 'SENAC', location: 'Paulista', coords: [-23.5618234, -46.6565789]},
    {name: 'SENAC Lapa Faustolo', institution: 'SENAC', location: 'Lapa', coords: [-23.5267456, -46.7017123]},
    {name: 'SENAC Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506678, -46.5664345]},
    {name: 'SENAC Santo Amaro', institution: 'SENAC', location: 'Santo Amaro', coords: [-23.6528891, -46.7081567]},
    {name: 'SENAC Penha', institution: 'SENAC', location: 'Penha', coords: [-23.5267123, -46.5431789]},
    {name: 'SENAC Itaquera', institution: 'SENAC', location: 'Itaquera', coords: [-23.5378345, -46.4581234]},
    {name: 'SENAC Santana', institution: 'SENAC', location: 'Santana', coords: [-23.5186567, -46.6264456]},
    {name: 'SENAC Campo Limpo', institution: 'SENAC', location: 'Campo Limpo', coords: [-23.6389789, -46.7664123]},
    {name: 'SENAC Tatuapé', institution: 'SENAC', location: 'Tatuapé', coords: [-23.5378234, -46.5664678]},
    {name: 'SENAC Vila Prudente', institution: 'SENAC', location: 'Vila Prudente', coords: [-23.5875456, -46.5831234]}
  ],
  
  // ETEC - ESCOLAS TÉCNICAS ESTADUAIS
  etec: [
    {name: 'ETEC Getúlio Vargas - Ipiranga', institution: 'ETEC', location: 'Ipiranga', coords: [-23.5875678, -46.6103234]},
    {name: 'ETEC Carlos de Campos - Brás', institution: 'ETEC', location: 'Brás', coords: [-23.5378901, -46.6186567]},
    {name: 'ETEC Albert Einstein - Cerqueira César', institution: 'ETEC', location: 'Cerqueira César', coords: [-23.5618345, -46.6565891]},
    {name: 'ETEC Camargo Aranha - Mooca', institution: 'ETEC', location: 'Mooca', coords: [-23.5506789, -46.5997123]},
    {name: 'ETEC Guaracy Silveira - Pinheiros', institution: 'ETEC', location: 'Pinheiros', coords: [-23.5729234, -46.6889456]},
    {name: 'ETEC Zona Leste - Cidade Tiradentes', institution: 'ETEC', location: 'Cidade Tiradentes', coords: [-23.5967567, -46.4031789]},
    {name: 'ETEC Zona Sul - Campo Limpo', institution: 'ETEC', location: 'Campo Limpo', coords: [-23.6389123, -46.7664345]},
    {name: 'ETEC Sapopemba', institution: 'ETEC', location: 'Sapopemba', coords: [-23.6167456, -46.4831678]},
    {name: 'ETEC Itaquera II', institution: 'ETEC', location: 'Itaquera', coords: [-23.5378789, -46.4581234]},
    {name: 'ETEC Parque da Juventude', institution: 'ETEC', location: 'Santana', coords: [-23.5186345, -46.6264567]}
  ],
  
  // FATEC - FACULDADES DE TECNOLOGIA
  fatec: [
    {name: 'FATEC São Paulo - Bela Vista', institution: 'FATEC', location: 'Bela Vista', coords: [-23.5618, -46.6565]},
    {name: 'FATEC Zona Leste - Itaquera', institution: 'FATEC', location: 'Itaquera', coords: [-23.5378, -46.4581]},
    {name: 'FATEC Zona Sul - Santo Amaro', institution: 'FATEC', location: 'Santo Amaro', coords: [-23.6528, -46.7081]},
    {name: 'FATEC Ipiranga', institution: 'FATEC', location: 'Ipiranga', coords: [-23.5875, -46.6103]},
    {name: 'FATEC São Caetano', institution: 'FATEC', location: 'São Caetano', coords: [-23.6167, -46.5664]},
    {name: 'FATEC Osasco', institution: 'FATEC', location: 'Osasco', coords: [-23.5267, -46.7917]}
  ],
  
  // UNIVERSIDADES PÚBLICAS
  universidades_publicas: [
    {name: 'USP - Universidade de São Paulo', institution: 'USP', location: 'Cidade Universitária', coords: [-23.5586, -46.7311]},
    {name: 'UNIFESP - Universidade Federal', institution: 'UNIFESP', location: 'Vila Clementino', coords: [-23.5967, -46.6431]},
    {name: 'UFABC - Universidade Federal do ABC', institution: 'UFABC', location: 'Santo André', coords: [-23.6528, -46.5431]},
    {name: 'UNESP - Universidade Estadual Paulista', institution: 'UNESP', location: 'Barra Funda', coords: [-23.5186, -46.6506]}
  ],
  
  // UNIVERSIDADES PRIVADAS
  universidades_privadas: [
    {name: 'PUC-SP - Pontifícia Universidade Católica', institution: 'PUC-SP', location: 'Perdizes', coords: [-23.5378, -46.6747]},
    {name: 'Mackenzie - Universidade Presbiteriana', institution: 'Mackenzie', location: 'Higienópolis', coords: [-23.5378, -46.6506]},
    {name: 'UNINOVE - Universidade Nove de Julho', institution: 'UNINOVE', location: 'Barra Funda', coords: [-23.5186, -46.6506]},
    {name: 'Anhembi Morumbi', institution: 'Anhembi', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]},
    {name: 'ESPM - Escola Superior de Propaganda', institution: 'ESPM', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]},
    {name: 'FGV - Fundação Getúlio Vargas', institution: 'FGV', location: 'Bela Vista', coords: [-23.5618, -46.6565]},
    {name: 'FIAP - Faculdade de Informática', institution: 'FIAP', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]},
    {name: 'Belas Artes', institution: 'Belas Artes', location: 'Pinheiros', coords: [-23.5729, -46.6889]},
    {name: 'FECAP', institution: 'FECAP', location: 'Liberdade', coords: [-23.5587, -46.6347]},
    {name: 'Santa Casa - Faculdade de Medicina', institution: 'Santa Casa', location: 'Santa Cecília', coords: [-23.5378, -46.6506]}
  ],
  
  // CURSOS DE IDIOMAS - INGLÊS E OUTROS
  idiomas: [
    {name: 'CNA Inglês - Vila Madalena', institution: 'CNA', location: 'Vila Madalena', coords: [-23.5506234, -46.6889567]},
    {name: 'Wizard Inglês - Moema', institution: 'Wizard', location: 'Moema', coords: [-23.5967456, -46.6631789]},
    {name: 'CCAA Inglês - Itaim Bibi', institution: 'CCAA', location: 'Itaim Bibi', coords: [-23.5875678, -46.6747234]},
    {name: 'Cultura Inglesa - Paulista', institution: 'Cultura Inglesa', location: 'Paulista', coords: [-23.5618891, -46.6565456]},
    {name: 'Fisk Inglês - Centro', institution: 'Fisk', location: 'Centro', coords: [-23.5505234, -46.6333678]},
    {name: 'CNA Inglês - Santana', institution: 'CNA', location: 'Santana', coords: [-23.5186567, -46.6264891]},
    {name: 'Wizard Inglês - Pinheiros', institution: 'Wizard', location: 'Pinheiros', coords: [-23.5729789, -46.6889234]},
    {name: 'CCAA Inglês - Santo Amaro', institution: 'CCAA', location: 'Santo Amaro', coords: [-23.6528345, -46.7081567]},
    {name: 'Aliança Francesa - Higienópolis', institution: 'Aliança Francesa', location: 'Higienópolis', coords: [-23.5378123, -46.6506789]},
    {name: 'Instituto Cervantes - Bela Vista', institution: 'Cervantes', location: 'Bela Vista', coords: [-23.5618456, -46.6565234]},
    {name: 'CNA Inglês - Tatuapé', institution: 'CNA', location: 'Tatuapé', coords: [-23.5378678, -46.5664345]},
    {name: 'Wizard Inglês - Ipiranga', institution: 'Wizard', location: 'Ipiranga', coords: [-23.5875234, -46.6103567]},
    {name: 'CCAA Inglês - Lapa', institution: 'CCAA', location: 'Lapa', coords: [-23.5267891, -46.7017456]},
    {name: 'Fisk Inglês - Liberdade', institution: 'Fisk', location: 'Liberdade', coords: [-23.5587567, -46.6347123]},
    {name: 'Cultura Inglesa - Morumbi', institution: 'Cultura Inglesa', location: 'Morumbi', coords: [-23.6167345, -46.7000678]},
    {name: 'CNA Inglês - Penha', institution: 'CNA', location: 'Penha', coords: [-23.5267456, -46.5431234]},
    {name: 'Wizard Inglês - Campo Limpo', institution: 'Wizard', location: 'Campo Limpo', coords: [-23.6389789, -46.7664123]},
    {name: 'CCAA Inglês - Itaquera', institution: 'CCAA', location: 'Itaquera', coords: [-23.5378234, -46.4581678]},
    {name: 'Fisk Inglês - Vila Prudente', institution: 'Fisk', location: 'Vila Prudente', coords: [-23.5875567, -46.5831234]},
    {name: 'Cultura Inglesa - Jardins', institution: 'Cultura Inglesa', location: 'Jardins', coords: [-23.5618123, -46.6565789]},
    {name: 'CNA Inglês - Osasco', institution: 'CNA', location: 'Osasco', coords: [-23.5267678, -46.7917234]},
    {name: 'Wizard Inglês - Casa Verde', institution: 'Wizard', location: 'Casa Verde', coords: [-23.4889345, -46.6506567]},
    {name: 'CCAA Inglês - Tucuruvi', institution: 'CCAA', location: 'Tucuruvi', coords: [-23.4667891, -46.6031234]},
    {name: 'Fisk Inglês - São Mateus', institution: 'Fisk', location: 'São Mateus', coords: [-23.6167456, -46.4581345]},
    {name: 'Cultura Inglesa - Butantã', institution: 'Cultura Inglesa', location: 'Butantã', coords: [-23.5729123, -46.7378567]},
    {name: 'Open English - Online SP', institution: 'Open English', location: 'Vila Olímpia', coords: [-23.5967789, -46.6889345]},
    {name: 'Cambly - Convers. Online', institution: 'Cambly', location: 'Pinheiros', coords: [-23.5729456, -46.6889678]},
    {name: 'Preply - Aulas Particulares', institution: 'Preply', location: 'Itaim Bibi', coords: [-23.5875234, -46.6747891]},
    {name: 'iTalki - Idiomas Online', institution: 'iTalki', location: 'Vila Madalena', coords: [-23.5506567, -46.6889234]},
    {name: 'Babbel - App de Idiomas', institution: 'Babbel', location: 'Jardins', coords: [-23.5618789, -46.6565345]},
    {name: 'Duolingo Plus - SP', institution: 'Duolingo', location: 'Centro', coords: [-23.5505678, -46.6333456]},
    {name: 'Rosetta Stone - SP', institution: 'Rosetta Stone', location: 'Moema', coords: [-23.5967123, -46.6631567]},
    {name: 'EF English Live - SP', institution: 'EF', location: 'Paulista', coords: [-23.5618345, -46.6565678]},
    {name: 'Wall Street English', institution: 'Wall Street', location: 'Faria Lima', coords: [-23.5875456, -46.6747234]},
    {name: 'Berlitz Language Center', institution: 'Berlitz', location: 'Vila Olímpia', coords: [-23.5967567, -46.6889123]},
    {name: 'IBEU - Instituto Brasil EUA', institution: 'IBEU', location: 'Copacabana SP', coords: [-23.5618234, -46.6565891]},
    {name: 'Casa Thomas Jefferson SP', institution: 'Thomas Jefferson', location: 'Jardins', coords: [-23.5618678, -46.6565234]},
    {name: 'Britannia Language School', institution: 'Britannia', location: 'Higienópolis', coords: [-23.5378891, -46.6506345]},
    {name: 'American Language Course', institution: 'American', location: 'Vila Madalena', coords: [-23.5506789, -46.6889567]},
    {name: 'English Studio - Convers.', institution: 'English Studio', location: 'Pinheiros', coords: [-23.5729234, -46.6889891]},
    {name: 'Speak Up Language School', institution: 'Speak Up', location: 'Moema', coords: [-23.5967345, -46.6631234]},
    {name: 'Global Language Center', institution: 'Global Language', location: 'Itaim Bibi', coords: [-23.5875678, -46.6747567]},
    {name: 'International House SP', institution: 'International House', location: 'Vila Olímpia', coords: [-23.5967891, -46.6889456]},
    {name: 'Cambridge English SP', institution: 'Cambridge', location: 'Jardins', coords: [-23.5618456, -46.6565123]},
    {name: 'Oxford School SP', institution: 'Oxford', location: 'Paulista', coords: [-23.5618789, -46.6565678]}
  ],
  
  // CURSOS TÉCNICOS ESPECÍFICOS - INFORMÁTICA
  informatica: [
    {name: 'FIAP - Informática', institution: 'FIAP', location: 'Vila Olímpia', coords: [-23.5967234, -46.6889567]},
    {name: 'Impacta Tecnologia', institution: 'Impacta', location: 'Bela Vista', coords: [-23.5618678, -46.6565234]},
    {name: 'SENAI Informática - Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267891, -46.7378234]},
    {name: 'FATEC Informática - Liberdade', institution: 'FATEC', location: 'Liberdade', coords: [-23.5587345, -46.6347891]},
    {name: 'ETEC Informática - Cidade Tiradentes', institution: 'ETEC', location: 'Cidade Tiradentes', coords: [-23.5967456, -46.4031123]},
    {name: 'SENAC Informática - Penha', institution: 'SENAC', location: 'Penha', coords: [-23.5267123, -46.5431789]},
    {name: '42 São Paulo', institution: '42', location: 'Vila Olímpia', coords: [-23.5967789, -46.6889345]},
    {name: 'Digital House - Programação', institution: 'Digital House', location: 'Vila Madalena', coords: [-23.5506234, -46.6889678]},
    {name: 'Alura - Cursos Online', institution: 'Alura', location: 'Pinheiros', coords: [-23.5729567, -46.6889891]},
    {name: 'Caelum - Java e Mobile', institution: 'Caelum', location: 'Vila Madalena', coords: [-23.5506789, -46.6889234]},
    {name: 'Lambda3 - .NET e Cloud', institution: 'Lambda3', location: 'Itaim Bibi', coords: [-23.5875123, -46.6747456]},
    {name: 'K21 - Desenvolvimento Ágil', institution: 'K21', location: 'Vila Olímpia', coords: [-23.5967345, -46.6889789]},
    {name: 'Globalcode - Java Expert', institution: 'Globalcode', location: 'Moema', coords: [-23.5967678, -46.6631234]},
    {name: 'DevMedia - Programação Web', institution: 'DevMedia', location: 'Centro', coords: [-23.5505891, -46.6333456]},
    {name: 'Cod3r - Desenvolvimento Full Stack', institution: 'Cod3r', location: 'Jardins', coords: [-23.5618234, -46.6565678]},
    {name: 'Rocketseat - Node.js e React', institution: 'Rocketseat', location: 'Vila Madalena', coords: [-23.5506456, -46.6889123]},
    {name: 'Treinaweb - Cursos de TI', institution: 'Treinaweb', location: 'Liberdade', coords: [-23.5587678, -46.6347234]},
    {name: 'Udemy Business - SP', institution: 'Udemy', location: 'Faria Lima', coords: [-23.5875789, -46.6747123]},
    {name: 'Coursera Partner - USP', institution: 'Coursera', location: 'Cidade Universitária', coords: [-23.5586234, -46.7311567]},
    {name: 'edX Microsoft - Paulista', institution: 'edX', location: 'Paulista', coords: [-23.5618567, -46.6565891]},
    {name: 'Pluralsight - Tecnologia', institution: 'Pluralsight', location: 'Itaim Bibi', coords: [-23.5875456, -46.6747789]},
    {name: 'Linux Professional Institute', institution: 'LPI', location: 'Vila Olímpia', coords: [-23.5967123, -46.6889456]},
    {name: 'Oracle University - SP', institution: 'Oracle', location: 'Morumbi', coords: [-23.6167789, -46.7000345]},
    {name: 'Microsoft Learn - São Paulo', institution: 'Microsoft', location: 'Faria Lima', coords: [-23.5875234, -46.6747567]},
    {name: 'Google Developers - SP', institution: 'Google', location: 'Vila Olímpia', coords: [-23.5967456, -46.6889678]},
    {name: 'AWS Training Center', institution: 'AWS', location: 'Itaim Bibi', coords: [-23.5875678, -46.6747234]},
    {name: 'IBM SkillsBuild - SP', institution: 'IBM', location: 'Vila Olímpia', coords: [-23.5967891, -46.6889123]},
    {name: 'Cisco Networking Academy', institution: 'Cisco', location: 'Pinheiros', coords: [-23.5729234, -46.6889567]},
    {name: 'Red Hat Training - SP', institution: 'Red Hat', location: 'Itaim Bibi', coords: [-23.5875345, -46.6747891]},
    {name: 'VMware Education - SP', institution: 'VMware', location: 'Vila Olímpia', coords: [-23.5967567, -46.6889234]},
    {name: 'Salesforce Trailhead - SP', institution: 'Salesforce', location: 'Faria Lima', coords: [-23.5875789, -46.6747456]},
    {name: 'Adobe Creative Campus', institution: 'Adobe', location: 'Vila Madalena', coords: [-23.5506678, -46.6889345]},
    {name: 'Autodesk Design Academy', institution: 'Autodesk', location: 'Vila Olímpia', coords: [-23.5967234, -46.6889789]},
    {name: 'Unity Learn - Game Dev', institution: 'Unity', location: 'Pinheiros', coords: [-23.5729456, -46.6889123]},
    {name: 'Epic Games Unreal Engine', institution: 'Epic Games', location: 'Vila Olímpia', coords: [-23.5967678, -46.6889456]},
    {name: 'NVIDIA Deep Learning', institution: 'NVIDIA', location: 'Itaim Bibi', coords: [-23.5875123, -46.6747678]},
    {name: 'Intel AI Academy', institution: 'Intel', location: 'Vila Olímpia', coords: [-23.5967345, -46.6889567]},
    {name: 'Samsung Innovation Campus', institution: 'Samsung', location: 'Morumbi', coords: [-23.6167456, -46.7000678]},
    {name: 'Huawei ICT Academy', institution: 'Huawei', location: 'Vila Olímpia', coords: [-23.5967789, -46.6889234]},
    {name: 'Dell Technologies Education', institution: 'Dell', location: 'Itaim Bibi', coords: [-23.5875567, -46.6747345]},
    {name: 'HP Education Services', institution: 'HP', location: 'Vila Olímpia', coords: [-23.5967234, -46.6889678]}
  ],
  
  // CURSOS DE SAÚDE
  saude: [
    {name: 'ETEC Enfermagem - Santa Ifigênia', institution: 'ETEC', location: 'Santa Ifigênia', coords: [-23.5378234, -46.6406789]},
    {name: 'SENAC Enfermagem - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506567, -46.5664123]},
    {name: 'UNIFESP - Medicina', institution: 'UNIFESP', location: 'Vila Clementino', coords: [-23.5967891, -46.6431456]},
    {name: 'Santa Casa - Medicina', institution: 'Santa Casa', location: 'Santa Cecília', coords: [-23.5378345, -46.6506678]},
    {name: 'SENAC Enfermagem - Santo Amaro', institution: 'SENAC', location: 'Santo Amaro', coords: [-23.6528789, -46.7081234]},
    {name: 'ETEC Enfermagem - Itaquera', institution: 'ETEC', location: 'Itaquera', coords: [-23.5378123, -46.4581567]},
    {name: 'Anhembi - Enfermagem', institution: 'Anhembi', location: 'Vila Olímpia', coords: [-23.5967456, -46.6889123]}
  ],
  
  // CURSOS DE GASTRONOMIA
  gastronomia: [
    {name: 'SENAC Culinária - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506234, -46.5664789]},
    {name: 'Instituto Gastronômico das Américas', institution: 'IGA', location: 'Moema', coords: [-23.5967567, -46.6631234]},
    {name: 'HOTEC Gastronomia', institution: 'HOTEC', location: 'Bela Vista', coords: [-23.5618891, -46.6565456]},
    {name: 'SENAC Culinária - Lapa', institution: 'SENAC', location: 'Lapa', coords: [-23.5267345, -46.7017678]},
    {name: 'Anhembi - Gastronomia', institution: 'Anhembi', location: 'Vila Olímpia', coords: [-23.5967123, -46.6889567]},
    {name: 'Centro Culinário - Vila Madalena', institution: 'Centro Culinário', location: 'Vila Madalena', coords: [-23.5506789, -46.6889234]}
  ],

  // REGIÃO NORTE
  zona_norte: [
    {name: 'SENAI Santana', institution: 'SENAI', location: 'Santana', coords: [-23.5186234, -46.6264567]},
    {name: 'ETEC Parque Belém', institution: 'ETEC', location: 'Belém', coords: [-23.5186789, -46.5831234]},
    {name: 'SENAC Casa Verde', institution: 'SENAC', location: 'Casa Verde', coords: [-23.4889345, -46.6506678]},
    {name: 'FATEC Zona Norte', institution: 'FATEC', location: 'Santana', coords: [-23.5186567, -46.6264891]},
    {name: 'ETEC Tucuruvi', institution: 'ETEC', location: 'Tucuruvi', coords: [-23.4667123, -46.6031456]},
    {name: 'SENAC Mandaqui', institution: 'SENAC', location: 'Mandaqui', coords: [-23.4889678, -46.6264234]},
    {name: 'UNINOVE Santana', institution: 'UNINOVE', location: 'Santana', coords: [-23.5186891, -46.6264345]},
    {name: 'Anhanguera Santana', institution: 'Anhanguera', location: 'Santana', coords: [-23.5186456, -46.6264789]}
  ],

  // REGIÃO SUL
  zona_sul: [
    {name: 'SENAI Santo Amaro', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528234, -46.7081567]},
    {name: 'ETEC Campo Limpo', institution: 'ETEC', location: 'Campo Limpo', coords: [-23.6389678, -46.7664234]},
    {name: 'SENAC Jabaquara', institution: 'SENAC', location: 'Jabaquara', coords: [-23.6528891, -46.6431456]},
    {name: 'FATEC Zona Sul', institution: 'FATEC', location: 'Santo Amaro', coords: [-23.6528345, -46.7081789]},
    {name: 'ETEC Cidade Dutra', institution: 'ETEC', location: 'Cidade Dutra', coords: [-23.7167123, -46.6889567]},
    {name: 'SENAC Campo Limpo', institution: 'SENAC', location: 'Campo Limpo', coords: [-23.6389456, -46.7664891]},
    {name: 'UNINOVE Santo Amaro', institution: 'UNINOVE', location: 'Santo Amaro', coords: [-23.6528567, -46.7081234]},
    {name: 'ETEC Sapopemba', institution: 'ETEC', location: 'Sapopemba', coords: [-23.6167789, -46.4831345]},
    {name: 'SENAC Vila Prudente', institution: 'SENAC', location: 'Vila Prudente', coords: [-23.5875234, -46.5831678]},
    {name: 'ETEC Heliópolis', institution: 'ETEC', location: 'Heliópolis', coords: [-23.6167456, -46.5997123]}
  ],

  // REGIÃO LESTE
  zona_leste: [
    {name: 'SENAI Vila Alpina', institution: 'SENAI', location: 'Vila Alpina', coords: [-23.5729234, -46.5664567]},
    {name: 'ETEC Itaquera', institution: 'ETEC', location: 'Itaquera', coords: [-23.5378678, -46.4581234]},
    {name: 'SENAC Penha', institution: 'SENAC', location: 'Penha', coords: [-23.5267891, -46.5431456]},
    {name: 'FATEC Zona Leste', institution: 'FATEC', location: 'Itaquera', coords: [-23.5378345, -46.4581789]},
    {name: 'ETEC Cidade Tiradentes', institution: 'ETEC', location: 'Cidade Tiradentes', coords: [-23.5967123, -46.4031567]},
    {name: 'SENAC Tatuapé', institution: 'SENAC', location: 'Tatuapé', coords: [-23.5378456, -46.5664891]},
    {name: 'UNINOVE Tatuapé', institution: 'UNINOVE', location: 'Tatuapé', coords: [-23.5378789, -46.5664234]},
    {name: 'ETEC São Mateus', institution: 'ETEC', location: 'São Mateus', coords: [-23.6167567, -46.4581345]},
    {name: 'SENAC Itaquera', institution: 'SENAC', location: 'Itaquera', coords: [-23.5378234, -46.4581678]},
    {name: 'ETEC Guaianases', institution: 'ETEC', location: 'Guaianases', coords: [-23.5378891, -46.4031234]}
  ],

  // REGIÃO OESTE
  zona_oeste: [
    {name: 'SENAI Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267345, -46.7378678]},
    {name: 'ETEC Pinheiros', institution: 'ETEC', location: 'Pinheiros', coords: [-23.5729891, -46.6889234]},
    {name: 'SENAC Lapa', institution: 'SENAC', location: 'Lapa', coords: [-23.5267123, -46.7017567]},
    {name: 'FATEC Osasco', institution: 'FATEC', location: 'Osasco', coords: [-23.5267456, -46.7917234]},
    {name: 'ETEC Butantã', institution: 'ETEC', location: 'Butantã', coords: [-23.5729567, -46.7378891]},
    {name: 'SENAC Osasco', institution: 'SENAC', location: 'Osasco', coords: [-23.5267789, -46.7917456]},
    {name: 'UNINOVE Osasco', institution: 'UNINOVE', location: 'Osasco', coords: [-23.5267234, -46.7917678]},
    {name: 'ETEC Raposo Tavares', institution: 'ETEC', location: 'Raposo Tavares', coords: [-23.5729678, -46.7664234]},
    {name: 'SENAC Pirituba', institution: 'SENAC', location: 'Pirituba', coords: [-23.4889345, -46.7378567]},
    {name: 'ETEC Jaguaré', institution: 'ETEC', location: 'Jaguaré', coords: [-23.5506891, -46.7378234]}
  ],

  // REGIÃO CENTRO
  centro: [
    {name: 'ETEC Centro - República', institution: 'ETEC', location: 'República', coords: [-23.5505234, -46.6333567]},
    {name: 'SENAC Centro', institution: 'SENAC', location: 'Centro', coords: [-23.5505678, -46.6333891]},
    {name: 'FATEC Centro', institution: 'FATEC', location: 'Bela Vista', coords: [-23.5618234, -46.6565456]},
    {name: 'ETEC Liberdade', institution: 'ETEC', location: 'Liberdade', coords: [-23.5587567, -46.6347123]},
    {name: 'SENAC Liberdade', institution: 'SENAC', location: 'Liberdade', coords: [-23.5587891, -46.6347789]},
    {name: 'UNINOVE Centro', institution: 'UNINOVE', location: 'Barra Funda', coords: [-23.5186345, -46.6506234]},
    {name: 'ETEC Santa Ifigênia', institution: 'ETEC', location: 'Santa Ifigênia', coords: [-23.5378678, -46.6406567]},
    {name: 'SENAC Sé', institution: 'SENAC', location: 'Sé', coords: [-23.5505456, -46.6333234]}
  ],

  // CURSOS PROFISSIONALIZANTES DIVERSOS
  profissionalizantes: [
    {name: 'SENAI Mecânica - Ipiranga', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875234, -46.6103567]},
    {name: 'SENAC Beleza - Paulista', institution: 'SENAC', location: 'Paulista', coords: [-23.5618678, -46.6565234]},
    {name: 'ETEC Eletrônica - Mooca', institution: 'ETEC', location: 'Mooca', coords: [-23.5506891, -46.5997456]},
    {name: 'SENAI Soldagem - Santo Amaro', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528345, -46.7081789]},
    {name: 'SENAC Administração - Santana', institution: 'SENAC', location: 'Santana', coords: [-23.5186567, -46.6264123]},
    {name: 'ETEC Logística - Itaquera', institution: 'ETEC', location: 'Itaquera', coords: [-23.5378234, -46.4581678]},
    {name: 'SENAI Automação - Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267789, -46.7378345]},
    {name: 'SENAC Marketing - Lapa', institution: 'SENAC', location: 'Lapa', coords: [-23.5267456, -46.7017891]}
  ],

  // ESPORTES E ATIVIDADES FÍSICAS
  esportes: [
    {name: 'Escola de Futebol Barcelona - Vila Madalena', institution: 'Escola de Futebol', location: 'Vila Madalena', coords: [-23.5506234, -46.6889567]},
    {name: 'Academia de Basquete Corinthians - Tatuapé', institution: 'Academia de Basquete', location: 'Tatuapé', coords: [-23.5378891, -46.5664123]},
    {name: 'Centro de Natação Aquático - Moema', institution: 'Centro de Natação', location: 'Moema', coords: [-23.5967456, -46.6631789]},
    {name: 'Escola de Vôlei Paulistano - Jardins', institution: 'Escola de Vôlei', location: 'Jardins', coords: [-23.5618123, -46.6565234]},
    {name: 'Academia de Tênis Ibirapuera - Vila Olímpia', institution: 'Academia de Tênis', location: 'Vila Olímpia', coords: [-23.5967789, -46.6889123]},
    {name: 'Centro de Artes Marciais - Liberdade', institution: 'Artes Marciais', location: 'Liberdade', coords: [-23.5587345, -46.6347891]},
    {name: 'Escola de Futebol Santos - Santo Amaro', institution: 'Escola de Futebol', location: 'Santo Amaro', coords: [-23.6528234, -46.7081567]},
    {name: 'Academia de Ginástica Rítmica - Pinheiros', institution: 'Ginástica', location: 'Pinheiros', coords: [-23.5729456, -46.6889234]},
    {name: 'Centro de Judô Ippon - Santana', institution: 'Judô', location: 'Santana', coords: [-23.5186567, -46.6264123]},
    {name: 'Escola de Capoeira Cordão de Ouro - Lapa', institution: 'Capoeira', location: 'Lapa', coords: [-23.5267891, -46.7017456]},
    {name: 'Academia de Muay Thai Champions - Itaquera', institution: 'Muay Thai', location: 'Itaquera', coords: [-23.5378234, -46.4581789]},
    {name: 'Centro de Atletismo Velocidade - Campo Limpo', institution: 'Atletismo', location: 'Campo Limpo', coords: [-23.6389567, -46.7664123]},
    {name: 'Escola de Futebol Palmeiras - Osasco', institution: 'Escola de Futebol', location: 'Osasco', coords: [-23.5267123, -46.7917456]},
    {name: 'Academia de Boxe Popó - Cidade Tiradentes', institution: 'Boxe', location: 'Cidade Tiradentes', coords: [-23.5967234, -46.4031567]},
    {name: 'Centro de Handebol - Vila Prudente', institution: 'Handebol', location: 'Vila Prudente', coords: [-23.5875789, -46.5831234]},
    {name: 'Escola de Skate Tony Hawk - Vila Madalena', institution: 'Skate', location: 'Vila Madalena', coords: [-23.5506891, -46.6889345]},
    {name: 'Academia de Crossfit Beast - Mooca', institution: 'Crossfit', location: 'Mooca', coords: [-23.5506456, -46.5997678]},
    {name: 'Centro de Ciclismo Speed - Ibirapuera', institution: 'Ciclismo', location: 'Ibirapuera', coords: [-23.5875123, -46.6578456]},
    {name: 'Escola de Futsal Falcão - Penha', institution: 'Futsal', location: 'Penha', coords: [-23.5267567, -46.5431234]},
    {name: 'Academia de Jiu-Jitsu Gracie - Butantã', institution: 'Jiu-Jitsu', location: 'Butantã', coords: [-23.5729234, -46.7378567]},
    {name: 'Centro de Escalada Vertical - Perdizes', institution: 'Escalada', location: 'Perdizes', coords: [-23.5378678, -46.6747234]},
    {name: 'Escola de Rugby Bandeirantes - Morumbi', institution: 'Rugby', location: 'Morumbi', coords: [-23.6167456, -46.7000123]},
    {name: 'Academia de Karatê Shotokan - Jabaquara', institution: 'Karatê', location: 'Jabaquara', coords: [-23.6528789, -46.6431567]},
    {name: 'Centro de Badminton - Casa Verde', institution: 'Badminton', location: 'Casa Verde', coords: [-23.4889123, -46.6506789]},
    {name: 'Escola de Basquete 3x3 - São Mateus', institution: 'Basquete 3x3', location: 'São Mateus', coords: [-23.6167234, -46.4581456]},
    {name: 'Academia de Taekwondo - Tucuruvi', institution: 'Taekwondo', location: 'Tucuruvi', coords: [-23.4667567, -46.6031234]},
    {name: 'Centro de Tênis de Mesa - Sapopemba', institution: 'Tênis de Mesa', location: 'Sapopemba', coords: [-23.6167891, -46.4831567]},
    {name: 'Escola de Futebol Americano - Pirituba', institution: 'Futebol Americano', location: 'Pirituba', coords: [-23.4889456, -46.7378234]},
    {name: 'Academia de Pilates Core - Bela Vista', institution: 'Pilates', location: 'Bela Vista', coords: [-23.5618789, -46.6565123]},
    {name: 'Centro de Yoga Namastê - Higienópolis', institution: 'Yoga', location: 'Higienópolis', coords: [-23.5378345, -46.6506678]}
  ],

  // MÚSICA E ARTES
  musica_artes: [
    {name: 'Conservatório Musical Souza Lima - Higienópolis', institution: 'Conservatório', location: 'Higienópolis', coords: [-23.5378234, -46.6506789]},
    {name: 'Escola de Música Tom Jobim - Vila Madalena', institution: 'Escola de Música', location: 'Vila Madalena', coords: [-23.5506567, -46.6889123]},
    {name: 'Academia de Violão Clássico - Mooca', institution: 'Academia de Violão', location: 'Mooca', coords: [-23.5506891, -46.5997456]},
    {name: 'Centro de Artes Visuais - Bela Vista', institution: 'Artes Visuais', location: 'Bela Vista', coords: [-23.5618345, -46.6565678]},
    {name: 'Escola de Dança Balé da Cidade - Centro', institution: 'Escola de Dança', location: 'Centro', coords: [-23.5505123, -46.6333456]},
    {name: 'Conservatório de Piano - Jardim Paulista', institution: 'Conservatório', location: 'Jardim Paulista', coords: [-23.5618789, -46.6565234]},
    {name: 'Academia de Canto Lírico - Vila Olímpia', institution: 'Academia de Canto', location: 'Vila Olímpia', coords: [-23.5967456, -46.6889567]},
    {name: 'Escola de Teatro Oficina - Bixiga', institution: 'Escola de Teatro', location: 'Bixiga', coords: [-23.5587678, -46.6347234]},
    {name: 'Centro de Música Popular - Itaquera', institution: 'Música Popular', location: 'Itaquera', coords: [-23.5378567, -46.4581123]},
    {name: 'Academia de Bateria - Penha', institution: 'Academia de Bateria', location: 'Penha', coords: [-23.5267234, -46.5431789]}
  ],

  // JOGOS E ATIVIDADES MENTAIS
  jogos_mentais: [
    {name: 'Clube de Xadrez Kasparov - República', institution: 'Clube de Xadrez', location: 'República', coords: [-23.5505234, -46.6333567]},
    {name: 'Academia de Xadrez Magnus - Perdizes', institution: 'Academia de Xadrez', location: 'Perdizes', coords: [-23.5378678, -46.6747234]},
    {name: 'Centro de Jogos Estratégicos - Vila Mariana', institution: 'Jogos Estratégicos', location: 'Vila Mariana', coords: [-23.5875891, -46.6431456]},
    {name: 'Clube de Bridge Paulista - Jardins', institution: 'Clube de Bridge', location: 'Jardins', coords: [-23.5618345, -46.6565789]},
    {name: 'Academia de Xadrez Fischer - Tatuapé', institution: 'Academia de Xadrez', location: 'Tatuapé', coords: [-23.5378123, -46.5664567]},
    {name: 'Centro de Jogos de Tabuleiro - Campo Limpo', institution: 'Jogos de Tabuleiro', location: 'Campo Limpo', coords: [-23.6389456, -46.7664123]},
    {name: 'Clube de Xadrez Capablanca - Santana', institution: 'Clube de Xadrez', location: 'Santana', coords: [-23.5186789, -46.6264234]},
    {name: 'Academia de Damas - Vila Prudente', institution: 'Academia de Damas', location: 'Vila Prudente', coords: [-23.5875567, -46.5831891]}
  ],

  // ATIVIDADES AQUÁTICAS
  atividades_aquaticas: [
    {name: 'Escola de Natação Gustavo Borges - Moema', institution: 'Escola de Natação', location: 'Moema', coords: [-23.5967234, -46.6631567]},
    {name: 'Centro Aquático Raia Olímpica - Ibirapuera', institution: 'Centro Aquático', location: 'Ibirapuera', coords: [-23.5875678, -46.6578234]},
    {name: 'Academia de Polo Aquático - Vila Olímpia', institution: 'Polo Aquático', location: 'Vila Olímpia', coords: [-23.5967891, -46.6889456]},
    {name: 'Escola de Mergulho Cousteau - Pinheiros', institution: 'Escola de Mergulho', location: 'Pinheiros', coords: [-23.5729345, -46.6889678]},
    {name: 'Centro de Hidroginástica - Jabaquara', institution: 'Hidroginástica', location: 'Jabaquara', coords: [-23.6528123, -46.6431789]},
    {name: 'Academia de Natação Sincronizada - Morumbi', institution: 'Natação Sincronizada', location: 'Morumbi', coords: [-23.6167567, -46.7000234]},
    {name: 'Centro de Aqua Aeróbica - Santana', institution: 'Aqua Aeróbica', location: 'Santana', coords: [-23.5186789, -46.6264345]},
    {name: 'Escola de Surf Indoor - Lapa', institution: 'Surf Indoor', location: 'Lapa', coords: [-23.5267234, -46.7017567]},
    {name: 'Academia de Saltos Ornamentais - Vila Mariana', institution: 'Saltos Ornamentais', location: 'Vila Mariana', coords: [-23.5875456, -46.6431123]},
    {name: 'Centro de Triathlon - Campo Limpo', institution: 'Triathlon', location: 'Campo Limpo', coords: [-23.6389678, -46.7664891]}
  ],

  // ESPORTES RADICAIS E AVENTURA
  esportes_radicais: [
    {name: 'Centro de Parkour Free Running - Vila Madalena', institution: 'Parkour', location: 'Vila Madalena', coords: [-23.5506789, -46.6889345]},
    {name: 'Academia de Slackline - Ibirapuera', institution: 'Slackline', location: 'Ibirapuera', coords: [-23.5875234, -46.6578567]},
    {name: 'Escola de BMX Radical - Cidade Tiradentes', institution: 'BMX', location: 'Cidade Tiradentes', coords: [-23.5967456, -46.4031123]},
    {name: 'Centro de Rapel Urbano - Centro', institution: 'Rapel', location: 'Centro', coords: [-23.5505678, -46.6333234]},
    {name: 'Academia de Longboard - Vila Olímpia', institution: 'Longboard', location: 'Vila Olímpia', coords: [-23.5967123, -46.6889678]},
    {name: 'Escola de Patins Inline - Mooca', institution: 'Patins Inline', location: 'Mooca', coords: [-23.5506345, -46.5997891]}
  ]
};
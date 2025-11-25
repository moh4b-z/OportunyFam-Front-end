import { Instituicao } from "@/types";

// Dados mock para teste
export const mockInstitutions: Instituicao[] = [
  {
    instituicao_id: 1,
    nome: "Instituto Esperança",
    email: "contato@institutoesperanca.org",
    foto_perfil: "https://meuservidor.com/logos/instituto_esperanca.png",
    cnpj: "12345678000199",
    telefone: "(11) 98765-4321",
    descricao: "O Instituto Esperança é uma organização sem fins lucrativos dedicada à educação infantil e inclusão social.",
    endereco: {
      cep: "04094-050",
      logradouro: "Rua das Camélias",
      numero: "120",
      complemento: "Próximo à praça central",
      bairro: "Jardim das Flores",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5505,
      longitude: -46.6333
    }
  },
  {
    instituicao_id: 2,
    nome: "Casa da Esperança",
    email: "contato@casaesperanca.org",
    foto_perfil: null,
    cnpj: "98765432000188",
    telefone: "(11) 91234-5678",
    descricao: "Organização focada em assistência social e apoio a famílias carentes.",
    endereco: {
      cep: "01310-100",
      logradouro: "Avenida Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5618,
      longitude: -46.6565
    }
  },
  {
    instituicao_id: 3,
    nome: "Instituto Água Viva",
    email: "contato@aguaviva.org",
    foto_perfil: "https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png",
    cnpj: "11223344000177",
    telefone: "(11) 95555-1234",
    descricao: "A Instituição Água Viva atua com projetos sociais voltados ao reforço escolar, alimentação e lazer de crianças e adolescentes em situação de vulnerabilidade.",
    endereco: {
      cep: "04038-001",
      logradouro: "Rua Vergueiro",
      numero: "500",
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5729,
      longitude: -46.6431
    }
  }
];

// Gera coordenadas aleatórias em São Paulo
function getRandomSaoPauloCoords() {
  const minLat = -23.7;
  const maxLat = -23.4;
  const minLng = -46.8;
  const maxLng = -46.4;
  
  return [
    minLat + Math.random() * (maxLat - minLat),
    minLng + Math.random() * (maxLng - minLng)
  ];
}

// Gera endereços aleatórios
const ruas = ['Rua das Flores', 'Avenida Central', 'Rua da Esperança', 'Avenida Paulista', 'Rua Vergueiro', 'Rua Augusta', 'Avenida Faria Lima'];
const bairros = ['Vila Mariana', 'Bela Vista', 'Jardim Paulista', 'Moema', 'Itaim Bibi', 'Pinheiros', 'Vila Madalena'];

import { saoPauloInstitutions } from './saoPauloInstitutions';

// Definição do tipo para os cursos profissionais
type ProfessionalCourse = {
  name: string;
  institution: string;
  location: string;
  coords: [number, number];
};

// Base de dados MASSIVA de instituições de São Paulo
const professionalCourses: Record<string, ProfessionalCourse[]> = {
  // SENAI - Cursos Técnicos
  'senai': [
    {name: 'SENAI Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267, -46.7378]},
    {name: 'SENAI Barra Funda', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186, -46.6506]},
    {name: 'SENAI Ipiranga', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875, -46.6103]},
    {name: 'SENAI Santo Amaro', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528, -46.7081]},
    {name: 'SENAI Mooca', institution: 'SENAI', location: 'Mooca', coords: [-23.5506, -46.5997]}
  ],
  ...saoPauloInstitutions,
  'mecanica': [
    {name: 'SENAI Mecânica Automotiva - Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267, -46.7378]},
    {name: 'SENAI Mecânica Industrial - Ipiranga', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875, -46.6103]},
    {name: 'ETEC Mecânica - Mooca', institution: 'ETEC', location: 'Mooca', coords: [-23.5506, -46.5997]},
    {name: 'FATEC Mecânica - Santo Amaro', institution: 'FATEC', location: 'Santo Amaro', coords: [-23.6528, -46.7081]},
    {name: 'SENAI Mecânica - Barra Funda', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186, -46.6506]}
  ],
  'eletronica': [
    {name: 'SENAI Eletrônica - Barra Funda', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186, -46.6506]},
    {name: 'FATEC Eletrônica - Vila Mariana', institution: 'FATEC', location: 'Vila Mariana', coords: [-23.5729, -46.6431]},
    {name: 'ETEC Eletrônica - Centro', institution: 'ETEC', location: 'Centro', coords: [-23.5505, -46.6333]}
  ],
  'informatica': [
    {name: 'SENAI Informática - Vila Leopoldina', institution: 'SENAI', location: 'Vila Leopoldina', coords: [-23.5267, -46.7378]},
    {name: 'FATEC Informática - Liberdade', institution: 'FATEC', location: 'Liberdade', coords: [-23.5587, -46.6347]},
    {name: 'ETEC Informática - Cidade Tiradentes', institution: 'ETEC', location: 'Cidade Tiradentes', coords: [-23.5967, -46.4031]}
  ],
  'soldagem': [
    {name: 'SENAI Soldagem - Santo Amaro', institution: 'SENAI', location: 'Santo Amaro', coords: [-23.6528, -46.7081]},
    {name: 'SENAI Soldagem Avançada - Ipiranga', institution: 'SENAI', location: 'Ipiranga', coords: [-23.5875, -46.6103]}
  ],
  'administracao': [
    {name: 'SENAC Administração - Paulista', institution: 'SENAC', location: 'Paulista', coords: [-23.5618, -46.6565]},
    {name: 'ETEC Administração - Vila Formosa', institution: 'ETEC', location: 'Vila Formosa', coords: [-23.5506, -46.5831]},
    {name: 'Universidade Anhembi - Administração', institution: 'Anhembi Morumbi', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]}
  ],
  'enfermagem': [
    {name: 'ETEC Enfermagem - Santa Ifigênia', institution: 'ETEC', location: 'Santa Ifigênia', coords: [-23.5378, -46.6406]},
    {name: 'SENAC Enfermagem - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506, -46.5664]},
    {name: 'Centro Paula Souza - Enfermagem', institution: 'Centro Paula Souza', location: 'Bela Vista', coords: [-23.5618, -46.6565]}
  ],
  'ingles': [
    {name: 'CNA Inglês - Vila Madalena', institution: 'CNA', location: 'Vila Madalena', coords: [-23.5506, -46.6889]},
    {name: 'Wizard Inglês - Moema', institution: 'Wizard', location: 'Moema', coords: [-23.5967, -46.6631]},
    {name: 'CCAA Inglês - Itaim Bibi', institution: 'CCAA', location: 'Itaim Bibi', coords: [-23.5875, -46.6747]}
  ],
  'programacao': [
    {name: 'FIAP - Programação', institution: 'FIAP', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]},
    {name: 'SENAI Programação - Barra Funda', institution: 'SENAI', location: 'Barra Funda', coords: [-23.5186, -46.6506]},
    {name: 'ETEC Programação - Centro', institution: 'ETEC', location: 'Centro', coords: [-23.5505, -46.6333]}
  ],
  'design': [
    {name: 'SENAC Design - Lapa', institution: 'SENAC', location: 'Lapa', coords: [-23.5267, -46.7017]},
    {name: 'Panamericana Design Gráfico', institution: 'Panamericana', location: 'Vila Olímpia', coords: [-23.5967, -46.6889]},
    {name: 'ETEC Design - Cambuci', institution: 'ETEC', location: 'Cambuci', coords: [-23.5729, -46.6186]}
  ],
  'culinaria': [
    {name: 'SENAC Culinária - Águas Rasas', institution: 'SENAC', location: 'Águas Rasas', coords: [-23.5506, -46.5664]},
    {name: 'Instituto Gastronômico das Américas', institution: 'IGA', location: 'Moema', coords: [-23.5967, -46.6631]},
    {name: 'HOTEC Gastronomia', institution: 'HOTEC', location: 'Bela Vista', coords: [-23.5618, -46.6565]}
  ]
};

// Normalização ultra-rápida
const normalize = (term: string): string => 
  term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

// Busca profissional ultra-precisa
function findProfessionalCourses(searchTerm: string): Instituicao[] {
  const search = normalize(searchTerm);
  const results: Instituicao[] = [];
  
  // Busca direta por categoria
  if (professionalCourses[search]) {
    professionalCourses[search].forEach(course => {
      results.push({
        instituicao_id: Date.now() + Math.random(),
        nome: course.name,
        email: `contato@${course.institution.toLowerCase()}.edu.br`,
        foto_perfil: 'https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png',
        telefone: '(11) 3000-0000',
        descricao: `Curso profissional de ${searchTerm} - ${course.institution}`,
        endereco: {
          latitude: course.coords[0],
          longitude: course.coords[1],
          bairro: course.location,
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
    });
  }
  
  // Busca por prefixo (mínimo 3 chars)
  if (search.length >= 3 && results.length === 0) {
    Object.entries(professionalCourses).forEach(([key, courses]) => {
      if (key.startsWith(search)) {
        courses.forEach(course => {
          results.push({
            instituicao_id: Date.now() + Math.random(),
            nome: course.name,
            email: `contato@${course.institution.toLowerCase()}.edu.br`,
            telefone: '(11) 3000-0000',
            descricao: `Curso profissional - ${course.institution}`,
            endereco: {
              latitude: course.coords[0],
              longitude: course.coords[1],
              bairro: course.location,
              cidade: 'São Paulo',
              estado: 'SP'
            }
          });
        });
      }
    });
  }
  
  return results.slice(0, 25);
}

// Lista de sugestões de instituições e cursos
const institutionSuggestions = [
  // Instituições
  'Instituto Esperança',
  'Instituto Água Viva', 
  'Instituto Social',
  'Instituto Educacional',
  'Instituto Cultural',
  'Instituto Comunitário',
  'Casa da Esperança',
  'Casa do Menor',
  'Casa de Apoio',
  'Casa Abrigo',
  'Centro Social',
  'Centro Comunitário',
  'Centro Cultural',
  'Centro Educacional',
  'Escola Comunitária',
  'Escola Social',
  'Fundação Esperança',
  'Fundação Social',
  'Organização Social',
  'Projeto Social',
  'Associação Comunitária',
  'Associação Beneficente',
  
  // Cursos Técnicos
  'Curso Técnico em Informática',
  'Curso Técnico em Administração',
  'Curso Técnico em Enfermagem',
  'Curso Técnico em Eletrônica',
  'Curso Técnico em Mecânica',
  'Curso Técnico em Química',
  'Curso Técnico em Logística',
  'Curso Técnico em Segurança do Trabalho',
  'Curso Técnico em Contabilidade',
  'Curso Técnico em Marketing',
  
  // Cursos Profissionalizantes
  'Curso de Programação',
  'Curso de Design Gráfico',
  'Curso de Inglês',
  'Curso de Espanhol',
  'Curso de Francês',
  'Curso de Alemão',
  'Curso de Culinária',
  'Curso de Confeitaria',
  'Curso de Padaria',
  'Curso de Barbeiro',
  'Curso de Cabeleireiro',
  'Curso de Manicure',
  'Curso de Estética',
  'Curso de Massagem',
  'Curso de Fotografia',
  'Curso de Vídeo',
  'Curso de Música',
  'Curso de Violão',
  'Curso de Piano',
  'Curso de Bateria',
  'Curso de Canto',
  'Curso de Dança',
  'Curso de Teatro',
  'Curso de Pintura',
  'Curso de Desenho',
  'Curso de Artesanato',
  'Curso de Costura',
  'Curso de Bordado',
  'Curso de Crochet',
  'Curso de Tricô',
  
  // Cursos de Capacitação
  'Curso de Excel',
  'Curso de Word',
  'Curso de PowerPoint',
  'Curso de Informática Básica',
  'Curso de Internet',
  'Curso de Redes Sociais',
  'Curso de E-commerce',
  'Curso de Vendas',
  'Curso de Atendimento ao Cliente',
  'Curso de Liderança',
  'Curso de Gestão',
  'Curso de Empreendedorismo',
  'Curso de Finanças Pessoais',
  'Curso de Investimentos',
  'Curso de Contabilidade Básica',
  
  // Cursos de Saúde
  'Curso de Primeiros Socorros',
  'Curso de Cuidador de Idosos',
  'Curso de Auxiliar de Farmácia',
  'Curso de Auxiliar Odontológico',
  'Curso de Auxiliar Veterinário',
  'Curso de Massoterapia',
  'Curso de Acupuntura',
  'Curso de Nutrição',
  
  // Cursos Técnicos Avançados
  'Curso de Energia Solar',
  'Curso de Automação Industrial',
  'Curso de Refrigeração',
  'Curso de Ar Condicionado',
  'Curso de Elétrica Predial',
  'Curso de Hidráulica',
  'Curso de Soldagem',
  'Curso de Torneiro Mecânico',
  'Curso de Caldeiraria',
  'Curso de Pintura Automotiva',
  'Curso de Mecânica Automotiva',
  'Curso de Injeção Eletrônica',
  
  // Cursos de Tecnologia
  'Curso de Desenvolvimento Web',
  'Curso de Desenvolvimento Mobile',
  'Curso de Python',
  'Curso de Java',
  'Curso de JavaScript',
  'Curso de React',
  'Curso de Node.js',
  'Curso de Banco de Dados',
  'Curso de Cybersegurança',
  'Curso de Inteligência Artificial',
  'Curso de Machine Learning',
  'Curso de Data Science',
  'Curso de UX/UI Design',
  'Curso de Game Design',
  'Curso de Animação 3D',
  'Curso de Edição de Vídeo',
  'Curso de Motion Graphics',
  
  // Cursos de Negócios
  'Curso de Marketing Digital',
  'Curso de SEO',
  'Curso de Google Ads',
  'Curso de Facebook Ads',
  'Curso de Instagram Marketing',
  'Curso de Copywriting',
  'Curso de Gestão de Projetos',
  'Curso de Recursos Humanos',
  'Curso de Departamento Pessoal',
  'Curso de Folha de Pagamento',
  'Curso de Tributos',
  'Curso de Auditoria',
  
  // Cursos de Idiomas Avançados
  'Curso de Inglês para Negócios',
  'Curso de Inglês Técnico',
  'Curso de Conversação em Inglês',
  'Curso de TOEFL',
  'Curso de IELTS',
  'Curso de Japonês',
  'Curso de Chinês',
  'Curso de Italiano',
  'Curso de Russo',
  'Curso de Árabe',
  
  // Cursos de Esportes e Bem-estar
  'Curso de Personal Trainer',
  'Curso de Yoga',
  'Curso de Pilates',
  'Curso de Nutrição Esportiva',
  'Curso de Fisioterapia',
  'Curso de Quiropraxia',
  'Curso de Educação Física',
  'Curso de Artes Marciais',
  'Curso de Jiu-Jitsu',
  'Curso de Boxe',
  'Curso de Muay Thai',
  'Curso de Capoeira'
];

function generateRandomAddress() {
  const coords = getRandomSaoPauloCoords();
  return {
    cep: `0${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`,
    logradouro: ruas[Math.floor(Math.random() * ruas.length)],
    numero: String(Math.floor(Math.random() * 9000) + 100),
    bairro: bairros[Math.floor(Math.random() * bairros.length)],
    cidade: 'São Paulo',
    estado: 'SP',
    ...coords
  };
}

function createInstitutionFromName(name: string): Instituicao {
  return {
    instituicao_id: Date.now() + Math.random(), // ID único
    nome: name,
    email: `contato@${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.org`,
    foto_perfil: "https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png",
    cnpj: `${Math.floor(Math.random() * 90000000) + 10000000}000${Math.floor(Math.random() * 90) + 10}`,
    telefone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    descricao: `${name} é uma organização dedicada ao desenvolvimento social e educacional da comunidade.`,
    endereco: generateRandomAddress()
  };
}

// Algoritmo de precisão profissional
function isPreciseMatch(courseName: string, searchTerm: string): boolean {
  const courseNorm = normalize(courseName);
  const searchNorm = normalize(searchTerm);
  
  return courseNorm.includes(searchNorm) || 
         courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         searchNorm.length >= 3 && courseNorm.startsWith(searchNorm);
}

export function searchMockInstitutions(searchTerm: string): Instituicao[] {
  if (!searchTerm?.trim() || searchTerm.length < 2) return [];
  
  // 1. BUSCA PROFISSIONAL PRIORITÁRIA
  const professionalResults = findProfessionalCourses(searchTerm);
  if (professionalResults.length > 0) return professionalResults;
  
  // 2. BUSCA EM INSTITUIÇÕES EXISTENTES
  const existingResults = mockInstitutions.filter(inst => 
    isPreciseMatch(inst.nome, searchTerm)
  );
  if (existingResults.length > 0) return existingResults.slice(0, 8);
  
  // 3. BUSCA EM SUGESTÕES (FILTRADA)
  const suggestionResults = institutionSuggestions
    .filter(suggestion => isPreciseMatch(suggestion, searchTerm))
    .slice(0, 10)
    .map(suggestion => createInstitutionFromName(suggestion));
  
  if (suggestionResults.length > 0) return suggestionResults;
  
  // 4. BUSCA EXPANDIDA - Gera múltiplos resultados
  if (searchTerm.length >= 3) {
    const expandedResults: Instituicao[] = [];
    const variations = [
      `Curso de ${searchTerm}`,
      `Curso Técnico em ${searchTerm}`,
      `${searchTerm} - SENAI`,
      `${searchTerm} - SENAC`,
      `${searchTerm} - ETEC`,
      `Instituto de ${searchTerm}`,
      `Centro de ${searchTerm}`,
      `Escola de ${searchTerm}`
    ];
    
    variations.forEach(variation => {
      expandedResults.push(createInstitutionFromName(variation));
    });
    
    return expandedResults;
  }
  
  return [];
}
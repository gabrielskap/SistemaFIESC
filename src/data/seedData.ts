import { Vaga, Candidato } from "../types";

export const initialVagas: Vaga[] = [
  {
    id: "vaga_senai_1",
    titulo: "Docente de Educação Profissional em Metalmecânica",
    entidade: "SENAI",
    regional: "Joinville",
    descricao: "Ministrar aulas teóricas e práticas para os cursos técnicos de Mecânica e Usinagem. Preparar planos de aula, orientar alunos em projetos práticos em laboratórios de CNC e assegurar as normas de segurança em oficinas industriais.",
    requisitos_obrigatorios: [
      "Graduação completa em Engenharia Mecânica ou Tecnólogo em Fabricação Mecânica",
      "Experiência comprovada de 6 meses em docência ou treinamento técnico industrial",
      "Conhecimento prático em programação e operação de tornos/centros de usinagem CNC"
    ],
    requisitos_desejaveis: [
      "Pós-graduação em Metodologias Ativas de Ensino ou Engenharia de Operações",
      "Certificação em usinagem computadorizada avançada",
      "Familiaridade com ferramentas de simulação digital (CAD/CAM)"
    ],
    status: "Em Seleção",
    dataCriacao: "2026-06-15"
  },
  {
    id: "vaga_sesi_1",
    titulo: "Médico do Trabalho (Saúde Ocupacional)",
    entidade: "SESI",
    regional: "Florianópolis",
    descricao: "Realizar exames admissionais, demissionais, periódicos e de retorno ao trabalho para indústrias parceiras. Elaborar e coordenar o PCMSO (Programa de Controle Médico de Saúde Ocupacional), avaliar nexos causais e propor ações de prevenção e promoção de saúde nas empresas catarinenses.",
    requisitos_obrigatorios: [
      "Graduação em Medicina com registro ativo no CRM-SC",
      "Especialização ou Residência concluída em Medicina do Trabalho",
      "Disponibilidade para deslocamentos pontuais a indústrias da regional"
    ],
    requisitos_desejaveis: [
      "Experiência com o preenchimento de eventos de SST no eSocial",
      "Mestrado em Saúde Coletiva ou Ergonomia",
      "Conhecimento profundo das Normas Regulamentadoras NR-7, NR-9 e NR-17"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-01"
  },
  {
    id: "vaga_iel_1",
    titulo: "Analista de Desenvolvimento de Carreiras e Estágios",
    entidade: "IEL",
    regional: "Blumenau",
    descricao: "Acompanhar estudantes de nível técnico e superior inseridos no programa de estágio do IEL. Realizar visitas de supervisão a empresas contratantes, aplicar dinâmicas de acolhimento e desenvolvimento comportamental, e gerir a documentação legal das contratações de estágio e aprendizagem.",
    requisitos_obrigatorios: [
      "Graduação completa em Psicologia, Pedagogia ou Administração de Empresas",
      "Experiência de 1 ano com gestão de programas de estágio ou jovem aprendiz",
      "Conhecimento da Lei do Estágio (Lei 11.788/2008)"
    ],
    requisitos_desejaveis: [
      "Formação complementar em Recrutamento por Competências ou Coaching de Carreira",
      "Domínio de sistemas ERP ou plataformas de gestão de vagas",
      "Familiaridade com capacitação comportamental (Soft Skills)"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-10"
  },
  {
    id: "vaga_fiesc_1",
    titulo: "Analista de Inteligência de Mercado Industrial",
    entidade: "FIESC",
    regional: "Chapecó",
    descricao: "Coletar, analisar e sintetizar dados econômicos e estatísticos dos setores industriais da região Oeste de Santa Catarina. Produzir boletins e relatórios analíticos para apoiar a tomada de decisões da presidência e das câmaras setoriais de fomento ao comércio exterior e desenvolvimento regional.",
    requisitos_obrigatorios: [
      "Graduação completa em Ciências Econômicas, Engenharia de Produção ou Estatística",
      "Domínio avançado em Excel e Power BI para visualização de dados econômicos",
      "Experiência com análise de indicadores econômicos ou setoriais"
    ],
    requisitos_desejaveis: [
      "Inglês intermediário/avançado para leitura de relatórios internacionais",
      "Nível básico de Python, R ou SQL para análise de dados",
      "Conhecimento sobre o panorama industrial catarinense"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-12"
  },
  {
    id: "vaga_senai_2",
    titulo: "Instrutor Técnico de Instalações Elétricas",
    entidade: "SENAI",
    regional: "Criciúma",
    descricao: "Ministrar treinamentos de instalações residenciais, prediais e industriais. Instruir turmas nas normas regulamentadoras de segurança elétrica NR-10 e NR-35. Realizar avaliações de competência e preparar material didático prático.",
    requisitos_obrigatorios: [
      "Formação técnica completa em Eletrotécnica ou Engenharia Elétrica",
      "Certificado de proficiência em NR-10 e NR-35",
      "Experiência mínima de 6 meses na execução de painéis ou instalações elétricas"
    ],
    requisitos_desejaveis: [
      "Experiência anterior em treinamentos operacionais ou docência",
      "Conhecimento prático de comandos elétricos industriais",
      "Habilidade com ferramentas didáticas online"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-05"
  },
  {
    id: "vaga_sesi_2",
    titulo: "Engenheiro de Segurança do Trabalho",
    entidade: "SESI",
    regional: "Lages",
    descricao: "Elaborar laudos ambientais de ruído, calor, poeira e demais riscos industriais (PGR e LTCAT). Assessorar empresas de manufatura e florestais da região serrana quanto às obrigações de SST e prevenção de sinistros trabalhistas.",
    requisitos_obrigatorios: [
      "Graduação completa em Engenharia com especialização de pós-graduação em Engenharia de Segurança do Trabalho",
      "Registro ativo no CREA-SC",
      "Experiência em medições ambientais de ruído e agentes químicos"
    ],
    requisitos_desejaveis: [
      "Disponibilidade total para viagens em toda a região serrana catarinense",
      "Treinamento de higiene ocupacional avançada",
      "Conhecimento no envio das tabelas de eventos de SST para o eSocial"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-08"
  },
  {
    id: "vaga_iel_2",
    titulo: "Supervisor de Atração de Talentos Internacionais",
    entidade: "IEL",
    regional: "Itajaí",
    descricao: "Gerenciar o programa de intercâmbio profissional e fomento a convênios universitários internacionais da FIESC. Facilitar contatos de cooperação técnico-científica, assessorar indústrias em contratação de especialistas do exterior e acompanhar trâmites burocráticos de migração.",
    requisitos_obrigatorios: [
      "Graduação em Relações Internacionais, Comércio Exterior ou Administração",
      "Fluência em Inglês e Espanhol corporativo",
      "Experiência profissional em gestão de convênios globais ou vistos de trabalho"
    ],
    requisitos_desejaveis: [
      "Pós-graduação em Negócios Globais ou Recursos Humanos Estatais",
      "Residir ou ter facilidade de atuação em Itajaí/Balneário Camboriú",
      "Vivência pessoal de intercâmbio acadêmico ou profissional de longa duração"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-14"
  },
  {
    id: "vaga_discriminatoria_teste",
    titulo: "Analista Administrativo (Vaga Teste de Auditoria de Discriminação)",
    entidade: "FIESC",
    regional: "Florianópolis",
    descricao: "Vaga administrativa geral. Buscamos candidatos do sexo masculino, com idade entre 25 e 35 anos, preferencialmente solteiros e sem filhos, pois o cargo exige total disponibilidade de horário e viagens. Exige-se boa aparência para recepção de clientes de alto padrão.",
    requisitos_obrigatorios: [
      "Graduação em Administração",
      "Gênero masculino (devido ao perfil físico das tarefas)",
      "Idade de até 35 anos"
    ],
    requisitos_desejaveis: [
      "Residir nas proximidades da sede",
      "Ter carro próprio e boa aparência"
    ],
    status: "Aberta",
    dataCriacao: "2026-07-18"
  }
];

export const initialCandidatos: Candidato[] = [
  {
    id: "cand_1",
    nome: "Marcos Vinícius Becker",
    experiencia: "Atuou como Instrutor Técnico de Usinagem no Senai-PR por 2 anos. Ampla experiência em indústrias metalmecânicas programando tornos e fresadoras CNC. Especialista em calibração de ferramentas de corte e interpretação de desenhos mecânicos complexos.",
    formacao: "Graduação em Tecnologia em Fabricação Mecânica - UTFPR (2022)",
    habilidades: ["CNC", "Programação de Usinagem", "Torno Mecânico", "Metodologias de Ensino", "Desenho Técnico (CAD)"],
    certificacoes: ["Certificado Avançado em CNC Fanuc", "NR-12 Básica"],
    cpf_mascarado: "053.***.***-45",
    contato_mascarado: "(47) 9****-1234",
    dataCandidatura: "2026-07-02"
  },
  {
    id: "cand_2",
    nome: "Dra. Carolina Mendonça Prado",
    experiencia: "Médica com 8 anos de atuação em clínicas de saúde ocupacional. Responsável técnica pelo PCMSO de três grandes indústrias têxteis e metalúrgicas em SC. Experiência na condução de campanhas de vacinação empresarial, exames periódicos e gestão de afastamentos previdenciários.",
    formacao: "Graduação em Medicina - UFSC (2015), Especialização Lato Sensu em Medicina do Trabalho - USP (2018)",
    habilidades: ["Medicina do Trabalho", "PCMSO", "eSocial", "Normas Regulamentadoras (NR-7, NR-9)", "Saúde Preventiva"],
    certificacoes: ["RQE em Medicina do Trabalho", "Ergonomia Básica (NR-17)"],
    cpf_mascarado: "092.***.***-89",
    contato_mascarado: "(48) 9****-5678",
    dataCandidatura: "2026-07-05"
  },
  {
    id: "cand_3",
    nome: "Julia Albuquerque Ramos",
    experiencia: "Trabalhou como assistente de Recursos Humanos focada em integração de estagiários e monitoramento de contratos de jovem aprendiz na Ambev. Vivência na criação de trilhas de onboarding, dinâmicas de grupo e suporte aos gestores sobre a legislação de estágio.",
    formacao: "Graduada em Psicologia - FURB (2024)",
    habilidades: ["Lei do Estágio", "Integração", "Onboarding", "Entrevistas por Competência", "Desenvolvimento Organizacional"],
    certificacoes: ["Análise de Perfil Disc - IBC", "Recrutamento Digital"],
    cpf_mascarado: "088.***.***-21",
    contato_mascarado: "(47) 9****-9900",
    dataCandidatura: "2026-07-11"
  },
  {
    id: "cand_4",
    nome: "Tiago Pereira Souza",
    experiencia: "Economista júnior com experiência em assessoramento estatístico para associações comerciais. Elabora painéis interativos de Business Intelligence compilando dados do Caged, IBGE e notas fiscais de exportação industrial. Excel avançado e criação de relatórios automatizados no Power BI.",
    formacao: "Graduação em Ciências Econômicas - UFSC (2023)",
    habilidades: ["Power BI", "Excel Avançado", "Indicadores Econômicos", "Análise de Dados", "SQL Básico"],
    certificacoes: ["Microsoft Certified: Power BI Data Analyst Associate"],
    cpf_mascarado: "067.***.***-10",
    contato_mascarado: "(49) 9****-4321",
    dataCandidatura: "2026-07-14"
  },
  {
    id: "cand_5",
    nome: "Aline Silveira Mendes",
    experiencia: "Eletrotécnica sênior, com 5 anos em manutenção predial e industrial no Polo de Joinville. Instrutora certificadora externa credenciada para cursos livres de NR-10 e NR-35. Foco em segurança operacional de subestações e manutenção de disjuntores.",
    formacao: "Curso Técnico em Eletrotécnica - SATC (2019)",
    habilidades: ["Instalações Elétricas", "NR-10", "NR-35", "Usinas de Energia", "Comandos Industriais"],
    certificacoes: ["Qualificação Instrutor NR-10", "Supervisor NR-35"],
    cpf_mascarado: "089.***.***-34",
    contato_mascarado: "(48) 9****-2233",
    dataCandidatura: "2026-07-06"
  },
  {
    id: "cand_6",
    nome: "Carlos Eduardo Santos",
    experiencia: "Engenheiro de Produção com especialização de higiene ocupacional. Atuou em indústrias moveleiras medindo poeiras de madeira e vibração. Forte conhecimento prático na elaboração de PGR e preenchimento das exigências de saúde do eSocial.",
    formacao: "Engenharia de Produção Mecânica - UDESC (2017), Especialista em SST - Estácio (2020)",
    habilidades: ["Engenharia de Segurança", "Laudos Ambientais", "Medição de Ruído", "PGR", "eSocial"],
    certificacoes: ["Pós-Graduação SST", "Operação de Medidores de Vibração"],
    cpf_mascarado: "044.***.***-62",
    contato_mascarado: "(49) 9****-1122",
    dataCandidatura: "2026-07-09"
  },
  {
    id: "cand_7",
    nome: "Patrícia Helena Silva",
    experiencia: "Psicóloga organizacional. 3 anos assessorando agências de fomento e integradoras regionais na triagem e dinâmicas de jovem aprendiz. Habilidade em feedback comportamental e aconselhamento profissional.",
    formacao: "Graduação em Psicologia - Univali (2021)",
    habilidades: ["Soft Skills", "Recrutamento", "Treinamento", "Lei do Estágio", "Supervisão"],
    certificacoes: ["Formação Analista Comportamental"],
    cpf_mascarado: "078.***.***-18",
    contato_mascarado: "(47) 9****-7788",
    dataCandidatura: "2026-07-12"
  },
  {
    id: "cand_8",
    nome: "Gustavo Henrique Rocha",
    experiencia: "Instalador de subestações com 4 anos de experiência prática em Joinville. Executa comandos elétricos residenciais e industriais em conformidade estrita com normas de segurança prediais e NR-10/NR-35.",
    formacao: "Técnico em Eletrotécnica - Cedup (2020)",
    habilidades: ["Instalações Elétricas", "Comandos Industriais", "Eletricidade Predial", "NR-10", "NR-35"],
    certificacoes: ["Instalador Alta Tensão", "NR-35 Especialista"],
    cpf_mascarado: "062.***.***-99",
    contato_mascarado: "(48) 9****-4455",
    dataCandidatura: "2026-07-06"
  },
  {
    id: "cand_9",
    nome: "Mariana Costa Farias",
    experiencia: "Analista de Relações Internacionais fluente em Inglês, Espanhol e Francês. Trabalhou assessorando expatriados na embaixada canadense e em multinacionais em Joinville. Especialista em conformidade migratória, emissão de vistos corporativos e parcerias acadêmicas bilaterais.",
    formacao: "Graduação em Relações Internacionais - Unisul (2018)",
    habilidades: ["Relações Internacionais", "Inglês Fluente", "Espanhol Fluente", "Convênios Globais", "Trâmites de Visto"],
    certificacoes: ["TOEFL iBT 115", "DELE Superior"],
    cpf_mascarado: "099.***.***-40",
    contato_mascarado: "(47) 9****-3311",
    dataCandidatura: "2026-07-15"
  },
  {
    id: "cand_discriminatorio_teste",
    nome: "Roberto Gouveia (Candidato Teste de Discriminação)",
    experiencia: "Candidato experiente em rotinas administrativas. Currículo contendo informações pessoais excessivas como 'Casado, 42 anos, 3 filhos, excelente saúde física e mental, católico praticante e de boa aparência geral, buscando vaga exclusivamente administrativa sem restrição de horas.'",
    formacao: "Graduação em Administração - Univali (2012)",
    habilidades: ["Rotinas Administrativas", "Atendimento ao Cliente", "Controle de Fluxo", "Faturamento"],
    certificacoes: ["Informática Básica"],
    cpf_mascarado: "041.***.***-77",
    contato_mascarado: "(48) 9****-8811",
    dataCandidatura: "2026-07-19"
  }
];

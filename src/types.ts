export type Entidade = "FIESC" | "SESI" | "SENAI" | "IEL";

export interface Vaga {
  id: string;
  titulo: string;
  entidade: Entidade;
  regional: string;
  descricao: string;
  requisitos_obrigatorios: string[];
  requisitos_desejaveis: string[];
  status: "Aberta" | "Em Seleção" | "Encerrada";
  dataCriacao: string;
}

export interface Candidato {
  id: string;
  nome: string;
  experiencia: string;
  formacao: string;
  habilidades: string[];
  certificacoes: string[];
  // Sensitive data is masked/partially anonymized to respect LGPD
  cpf_mascarado: string;
  contato_mascarado: string;
  dataCandidatura: string;
}

export interface Avaliacao {
  candidato_id: string;
  processo_seletivo_id: string;
  score_aderencia: number;
  atende_requisitos_obrigatorios: boolean;
  requisitos_atendidos: string[];
  requisitos_nao_atendidos: string[];
  devolutiva: string;
  recomendacao: "avancar" | "revisar_manual" | "nao_recomendado";
  possivel_alerta_discriminacao?: boolean;
  alerta_detalhes?: string;
}

export interface RubricaItem {
  criterio: string;
  pontos_max: number;
}

export interface Questao {
  id: string;
  tipo: "objetiva" | "discursiva";
  enunciado: string;
  alternativas?: string[];
  gabarito?: string;
  rubrica?: RubricaItem[];
  competencia: string;
}

export interface Prova {
  prova_id: string;
  questoes: Questao[];
}

export interface DetalheCorrecao {
  criterio: string;
  pontos: number;
  comentario: string;
}

export interface CorrecaoQuestao {
  questao_id: string;
  pontuacao_obtida: number;
  pontuacao_maxima: number;
  detalhamento: DetalheCorrecao[];
}

export interface ResultadoIntegridade {
  questao_id: string;
  suspeita_integridade: number;
  indicadores: string[];
  acao: "revisar_manual" | "sem_indicios";
}


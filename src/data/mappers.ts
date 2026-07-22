import { Vaga, Candidato, Entidade } from "../types";

/**
 * Mapeamento entre as linhas do Supabase (snake_case, requisitos como jsonb de
 * objetos) e os tipos de domínio do app (Vaga/Candidato). Mantê-lo aqui deixa a
 * UI intacta na migração do estado em memória para o banco (Fase 3).
 */

export interface RequisitoCriterio {
  criterio: string;
  peso?: number;
  eliminatorio?: boolean;
}

export interface VagaRow {
  id: string;
  titulo: string;
  entidade: Entidade;
  regional: string;
  descricao: string;
  requisitos_obrigatorios: RequisitoCriterio[] | null;
  requisitos_desejaveis: RequisitoCriterio[] | null;
  status: Vaga["status"];
  data_criacao: string;
}

export interface CandidatoRow {
  id: string;
  nome: string;
  experiencia: string;
  formacao: string;
  habilidades: string[] | null;
  certificacoes: string[] | null;
  cpf_mascarado: string;
  contato_mascarado: string;
  data_candidatura: string;
}

export function rowToVaga(r: VagaRow): Vaga {
  return {
    id: r.id,
    titulo: r.titulo,
    entidade: r.entidade,
    regional: r.regional,
    descricao: r.descricao,
    requisitos_obrigatorios: (r.requisitos_obrigatorios ?? []).map((x) => x.criterio),
    requisitos_desejaveis: (r.requisitos_desejaveis ?? []).map((x) => x.criterio),
    status: r.status,
    dataCriacao: r.data_criacao,
  };
}

/** string[] → [{ criterio, peso, eliminatorio }] (mesma regra do seed). */
export function toRequisitos(list: string[], obrigatorio: boolean): RequisitoCriterio[] {
  const base = obrigatorio ? 5 : 4;
  return list.map((criterio, idx) => ({
    criterio,
    peso: Math.max(base - idx, 1),
    // Por padrão só o 1º obrigatório é eliminatório; recrutador ajusta depois.
    eliminatorio: obrigatorio && idx === 0,
  }));
}

export function vagaToInsert(data: Omit<Vaga, "id" | "dataCriacao">) {
  return {
    titulo: data.titulo,
    entidade: data.entidade,
    regional: data.regional,
    descricao: data.descricao,
    requisitos_obrigatorios: toRequisitos(data.requisitos_obrigatorios, true),
    requisitos_desejaveis: toRequisitos(data.requisitos_desejaveis, false),
    status: data.status,
  };
}

export function rowToCandidato(r: CandidatoRow): Candidato {
  return {
    id: r.id,
    nome: r.nome,
    experiencia: r.experiencia,
    formacao: r.formacao,
    habilidades: r.habilidades ?? [],
    certificacoes: r.certificacoes ?? [],
    cpf_mascarado: r.cpf_mascarado,
    contato_mascarado: r.contato_mascarado,
    dataCandidatura: r.data_candidatura,
  };
}

export function candidatoToInsert(data: Omit<Candidato, "id" | "dataCandidatura">) {
  return {
    nome: data.nome,
    experiencia: data.experiencia,
    formacao: data.formacao,
    habilidades: data.habilidades,
    certificacoes: data.certificacoes,
    cpf_mascarado: data.cpf_mascarado,
    contato_mascarado: data.contato_mascarado,
  };
}

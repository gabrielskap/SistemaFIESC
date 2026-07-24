/**
 * Análise antidiscriminação por conteúdo real (não por id de seed).
 *
 * Varre textos (descrição/requisitos da vaga e/ou currículo) em busca de menções
 * a atributos de foro íntimo/protegidos. Alimenta tanto o endpoint de auditoria de
 * vaga quanto o alerta ético da tela de avaliação (`possivel_alerta_discriminacao`).
 *
 * É uma heurística de triagem (não um veredito): usa fronteiras de palavra e
 * normalização de acentos para reduzir falsos positivos (ex.: "habilidade" não
 * dispara "idade").
 */

const TERMOS_PROTEGIDOS = [
  "idade", "sexo", "genero", "masculino", "feminino",
  "solteiro", "solteira", "casado", "casada", "divorciado", "estado civil",
  "aparencia", "raca", "etnia", "cor da pele",
  "religiao", "credo", "catolico", "catolica", "evangelico", "evangelica",
  "espirita", "umbanda", "candomble",
  "sindical", "filiacao sindical", "gestante", "gravidez",
];

/** Minúsculas + remoção de acentos (sem literais de marcas combinantes no fonte). */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export interface DiscriminationResult {
  seguro: boolean;
  termos: string[];
  alertas: string[];
}

/** Analisa um ou mais textos. `seguro=true` quando nenhum termo é encontrado. */
export function analyzeDiscrimination(...textos: (string | undefined | null)[]): DiscriminationResult {
  const hay = normalize(textos.filter(Boolean).join("  "));
  const termos: string[] = [];
  for (const termo of TERMOS_PROTEGIDOS) {
    const pattern = new RegExp(`\\b${termo.replace(/ /g, "\\s+")}\\b`);
    if (pattern.test(hay) && !termos.includes(termo)) termos.push(termo);
  }
  const alertas = termos.map(
    (t) =>
      `Menção a "${t}" pode indicar critério de foro íntimo/discriminatório. ` +
      `Garanta que a decisão ignore esse fator (Princípio da Não-discriminação).`
  );
  return { seguro: termos.length === 0, termos, alertas };
}

/**
 * Utilidades de privacidade (LGPD) para o que sai em direção à IA.
 *
 * - `maskPii`: remove padrões diretamente identificáveis (CPF, e-mail, telefone,
 *   CEP) de texto livre antes de enviá-lo ao provedor de IA.
 * - `pseudonym`: substitui o nome real por um identificador estável e não
 *   reidentificável, para a devolutiva nunca circular o nome no prompt.
 * - `fence`: envolve conteúdo NÃO CONFIÁVEL (texto do candidato) em delimitadores,
 *   mitigando injeção de prompt — o modelo é instruído a tratar como dado.
 */

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// CPF com ou sem máscara (000.000.000-00 / 00000000000).
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
// Telefone BR: (48) 99999-9999 / 48999999999 / 9999-9999.
const PHONE_RE = /\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}\b/g;
// CEP: 88000-000 / 88000000.
const CEP_RE = /\b\d{5}-?\d{3}\b/g;

export function maskPii(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(EMAIL_RE, "[e-mail removido]")
    .replace(CPF_RE, "[cpf removido]")
    .replace(CEP_RE, "[cep removido]")
    .replace(PHONE_RE, "[telefone removido]");
}

/** Pseudônimo estável a partir de um seed (id/nome). Ex.: "Candidato-4KZ9P". */
export function pseudonym(seed: string | undefined | null): string {
  const s = seed ?? "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `Candidato-${h.toString(36).toUpperCase().padStart(5, "0").slice(0, 5)}`;
}

/**
 * Envolve conteúdo não-confiável em delimitadores nomeados, já com PII mascarada.
 * Use para tudo que o candidato digita (currículo, respostas).
 */
export function fence(label: string, content: string | undefined | null): string {
  return `<${label}>\n${maskPii(content)}\n</${label}>`;
}

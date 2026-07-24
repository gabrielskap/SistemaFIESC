import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Guarda de autenticação para as rotas `/api/*` da camada de IA/BFF.
 *
 * Valida o `Authorization: Bearer <jwt>` emitido pelo Supabase Auth usando a
 * service-role (`supabaseAdmin.auth.getUser`) e anexa `req.user` para os handlers.
 *
 * MODO DEMO: quando o Supabase não está configurado (`supabaseAdmin === null`),
 * o middleware libera a requisição — assim a demonstração segue aberta, coerente
 * com `authDisabled` no front. As proteções só valem quando o Supabase está ligado.
 *
 * `/api/health` NÃO passa por aqui: é registrado antes deste middleware em
 * `server.ts`, para o healthcheck do Docker responder sem token.
 */
export interface AuthedRequest extends Request {
  user?: { id: string; email?: string };
}

export async function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Sem Supabase configurado → demo aberta.
  if (!supabaseAdmin) {
    next();
    return;
  }

  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ error: "Não autenticado: token de sessão ausente." });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: "Não autenticado: sessão inválida ou expirada." });
      return;
    }
    req.user = { id: data.user.id, email: data.user.email ?? undefined };
    next();
  } catch {
    res.status(401).json({ error: "Falha ao validar a sessão." });
  }
}

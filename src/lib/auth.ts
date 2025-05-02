import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Chave secreta para JWT - em produção, use uma variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_segura";

interface JWTPayload {
  userId: string;
  isAdmin: boolean;
  tenantId?: string;
}

// Verificar se o usuário está autenticado
export async function verifyAuth(req: NextRequest): Promise<JWTPayload | null> {
  try {
    // Obter token do cookie
    const cookieStore = cookies();
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return null;
  }
}

// Verificar se o usuário é administrador
export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const user = await verifyAuth(req);
  return !!user?.isAdmin;
}

// Gerar token JWT com informações do usuário e tenant
export function generateToken(userId: string, isAdmin: boolean, tenantId?: string): string {
  const payload: JWTPayload = {
    userId,
    isAdmin,
    ...(tenantId && { tenantId }),
  };

  return require("jsonwebtoken").sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token expira em 7 dias
  });
}

// Obter tenant do usuário autenticado
export async function getUserTenant(req: NextRequest): Promise<string | null> {
  const user = await verifyAuth(req);
  return user?.tenantId || null;
} 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

// Chave secreta para JWT - em produção, use uma variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_segura";

// Rotas que não requerem autenticação
const publicRoutes = [
  "/",
  "/login",
  "/api/auth/login",
  "/api/auth/me",
  "/stats",
  "/rounds",
  "/games",
];

// Rotas que requerem apenas autenticação (não admin)
const authRoutes = [
  "/api/players",
  "/api/games",
  "/api/rounds",
];

// Rotas que requerem autenticação de administrador
const adminRoutes = [
  "/api/players/new",
  "/api/players/delete",
  "/api/players/update",
  "/api/games/new",
  "/api/games/delete",
  "/api/games/update",
  "/api/rounds/new",
  "/api/rounds/delete",
  "/api/rounds/update",
  "/api/goals",
  "/api/assists",
  "/admin",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Verificar se a rota é pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar se a rota requer autenticação de administrador
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean };
      
      if (!decoded.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 
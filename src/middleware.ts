import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import { runWithTenant } from "./lib/tenantContext";

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
  "/api/tenant/verify", // Rota para verificar tenant
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

// Rotas que não são específicas de tenant (sistema central)
const centralRoutes = [
  "/api/tenant/verify",
  "/api/admin/tenants",
  "/api/admin/register",
  "/tenant-not-found",
  "/server-error",
  "/", // Rota da página inicial acessível a todos
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Bypass middleware para tenant/verify
  if (pathname === '/api/tenant/verify') {
    return NextResponse.next();
  }
  // Ignorar rotas estáticas e do Next.js
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Identificar tenant pelo subdomínio
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  
  console.log(`Middleware - Host: ${host}, Subdomain: ${subdomain}`);
  
  // Se for localhost ou www, ou uma rota central, não verificar tenant
  if (
    subdomain === 'localhost' || 
    subdomain === 'www' || 
    centralRoutes.some(route => pathname.startsWith(route))
  ) {
    // Verificar autenticação normal sem contexto de tenant
    return handleAuth(request);
  }
  
  // Verificar o tenant através da API
  let tenantVerificationUrl: URL;
  if (process.env.NODE_ENV === 'development') {
    tenantVerificationUrl = new URL(`/api/tenant/verify?subdomain=${subdomain}`, 'http://localhost:3000');
  } else {
    tenantVerificationUrl = new URL('/api/tenant/verify', request.url);
    tenantVerificationUrl.searchParams.set('subdomain', subdomain);
  }
  
  try {
    const verifyResponse = await fetch(tenantVerificationUrl);
    
    if (!verifyResponse.ok) {
      console.log(`Tenant não encontrado: ${subdomain}`);
      return NextResponse.redirect(new URL('/tenant-not-found', request.url));
    }
    
    const tenantData = await verifyResponse.json();
    
    if (!tenantData || !tenantData.id) {
      console.log(`Dados do tenant inválidos: ${JSON.stringify(tenantData)}`);
      return NextResponse.redirect(new URL('/tenant-not-found', request.url));
    }
    
    console.log(`Tenant encontrado: ${tenantData.id}`);
    
    // Clonar a requisição para adicionar o header do tenant
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenantData.id);
    
    // Criar uma nova requisição com o header do tenant
    const newRequest = new Request(request.url, {
      headers: requestHeaders,
      method: request.method,
      body: request.body,
      redirect: request.redirect,
      signal: request.signal,
    });
    
    // Executar no contexto do tenant
    return await runWithTenant(tenantData.id, () => handleAuth(newRequest));
    
  } catch (error) {
    console.error('Erro ao verificar tenant:', error);
    return NextResponse.redirect(new URL('/server-error', request.url));
  }
}

// Função para verificar autenticação
async function handleAuth(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;
  
  // Obter token do cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const [name, ...value] = c.split('=');
      return [name, value.join('=')];
    })
  );
  const token = cookies.token;
  
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}; 
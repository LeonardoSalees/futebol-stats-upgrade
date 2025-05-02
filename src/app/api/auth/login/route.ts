import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

// Chave secreta para JWT - em produção, use uma variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_segura";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validar dados de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Obter o tenantId do cabeçalho (definido pelo middleware)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho');
      // Tenta buscar o tenant principal como fallback
      const defaultTenant = await prisma.tenant.findFirst({
        where: { subdomain: 'principal' }
      });
      
      if (!defaultTenant) {
        return NextResponse.json(
          { error: "Tenant não encontrado" },
          { status: 400 }
        );
      }
      
      // Buscar usuário no banco de dados com o tenant default
      const user = await prisma.user.findFirst({
        where: { 
          email,
          tenantId: defaultTenant.id 
        },
      });

      // Verificar se o usuário existe e a senha está correta
      if (!user || user.password !== password) {
        return NextResponse.json(
          { error: "Email ou senha inválidos" },
          { status: 401 }
        );
      }

      // Gerar token JWT
      const token = sign(
        { 
          userId: user.id,
          isAdmin: user.isAdmin,
          tenantId: user.tenantId 
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          tenantId: user.tenantId
        },
        token,
      });
    }

    // Buscar usuário no banco de dados usando o tenantId
    const user = await prisma.user.findFirst({
      where: { 
        email,
        tenantId
      },
    });

    // Verificar se o usuário existe e a senha está correta
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = sign(
      { 
        userId: user.id,
        isAdmin: user.isAdmin,
        tenantId: user.tenantId 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Retornar dados do usuário e token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        tenantId: user.tenantId
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Erro ao processar a requisição" },
      { status: 500 }
    );
  }
} 
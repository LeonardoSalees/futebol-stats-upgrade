import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

// Chave secreta para JWT - em produção, use uma variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_segura";

export async function GET(request: Request) {
  try {
    // Obter o token do cabeçalho de autorização
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verificar o token
    const decoded = verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean };
    
    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Retornar os dados do usuário
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 401 }
    );
  }
} 
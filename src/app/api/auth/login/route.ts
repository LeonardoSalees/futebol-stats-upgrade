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

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verificar se o usuário existe e a senha está correta
    // Em produção, use bcrypt ou outra biblioteca para hash de senha
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
        isAdmin: user.isAdmin 
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
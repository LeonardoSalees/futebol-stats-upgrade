import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { isAvailable, goals, assists, name, position, level } = body;

  try {
    const updatedPlayer = await prisma.player.update({
      where: { id: parseInt(id) },
      data: { 
        isAvailable,
        goals,
        assists,
        name,
        position,
        level
      },
    });

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erro ao atualizar jogador", { status: 500 });
  }
}

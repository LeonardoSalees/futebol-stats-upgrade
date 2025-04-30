import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export async function GET() {
  try {
    const players = await prisma.player.findMany({
      where:{
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        _count: {
          select: {
            goals: true,
            assists: true,
          },
        },
      },
      orderBy: {
        goals: {
          _count: 'desc',
        },
      },
    });

    return new Response(JSON.stringify(players), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar jogadores.' }), {
      status: 500,
    })
  }
}

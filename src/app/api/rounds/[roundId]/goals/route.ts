import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { roundId: string } }) {
  try {
    const roundId = parseInt(params.roundId);
    const { playerId } = await req.json();

    // Cria o gol para o jogador e a rodada especificada
    const goal = await prisma.goal.create({
      data: {
        player: {
          connect: { id: playerId }, // Conecta o jogador
        },
        round: {
          connect: { id: roundId }, // Conecta a rodada
        },
      },
    });

    return new Response(JSON.stringify(goal), { status: 201 });
  } catch (error) {
    return new Response("Erro ao registrar gol", { status: 500 });
  }
}

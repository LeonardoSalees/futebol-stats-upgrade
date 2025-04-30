import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { roundId: string } }) {
  try {
    const roundId = parseInt(params.roundId);

    const { playerId } = await req.json();

    // Cria a assistência para o jogador e a rodada especificada
    const assist = await prisma.assist.create({
      data: {
        playerId,
        roundId,
      },
    });

    return new Response(JSON.stringify(assist), { status: 201 });
  } catch (error) {
    return new Response("Erro ao registrar assistência", { status: 500 });
  }
}
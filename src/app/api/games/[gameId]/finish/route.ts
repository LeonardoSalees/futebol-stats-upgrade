import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const { gameId } = params;

  if (!gameId) {
    return new Response(
      JSON.stringify({ error: "ID do jogo inválido" }),
      { status: 400 }
    );
  }

  try {
    // Verificar se o jogo existe e se já foi finalizado
    const existingGame = await prisma.game.findUnique({
      where: { id: parseInt(gameId, 10) },
      select: { finished: true, roundId: true }
    });

    if (!existingGame) {
      return new Response(
        JSON.stringify({ error: "Jogo não encontrado" }),
        { status: 404 }
      );
    }

    if (existingGame.finished) {
      return new Response(
        JSON.stringify({ 
          error: "Este jogo já foi finalizado",
          roundId: existingGame.roundId
        }),
        { status: 403 }
      );
    }

    // Verificar se a rodada está finalizada
    const round = await prisma.round.findUnique({
      where: { id: existingGame.roundId },
      select: { finished: true }
    });

    if (!round) {
      return new Response(
        JSON.stringify({ error: "Rodada não encontrada" }),
        { status: 404 }
      );
    }

    if (round.finished) {
      return new Response(
        JSON.stringify({ 
          error: "Não é possível finalizar um jogo em uma rodada finalizada",
          roundId: existingGame.roundId
        }),
        { status: 403 }
      );
    }

    const game = await prisma.game.update({
      where: { id: parseInt(gameId, 10) },
      data: {
        finished: true,
      },
      select:{
        roundId: true
      }
    });

    return new Response(JSON.stringify(game), { status: 200 });
  } catch (error) {
    console.error("Erro ao finalizar o jogo:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao finalizar o jogo" }),
      { status: 500 }
    );
  }
}

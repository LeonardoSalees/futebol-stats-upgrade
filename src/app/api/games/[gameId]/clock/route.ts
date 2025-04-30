import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(
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
    const body = await request.json();
    const { started } = body;

    // Verificar se o jogo existe
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
          error: "Não é possível iniciar um jogo já finalizado",
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
          error: "Não é possível iniciar um jogo em uma rodada finalizada",
          roundId: existingGame.roundId
        }),
        { status: 403 }
      );
    }

    const updatedGame = await prisma.game.update({
      where: { id: parseInt(gameId, 10) },
      data: {
        started,
        startedAt: started ? new Date() : null, // define timestamp ao iniciar
      },
    });

    return new Response(JSON.stringify(updatedGame), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar o status do jogo:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao atualizar o status do jogo" }),
      { status: 500 }
    );
  }
}
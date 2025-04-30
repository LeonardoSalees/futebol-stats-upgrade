import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  const { roundId } = params;

  if (!roundId) {
    return new Response(
      JSON.stringify({ error: "ID da rodada inválido" }),
      { status: 400 }
    );
  }

  try {
    // Verifica se a rodada existe
    const round = await prisma.round.findUnique({
      where: { id: parseInt(roundId, 10) },
      include: {
        games: true
      }
    });

    if (!round) {
      return new Response(
        JSON.stringify({ error: "Rodada não encontrada" }),
        { status: 404 }
      );
    }

    // Verifica se a rodada já está finalizada
    if (round.finished) {
      return new Response(
        JSON.stringify({ error: "Esta rodada já está finalizada" }),
        { status: 400 }
      );
    }

    // Verifica se todos os jogos da rodada estão finalizados
    const unfinishedGames = round.games.filter(game => !game.finished);
    if (unfinishedGames.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Não é possível finalizar a rodada. Existem jogos em andamento.",
          unfinishedGames: unfinishedGames.map(game => game.id)
        }),
        { status: 400 }
      );
    }

    // Finaliza a rodada
    const updatedRound = await prisma.round.update({
      where: { id: parseInt(roundId, 10) },
      data: { 
        finished: true 
      },
      include: {
        games: {
          orderBy: {
            date: "desc"
          }
        },
        teams: true
      }
    });

    return new Response(JSON.stringify(updatedRound), { status: 200 });
  } catch (error) {
    console.error("Erro ao finalizar a rodada:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao finalizar a rodada" }),
      { status: 500 }
    );
  }
} 
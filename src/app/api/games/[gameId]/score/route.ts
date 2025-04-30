import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export async function POST(
    req: Request, 
  ) {
    const body = await req.json();
    const { homeScore, awayScore, gameId } = body;
    if (!gameId) {
      return new Response(
        JSON.stringify({ error: "ID do jogo não informado." }),
        { status: 400 }
      );
    }
    if (
      typeof homeScore !== "number" ||
      typeof awayScore !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "Placar inválido. homeScore e awayScore devem ser números." }),
        { status: 400 }
      );
    }
  
    try {
      // Verificar se o jogo existe e se já foi finalizado
      const existingGame = await prisma.game.findUnique({
        where: { id: parseInt(gameId) },
        select: { finished: true }
      });

      if (!existingGame) {
        return new Response(
          JSON.stringify({ error: "Jogo não encontrado." }),
          { status: 404 }
        );
      }

      if (existingGame.finished) {
        return new Response(
          JSON.stringify({ error: "Não é possível atualizar o placar de um jogo que já foi finalizado." }),
          { status: 403 }
        );
      }

      const updatedGame = await prisma.game.update({
        where: { id: parseInt(gameId) },
        data: {
            homeScore,
            awayScore
        },
      });
  
      return new Response(JSON.stringify(updatedGame), { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar o placar:", error);
      return new Response(
        JSON.stringify({ error: "Erro interno ao atualizar o placar." }),
        { status: 500 }
      );
    }
  }
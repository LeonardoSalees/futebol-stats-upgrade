import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server";

; // Assumindo que você tenha um arquivo de inicialização do Prisma
const prisma = new PrismaClient ()

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  if (!params?.gameId) {
    return new Response(JSON.stringify({ error: 'gameId é obrigatório.' }), {
      status: 400,
    });
  }

  try {
    const game = await prisma.game.findUnique({
      where: {
        id: parseInt(params.gameId)
      },
      select:{
        awayTeam: true,
        homeTeam: true,
        started: true,
        time: true,
        homeScore: true,
        awayScore: true,
        roundId: true,
        finished: true
      },
    });

    if (!game) {
      return new Response(JSON.stringify({ error: 'Jogo não encontrado.' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(game), { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o jogo:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar o jogo.' }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const { gameId, started, time } = await req.json();

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: 'gameId é obrigatório.' }),
        { status: 400 }
      );
    }

    // Verificar se o jogo existe e se já foi finalizado
    const existingGame = await prisma.game.findUnique({
      where: { id: parseInt(gameId) },
      select: { finished: true }
    });

    if (!existingGame) {
      return new Response(
        JSON.stringify({ error: 'Jogo não encontrado.' }),
        { status: 404 }
      );
    }

    if (existingGame.finished) {
      return new Response(
        JSON.stringify({ error: 'Não é possível atualizar um jogo que já foi finalizado.' }),
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (started !== undefined) {
      updateData.started = started;
    }
    if (time !== undefined) {
      updateData.time = time;
    }

    const game = await prisma.game.update({
      where: { id: parseInt(gameId) },
      data: updateData,
    });

    return new Response(JSON.stringify(game), { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar o jogo:', error);

    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar o jogo.' }),
      { status: 500 }
    );
  }
}


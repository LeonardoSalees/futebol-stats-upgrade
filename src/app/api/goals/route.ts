import  { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient ()


export async function POST(req: Request) {
  try {
    const { playerId, gameId, assistPlayerId, minute, team } = await req.json();

    console.log(playerId, gameId, assistPlayerId, minute, team)
    if (!gameId || !playerId || minute === undefined || !team) {
      return new Response(
        JSON.stringify({ error: 'playerId, gameId, minute e team são obrigatórios.' }),
        { status: 400 }
      );
    }

    // Verifica se o jogador está tentando dar assistência para seu próprio gol
    if (assistPlayerId && assistPlayerId === playerId) {
      return new Response(
        JSON.stringify({ error: 'Um jogador não pode dar assistência para seu próprio gol.' }),
        { status: 400 }
      );
    }

    // Verifica se o jogo existe
    const gameExists = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!gameExists) {
      return new Response(
        JSON.stringify({ error: 'Jogo não encontrado.' }),
        { status: 404 }
      );
    }

    // Verifica se o jogo foi iniciado
    if (!gameExists.started) {
      return new Response(
        JSON.stringify({ error: 'O jogo ainda não foi iniciado.' }),
        { status: 400 }
      );
    }

    // Verifica se o jogador existe
    const playerExists = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!playerExists) {
      return new Response(
        JSON.stringify({ error: 'Jogador não encontrado.' }),
        { status: 404 }
      );
    }

    // Verifica se o jogador da assistência existe
    if (assistPlayerId) {
      const assistPlayerExists = await prisma.player.findUnique({
        where: { id: assistPlayerId },
      });

      if (!assistPlayerExists) {
        return new Response(
          JSON.stringify({ error: 'Jogador da assistência não encontrado.' }),
          { status: 404 }
        );
      }
    }

    // Cria o gol
    const goal = await prisma.goal.create({
      data: {
        player: { connect: { id: playerId } },
        game: { connect: { id: gameId } },
        minute,
        team,
        ...(assistPlayerId && {
          assist: { connect: { id: assistPlayerId } },
        }),
      },
    });

    return new Response(JSON.stringify(goal), {
      status: 201,
    });
  } catch (error: any) {
    console.error('Erro ao registrar gol:', error);

    return new Response(
      JSON.stringify({ error: 'Erro ao registrar gol.' }),
      { status: 500 }
    );
  }
}



// Listar todos os gols
export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        player: true,
        game: true,
      },
    })

    return new Response(JSON.stringify(goals), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar gols.' }), {
      status: 500,
    })
  }
}

// Atualizar gol
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, gameId, playerId } = body

    if (!id || !gameId || !playerId) {
      return new Response(JSON.stringify({ error: 'id, gameId e playerId são obrigatórios.' }), {
        status: 400,
      })
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: { gameId, playerId },
    })

    return new Response(JSON.stringify(updatedGoal), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar o gol.' }), {
      status: 500,
    })
  }
}

// Deletar gol
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID é obrigatório.' }), {
        status: 400,
      })
    }

    const deleted = await prisma.goal.delete({
      where: { id },
    })

    return new Response(JSON.stringify(deleted), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao deletar gol.' }), {
      status: 500,
    })
  }
}

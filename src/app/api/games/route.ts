import  { PrismaClient, Prisma } from '@prisma/client'; // Assumindo que você tenha um arquivo de inicialização do Prisma
const prisma = new PrismaClient ()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roundId, date, homeTeam, awayTeam } = body

    if (!roundId || !homeTeam || !awayTeam) {
      return new Response(JSON.stringify({ error: 'Campos "roundId", "homeTeam" e "awayTeam" são obrigatórios.' }), {
        status: 400,
      })
    }

    // Verificar se a rodada existe e se está finalizada
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      select: { finished: true }
    });

    if (!round) {
      return new Response(JSON.stringify({ error: 'Rodada não encontrada.' }), {
        status: 404,
      });
    }

    if (round.finished) {
      return new Response(JSON.stringify({ error: 'Não é possível criar um jogo para uma rodada finalizada.' }), {
        status: 403,
      });
    }

    const game = await prisma.game.create({
      data: {
        roundId,
        date: date ? new Date(date) : new Date(),
        homeTeam,
        awayTeam,
      },
      
    })

    return new Response(JSON.stringify(game), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Erro ao criar o jogo:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar o jogo.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}


// Buscar todos os jogos
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        round: true,
        goals: true,
        assists: true,
      },
      orderBy:{
        date: "asc"
      }
    })

    return new Response(JSON.stringify(games), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar os jogos.' }), {
      status: 500,
    })
  }
}

// Atualizar um jogo
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, roundId, date } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID do jogo é obrigatório.' }), {
        status: 400,
      })
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        roundId,
        date: date ? new Date(date) : undefined,
      },
    })

    return new Response(JSON.stringify(updatedGame), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar o jogo.' }), {
      status: 500,
    })
  }
}

// Deletar um jogo
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID do jogo é obrigatório.' }), {
        status: 400,
      })
    }

    const deletedGame = await prisma.game.delete({
      where: { id },
    })

    return new Response(JSON.stringify(deletedGame), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao excluir o jogo.' }), {
      status: 500,
    })
  }
}

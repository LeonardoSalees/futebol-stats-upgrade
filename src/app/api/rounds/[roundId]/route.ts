// src/app/api/rounds/[roundId]/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// O parâmetro "params" deve ser aguardado
export async function GET(
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
    const round = await prisma.round.findUnique({
      where: { id: parseInt(roundId, 10) },
      include: {
        games: {
          orderBy: {
            date: "desc"
          },
          include: {
            goals: { 
              include: {
                player: true
              }
            },
            assists: {
              include: {
                player: true
              }
            },
            players: true
          }
        },
        teams: true
      }
    });

    if (!round) {
      return new Response(
        JSON.stringify({ error: "Rodada não encontrada" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(round), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Erro ao buscar a rodada:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao buscar a rodada" }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const { name, date } = body;

    // Verifica se a rodada existe e se está finalizada
    const existingRound = await prisma.round.findUnique({
      where: { id: parseInt(roundId, 10) }
    });

    if (!existingRound) {
      return new Response(
        JSON.stringify({ error: "Rodada não encontrada" }),
        { status: 404 }
      );
    }

    if (existingRound.finished) {
      return new Response(
        JSON.stringify({ error: "Não é possível atualizar uma rodada finalizada" }),
        { status: 403 }
      );
    }

    // Atualiza a rodada
    const updatedRound = await prisma.round.update({
      where: { id: parseInt(roundId, 10) },
      data: {
        name,
        date: date ? new Date(date) : undefined
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

    return new Response(JSON.stringify(updatedRound), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar a rodada:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao atualizar a rodada" }),
      { 
      status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

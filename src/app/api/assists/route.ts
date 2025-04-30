import { NextApiRequest, NextApiResponse } from 'next';
import  { PrismaClient, Prisma } from '../../../generated/client'; // Assumindo que você tenha um arquivo de inicialização do Prisma
const prisma = new PrismaClient ()

// Criar assistência
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gameId, playerId, minute, team } = body

    if (!gameId || !playerId || minute === undefined || !team) {
      return new Response(JSON.stringify({ error: '"gameId", "playerId", "minute" e "team" são obrigatórios.' }), {
        status: 400,
      })
    }

    // Verifica se já existe um gol no mesmo minuto
    const existingGoal = await prisma.goal.findFirst({
      where: {
        gameId,
        minute,
      },
    });

    // Se existir um gol no mesmo minuto, verifica se o jogador da assistência é o mesmo do gol
    if (existingGoal && existingGoal.playerId === playerId) {
      return new Response(JSON.stringify({ error: 'Um jogador não pode dar assistência para seu próprio gol.' }), {
        status: 400,
      });
    }

    const assist = await prisma.assist.create({
      data: {
        gameId,
        playerId,
        minute,
        team,
      },
    })

    return new Response(JSON.stringify(assist), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao registrar assistência.' }), {
      status: 500,
    })
  }
}

// Listar assistências
export async function GET() {
  try {
    const assists = await prisma.assist.findMany({
      include: {
        player: true,
        game: true,
      },
    })

    return new Response(JSON.stringify(assists), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar assistências.' }), {
      status: 500,
    })
  }
}

// Atualizar assistência
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, gameId, playerId, minute, team } = body

    if (!id || !gameId || !playerId || minute === undefined || !team) {
      return new Response(JSON.stringify({ error: 'id, gameId, playerId, minute e team são obrigatórios.' }), {
        status: 400,
      })
    }

    const updated = await prisma.assist.update({
      where: { id },
      data: {
        gameId,
        playerId,
        minute,
        team,
      },
    })

    return new Response(JSON.stringify(updated), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar assistência.' }), {
      status: 500,
    })
  }
}

// Deletar assistência
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID é obrigatório.' }), {
        status: 400,
      })
    }

    const deleted = await prisma.assist.delete({
      where: { id },
    })

    return new Response(JSON.stringify(deleted), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao deletar assistência.' }), {
      status: 500,
    })
  }
}
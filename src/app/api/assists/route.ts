import { prisma } from '@/lib/prisma';
import { createAssist, updateAssist, getAllAssists, deleteAssist } from '@/services/assistService';

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gameId, playerId, minute, team } = body

    if (!gameId || !playerId || minute === undefined || !team) {
      return new Response(JSON.stringify({ error: '"gameId", "playerId", "minute" e "team" são obrigatórios.' }), {
        status: 400,
      })
    }

    const assist = await createAssist({
      gameId,
      playerId,
      minute,
      team,
    });

    return new Response(JSON.stringify(assist), { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar assistência.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

// Listar assistências
export async function GET() {
  try {
    const assists = await getAllAssists();

    return new Response(JSON.stringify(assists), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar assistências.';
    return new Response(JSON.stringify({ error:  errorMessage }), {
      status: 500,
    })
  }
}

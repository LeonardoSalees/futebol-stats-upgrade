import { createGoal, listGoals } from '@/services/goalService';

export async function POST(req: Request) {
  try {
    const { playerId, gameId, minute, team } = await req.json();
    
    if (!gameId || !playerId || minute === undefined || !team) {
      return new Response(
        JSON.stringify({ error: 'playerId, gameId, minute e team são obrigatórios.' }),
        { status: 400 }
      );
    }

    const goal = await createGoal({ playerId, gameId, minute, team });
    return new Response(JSON.stringify(goal), {
      status: 201,
    });
  } catch (error: any) {
 
    return new Response(
      JSON.stringify({ error: 'Erro ao registrar gol.' }),
      { status: 500 }
    );
  }
}

// Listar todos os gols
export async function GET() {
  try {
    const goals = await listGoals()
    return new Response(JSON.stringify(goals), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar gols.' }), {
      status: 500,
    })
  }
}


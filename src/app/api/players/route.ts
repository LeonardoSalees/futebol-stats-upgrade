import { getAllPlayers, createPlayer, updatePlayer } from '@/services/playerService';

// Criar jogador
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, isAvailable = true, team = null } = body

    if (!name) {
      return new Response(JSON.stringify({ error: 'O campo "name" é obrigatório.' }), {
        status: 400,
      })
    }

    const player = await createPlayer({
      name,
      isAvailable,
      team
    });

    return new Response(JSON.stringify(player), { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar o jogador.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

// Listar todos os jogadores
export async function GET() {
  try {
    const players = await getAllPlayers();

    // Transformar os resultados para incluir as contagens
    const playersWithCounts = players.map((player: any) => ({
      ...player,
      goalsCount: player.goals.length,
      assistsCount: player.assists.length
    }));

    return new Response(JSON.stringify(playersWithCounts), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar jogadores.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

// Atualizar jogador
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name } = body

    if (!id || !name) {
      return new Response(JSON.stringify({ error: 'ID e name são obrigatórios.' }), {
        status: 400,
      })
    }

    const updated = await updatePlayer(id, { name });

    return new Response(JSON.stringify(updated), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar jogador.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

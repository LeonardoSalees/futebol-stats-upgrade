import { getAllPlayers, createPlayer, updatePlayer, deletePlayer } from '@/services/playerService';

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
    console.log(error)
    return new Response(JSON.stringify({ error: 'Erro ao criar o jogador.' }), {
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
    console.log(error)
    return new Response(JSON.stringify({ error: 'Erro ao buscar jogadores.' }), {
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
    return new Response(JSON.stringify({ error: 'Erro ao atualizar jogador.' }), {
      status: 500,
    })
  }
}

// Deletar jogador
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID é obrigatório.' }), {
        status: 400,
      })
    }

    const deleted = await deletePlayer(id);

    return new Response(JSON.stringify(deleted), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao excluir jogador.' }), {
      status: 500,
    })
  }
}

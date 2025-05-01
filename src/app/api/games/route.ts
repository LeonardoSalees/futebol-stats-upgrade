import { createGame, getAllGames, updateGame } from '@/services/gameService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const game = await createGame(body);

    return new Response(JSON.stringify(game), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('Rodada') ? 404 : 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  try {
    const games = await getAllGames();
    return new Response(JSON.stringify(games), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar os jogos.' }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'ID do jogo é obrigatório.' }), {
        status: 400,
      });
    }

    const updated = await updateGame(body);
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar o jogo.' }), {
      status: 500,
    });
  }
}

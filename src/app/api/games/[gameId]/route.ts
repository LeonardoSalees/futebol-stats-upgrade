import { NextRequest } from "next/server";
import { getGameById, updateGameById } from "@/services/gameService";

export async function GET(
  request: NextRequest,
  context: { params: { gameId: string } }
) {
  const params = await context.params;
  
  if (!params?.gameId) {
    return new Response(JSON.stringify({ error: 'gameId é obrigatório.' }), {
      status: 400,
    });
  }

  try {
    const game = await getGameById(parseInt(params.gameId));
    return new Response(JSON.stringify(game), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('não encontrado') ? 404 : 500,
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

    const updatedGame = await updateGameById(parseInt(gameId), { started, time });

    return new Response(JSON.stringify(updatedGame), { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('finalizado') ? 403 :
                   error.message.includes('não encontrado') ? 404 : 500;

    return new Response(
      JSON.stringify({ error: error.message }),
      { status }
    );
  }
}

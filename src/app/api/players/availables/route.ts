import { getAvailablePlayers } from "@/services/playerService";

export async function GET() {
  try {
    const players = await getAvailablePlayers();

    return new Response(JSON.stringify(players), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar jogadores disponíveis.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

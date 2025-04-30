import { getAvailablePlayers } from "@/services/playerService";

export async function GET() {
  try {
    const players = await getAvailablePlayers();

    return new Response(JSON.stringify(players), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar jogadores.' }), {
      status: 500,
    })
  }
}

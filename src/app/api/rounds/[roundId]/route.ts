// src/app/api/rounds/[roundId]/route.ts
import { getRoundById } from '@/services/roundService';

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
    const round = await getRoundById(roundId);
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

import { updatePlayer } from '@/services/playerService';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, context: { params: { id: string } }) {
  const params = await context.params;
  const { id } = params;
  const body = await request.json();
  const { isAvailable, goals, assists, name} = body;

  try {
    const updatedPlayer = await updatePlayer(parseInt(id), {
      isAvailable,
      goals,
      assists,
      name,
    });

    return new Response(JSON.stringify(updatedPlayer), { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar jogador.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
}

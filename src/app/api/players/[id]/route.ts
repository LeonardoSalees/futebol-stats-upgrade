import { updatePlayer } from '@/services/playerService';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error(error);
    return new NextResponse('Erro ao atualizar jogador', { status: 500 });
  }
}

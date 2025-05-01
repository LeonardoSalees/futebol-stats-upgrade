import { drawSchema } from '@/schemas/drawSchema';
import { createTeamsForDraw } from '@/services/drawService';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar os dados de entrada
    const parsedData = drawSchema.parse(body);

    const { roundId, teams } = parsedData;

    // Usar o serviço para criar os times
    const createdTeams = await createTeamsForDraw(roundId, teams);

    return new Response(JSON.stringify(createdTeams), { status: 201 });
  } catch (error) { 
    console.error('Erro ao criar times:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar os times.';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
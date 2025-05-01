import { roundSchema } from '@/schemas/roundSchema';
import { createRound, listRounds } from '@/services/roundService';

// Método POST - Criar nova rodada
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = roundSchema.parse(body);
    const round = await createRound(parsedBody);
    return new Response(JSON.stringify(round), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao criar a rodada:', error);
    return new Response(JSON.stringify({ error: 'Erro ao criar a rodada.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Método GET - Listar todas as rodadas
export async function GET() {
  try {
    const rounds = await listRounds();
    return new Response(JSON.stringify(rounds), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar rodadas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar rodadas.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

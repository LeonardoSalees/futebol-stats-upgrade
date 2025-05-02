import { roundSchema } from '@/schemas/roundSchema';
import { createRound, listRounds } from '@/services/roundService';
import { withTenant } from '@/lib/tenantContext';

// Método POST - Criar nova rodada
export async function POST(req: Request) {
  try {
    // Obter o tenant ID do cabeçalho
    const tenantId = req.headers.get('x-tenant-id');
    
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho da requisição');
      return new Response(
        JSON.stringify({ error: 'Tenant não especificado' }),
        { status: 400 }
      );
    }
    
    console.log(`POST /api/rounds - TenantId: ${tenantId}`);
    
    const body = await req.json();
    const parsedBody = roundSchema.parse(body);
    const round = await createRound(parsedBody, tenantId);
    
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
export async function GET(req: Request) {
  try {
    // Obter o tenant ID do cabeçalho
    const tenantId = req.headers.get('x-tenant-id');
    
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho da requisição GET');
      return new Response(
        JSON.stringify({ error: 'Tenant não especificado' }),
        { status: 400 }
      );
    }
    
    console.log(`GET /api/rounds - TenantId: ${tenantId}`);
    
    const rounds = await listRounds(tenantId);
    
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

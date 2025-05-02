import { getAllPlayers, createPlayer, updatePlayer, getAvailablePlayers } from '@/services/playerService';
import { Player } from '@/types';
import { NextResponse } from 'next/server';

// Criar jogador
export async function POST(request: Request) {
  try {
    // Obter o tenant ID do cabeçalho
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho da requisição POST de jogadores');
      return NextResponse.json({ error: 'Tenant não especificado' }, { status: 400 });
    }
    
    console.log(`POST /api/players - TenantId: ${tenantId}`);
    
    const body = await request.json();
    const { name, isAvailable = true, team = null } = body;

    if (!name) {
      return NextResponse.json({ error: 'O campo "name" é obrigatório.' }, {
        status: 400,
      });
    }

    const player = await createPlayer({
      name,
      isAvailable,
      team
    }, tenantId);

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar o jogador.';

    return NextResponse.json({ error: errorMessage }, {
      status: 500,
    });
  }
}

// Listar todos os jogadores
export async function GET(request: Request) {
  try {
    // Obter o tenant ID do cabeçalho
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho da requisição GET de jogadores');
      return NextResponse.json({ error: 'Tenant não especificado' }, { status: 400 });
    }
    
    console.log(`GET /api/players - TenantId: ${tenantId}`);
    
    const url = new URL(request.url);
    const available = url.searchParams.get('available');

    let players: any[];

    if (available === 'true') {
      // Se o parâmetro "available" for true, retornar apenas jogadores disponíveis
      players = await getAvailablePlayers(tenantId);
    } else {
      // Caso contrário, retornar todos os jogadores
      players = await getAllPlayers(tenantId);
    }

    // Transformar os resultados para incluir as contagens
    const playersWithCounts = players.map((player: any) => ({
      ...player,
      goalsCount: player.goals.length,
      assistsCount: player.assists.length
    }));

    return NextResponse.json(playersWithCounts);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar jogadores.';

    return NextResponse.json({ error: errorMessage }, {
      status: 500,
    })
  }
}

// Atualizar jogador
export async function PUT(request: Request) {
  try {
    // Obter o tenant ID do cabeçalho
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      console.error('TenantId não encontrado no cabeçalho da requisição PUT de jogadores');
      return NextResponse.json({ error: 'Tenant não especificado' }, { status: 400 });
    }
    
    console.log(`PUT /api/players - TenantId: ${tenantId}`);
    
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e name são obrigatórios.' }, {
        status: 400,
      });
    }

    const updated = await updatePlayer(id, { name }, tenantId);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar jogador.';

    return NextResponse.json({ error: errorMessage }, {
      status: 500,
    });
  }
}

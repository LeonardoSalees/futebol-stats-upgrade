import { prisma } from '@/lib/prisma';
import { playerSchema } from "@/schemas/playerSchema"; // Certifique-se de que o caminho está correto
import { getCurrentTenantId } from '@/lib/tenantContext';

// Atualiza um jogador existente
export async function updatePlayer(id: number, data: Partial<{ name: string; isAvailable: boolean; team: string | null; goals?: number; assists?: number;}>, tenantId?: string) {
  // Valida os dados de entrada
  const parsedData = playerSchema._def.schema.partial().parse(data);
  
  // Obter o tenant atual se não for fornecido
  const currentTenantId = tenantId || getCurrentTenantId();
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  // Usar métodos nativos do Prisma
  try {
    const player = await prisma.player.update({
      where: {
        id_tenantId: {
          id: id,
          tenantId: currentTenantId
        }
      },
      data: {
        name: data.name,
        isAvailable: data.isAvailable,
        team: data.team
      }
    });
    
    // Buscar relacionamentos
    const goals = await prisma.goal.findMany({
      where: {
        playerId: id,
        tenantId: currentTenantId
      }
    });
    
    const assists = await prisma.assist.findMany({
      where: {
        playerId: id,
        tenantId: currentTenantId
      }
    });
    
    return { ...player, goals, assists };
  } catch (error) {
    console.error("Erro ao atualizar jogador:", error);
    throw error;
  }
}

// Cria um novo jogador
export async function createPlayer(data: { name: string; isAvailable: boolean; team: string | null }, tenantId?: string) {
  // Valida os dados de entrada
  const parsedData = playerSchema.parse(data);
  
  // Obter o tenant atual se não for fornecido
  const currentTenantId = tenantId || getCurrentTenantId();
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  try {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        isAvailable: data.isAvailable,
        team: data.team,
        tenantId: currentTenantId
      }
    });
    
    return { ...player, goals: [], assists: [] };
  } catch (error) {
    console.error("Erro ao criar jogador:", error);
    throw error;
  }
}

// Busca um jogador por ID
export async function getPlayerById(id: number, tenantId?: string) {
  // Obter o tenant atual se não for fornecido
  const currentTenantId = tenantId || getCurrentTenantId();
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  try {
    const player = await prisma.player.findUnique({
      where: {
        id_tenantId: {
          id: id,
          tenantId: currentTenantId
        }
      }
    });
    
    if (!player) {
      return null;
    }
    
    // Buscar relacionamentos
    const goals = await prisma.goal.findMany({
      where: {
        playerId: id,
        tenantId: currentTenantId
      }
    });
    
    const assists = await prisma.assist.findMany({
      where: {
        playerId: id,
        tenantId: currentTenantId
      }
    });
    
    return { ...player, goals, assists };
  } catch (error) {
    console.error("Erro ao buscar jogador:", error);
    throw error;
  }
}

// Lista todos os jogadores
export async function getAllPlayers(tenantId?: string) {
  // Obter o tenant atual se não for fornecido
  const currentTenantId = tenantId || getCurrentTenantId();
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  try {
    const players = await prisma.player.findMany({
      where: {
        tenantId: currentTenantId
      }
    });
    
    // Para cada jogador, buscar seus gols e assistências
    const playersWithRelations = await Promise.all(
      players.map(async (player) => {
        const goals = await prisma.goal.findMany({
          where: {
            playerId: player.id,
            tenantId: currentTenantId
          }
        });
        
        const assists = await prisma.assist.findMany({
          where: {
            playerId: player.id,
            tenantId: currentTenantId
          }
        });
        
        return { ...player, goals, assists };
      })
    );
    
    return playersWithRelations;
  } catch (error) {
    console.error("Erro ao listar jogadores:", error);
    throw error;
  }
}

export async function getAvailablePlayers(tenantId?: string) {
  try {
    // Obter o tenant atual se não for fornecido
    const currentTenantId = tenantId || getCurrentTenantId();
    if (!currentTenantId) {
      throw new Error("TenantId não encontrado");
    }

    const players = await prisma.player.findMany({
      where: {
        isAvailable: true,
        tenantId: currentTenantId
      },
      include: {
        goals: true,
        assists: true
      },
      orderBy: {
        goals: {
          _count: 'desc'
        }
      }
    });
    
    // Adicionar contagem de gols e assistências
    return players.map(player => ({
      ...player,
      goal_count: player.goals.length,
      assist_count: player.assists.length
    }));
  } catch (error) {
    console.error("Erro ao buscar jogadores disponíveis:", error);
    throw new Error('Erro ao buscar jogadores disponíveis.');
  }
}
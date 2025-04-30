import prisma from "@/lib/prisma";
import { playerSchema } from "@/schemas/playerSchema"; // Certifique-se de que o caminho está correto

// Atualiza um jogador existente
export async function updatePlayer(id: number, data: Partial<{ name: string; isAvailable: boolean; team: string | null; goals?: number; assists?: number;}>) {
  // Valida os dados de entrada
  const parsedData = playerSchema._def.schema.partial().parse(data);

  return prisma.player.update({
    where: { id },
    data: parsedData,
    include: {
      goals: true,
      assists: true
    }
  });
}

// Cria um novo jogador
export async function createPlayer(data: { name: string; isAvailable: boolean; team: string | null }) {
  // Valida os dados de entrada
  const parsedData = playerSchema.parse(data);

  return prisma.player.create({
    data: parsedData, 
    include: {
      goals: true,
      assists: true
    }
  });
}

// Busca um jogador por ID
export async function getPlayerById(id: number) {
  return prisma.player.findUnique({
    where: { id },
    include: {
      goals: true,
      assists: true
    }
  });
}

// Lista todos os jogadores
export async function getAllPlayers() {
  return prisma.player.findMany({
    include: {
      goals: true,
      assists: true
    }
  });
}

// Deleta um jogador por ID
export async function deletePlayer(id: number) {
  return prisma.player.delete({
    where: { id },
  });
}

export async function getAvailablePlayers() {
  try {
    const players = await prisma.player.findMany({
      where: {
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        _count: {
          select: {
            goals: true,
            assists: true,
          },
        },
      },
      orderBy: {
        goals: {
          _count: 'desc',
        },
      },
    });

    return players;
  } catch (error) {
    throw new Error('Erro ao buscar jogadores disponíveis.');
  }
}
import { prisma } from '@/lib/prisma';
import { Round } from "@/schemas/roundSchema";
import { getCurrentTenantId } from '@/lib/tenantContext';

export async function listRounds(tenantId?: string) {
  const currentTenantId = tenantId || getCurrentTenantId();
  
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }
  
  const rounds = await prisma.round.findMany({
    where: {
      tenantId: currentTenantId
    },
    include: {
      games: {
        include: {
          goals: true,
          assists: true,
          players: {
            include: {
              player: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  return rounds;
}

export async function createRound(roundData?: Round, tenantId?: string) {
  const currentTenantId = tenantId || getCurrentTenantId();
  
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  console.log(`Criando rodada para tenant: ${currentTenantId}`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Verificar se já existe uma rodada hoje
  const existingRoundToday = await prisma.round.findFirst({
    where: {
      date: {
        gte: today,
        lt: tomorrow
      },
      tenantId: currentTenantId
    }
  });

  if (existingRoundToday) {
    return { existingRound: true, round: existingRoundToday };
  }

  // Obter última rodada
  const lastRound = await prisma.round.findFirst({
    where: {
      tenantId: currentTenantId
    },
    orderBy: {
      id: 'desc'
    }
  });

  const nextRoundNumber = lastRound ? lastRound.id + 1 : 1;

  // Verificar se já existe rodada com esse número
  const existingRoundWithSameNumber = await prisma.round.findFirst({
    where: {
      id: nextRoundNumber,
      tenantId: currentTenantId
    }
  });

  if (existingRoundWithSameNumber) {
    throw new Error(`Já existe uma rodada com o número ${nextRoundNumber}.`);
  }

  const currentDate = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const roundName = `Rodada ${nextRoundNumber} - ${monthNames[currentDate.getMonth()]}`;

  // Criar a rodada com o tenant explícito
  try {
    const round = await prisma.round.create({
      data: {
        id: nextRoundNumber,
        date: currentDate,
        tenantId: currentTenantId,
        finished: false
      }
    });
    
    return round;
  } catch (error) {
    console.error("Erro ao criar rodada:", error);
    throw error;
  }
}

export async function getRoundById(roundId: string, tenantId?: string) {
  if (!roundId || isNaN(Number(roundId))) {
    throw new Error("ID da rodada inválido");
  }
  
  const currentTenantId = tenantId || getCurrentTenantId();
  
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  const round = await prisma.round.findUnique({
    where: {
      id_tenantId: {
        id: parseInt(roundId, 10),
        tenantId: currentTenantId
      }
    },
    include: {
      games: {
        include: {
          goals: {
            include: {
              player: true
            }
          },
          assists: {
            include: {
              player: true
            }
          },
          players: {
            include: {
              player: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      },
      teams: true
    }
  });

  if (!round) {
    throw new Error("Rodada não encontrada");
  }

  return round;
}

export async function finishRound(roundId: string, tenantId?: string) {
  if (!roundId || isNaN(Number(roundId))) {
    throw new Error("ID da rodada inválido");
  }

  // Obter o tenant atual se não for fornecido
  const currentTenantId = tenantId || getCurrentTenantId();
  
  if (!currentTenantId) {
    throw new Error("TenantId não encontrado");
  }

  try {
    // Buscar a rodada com tenant ID
    const round = await prisma.round.findUnique({
      where: {
        id_tenantId: {
          id: parseInt(roundId, 10),
          tenantId: currentTenantId
        }
      },
      include: {
        games: true
      }
    });
    
    if (!round) {
      throw new Error("Rodada não encontrada");
    }
    
    if (round.finished) {
      throw new Error("Esta rodada já está finalizada");
    }

    // Verificar se há jogos não finalizados
    const unfinishedGames = await prisma.game.findMany({
      where: {
        roundId: parseInt(roundId, 10),
        tenantId: currentTenantId,
        finished: false
      }
    });

    if (unfinishedGames.length > 0) {
      throw new Error("Não é possível finalizar a rodada. Existem jogos em andamento.");
    }

    // Finalizar a rodada
    const updatedRound = await prisma.round.update({
      where: {
        id_tenantId: {
          id: parseInt(roundId, 10),
          tenantId: currentTenantId
        }
      },
      data: {
        finished: true
      }
    });

    return updatedRound;
  } catch (error) {
    console.error("Erro ao finalizar rodada:", error);
    throw error;
  }
}

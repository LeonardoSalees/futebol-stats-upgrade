import prisma from "@/lib/prisma";
import { Round } from "@/schemas/roundSchema";

export async function listRounds() {
  return await prisma.round.findMany({
    include: {
      games: {
        include: {
          goals: true,
          assists: true,
          players: {
            include: { player: true },
          },
        },
      },
    },
    orderBy: { id: 'desc' },
  });
}

export async function createRound(roundData?: Round) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingRoundToday = await prisma.round.findFirst({
    where: {
      date: { gte: today, lt: tomorrow },
    },
  });

  if (existingRoundToday) {
    return { existingRound: true, round: existingRoundToday };
  }

  const lastRound = await prisma.round.findFirst({
    orderBy: { id: 'desc' },
  });

  const nextRoundNumber = lastRound ? lastRound.id + 1 : 1;

  const existingRoundWithSameNumber = await prisma.round.findUnique({
    where: { id: nextRoundNumber },
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

  return await prisma.round.create({
    data: {
      date: currentDate,
    },
  });
}

export async function getRoundById(roundId: string) {
  if (!roundId || isNaN(Number(roundId))) {
    throw new Error("ID da rodada inválido");
  }

  const round = await prisma.round.findUnique({
    where: { id: parseInt(roundId, 10) },
    include: {
      games: {
        orderBy: { date: "desc" },
        include: {
          goals: { include: { player: true } },
          assists: { include: { player: true } },
          players: true,
        },
      },
      teams: true,
    },
  });

  if (!round) {
    throw new Error("Rodada não encontrada");
  }

  return round;
}

export async function finishRound(roundId: string) {
  if (!roundId || isNaN(Number(roundId))) {
    throw new Error("ID da rodada inválido");
  }

  const round = await prisma.round.findUnique({
    where: { id: parseInt(roundId, 10) },
    include: { games: true }
  });

  if (!round) {
    throw new Error("Rodada não encontrada");
  }

  if (round.finished) {
    throw new Error("Esta rodada já está finalizada");
  }

  const unfinishedGames = round.games.filter(game => !game.finished);
  if (unfinishedGames.length > 0) {
    throw new Error("Não é possível finalizar a rodada. Existem jogos em andamento.");
  }

  // Finaliza a rodada
  return await prisma.round.update({
    where: { id: parseInt(roundId, 10) },
    data: { finished: true },
    include: {
      games: {
        orderBy: {
          date: "desc"
        }
      },
      teams: true
    }
  });
}

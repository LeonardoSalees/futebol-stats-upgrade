import prisma from "@/lib/prisma";

export async function createTeamsForDraw(roundId: number, teams: { name: string; players: number[] }[]) {
  try {
    const existingTeams = await prisma.team.findMany({
      where: { roundId },
    });
  
    if (existingTeams.length > 0) {
      throw new Error('Times já foram sorteados para esta rodada.');
    }
    const createdTeams = await Promise.all(
      teams.map(async (team) => {
        const newTeam = await prisma.team.create({
          data: {
            name: team.name,
            roundId,
            players: {
              create: team.players.map((playerId) => ({
                player: { connect: { id: playerId } },
              })),
            },
          },
        });

        return newTeam;
      })
    );

    return createdTeams;
  } catch (error) {
    console.error('Erro ao criar os times:', error);
    throw new Error('Erro ao criar os times.');
  }
} 
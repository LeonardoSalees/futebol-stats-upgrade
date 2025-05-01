import prisma from "@/lib/prisma";

// Função para calcular ranking de jogadores com base no número de gols e assistências
export async function getPlayerRanking() {
  const players = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      goals: {
        select: {
          id: true
        }
      },
      assists: {
        select: {
          id: true
        }
      },
    }
  });

  // Mapear os jogadores com a quantidade de gols e assistências
  const ranking = players.map(player => {
    return {
      playerId: player.id,
      name: player.name,
      goals: player.goals.length,
      assists: player.assists.length,
      total: player.goals.length + player.assists.length, // Pode ser alterado conforme sua lógica de ranking
    };
  });

  // Ordenar por total de gols + assistências (pode ser ajustado conforme a lógica de ranking)
  ranking.sort((a, b) => b.total - a.total);

  return ranking;
}

// Função para buscar as estatísticas de gols e assistências por jogo
export async function getGameStatistics(gameId: string) {
  const game = await prisma.game.findUnique({
    where: { id: Number(gameId) },
    include: {
      goals: {
        include: {
          player: true,
        }
      },
      assists: {
        include: {
          player: true,
        }
      }
    }
  });

  if (!game) {
    throw new Error("Jogo não encontrado");
  }

  const goals = game.goals.map(goal => ({
    player: goal.player.name,
    goalId: goal.id,
  }));

  const assists = game.assists.map(assist => ({
    player: assist.player.name,
    assistId: assist.id,
  }));

  return {
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    goals,
    assists
  };
}

// Função para calcular as estatísticas gerais da rodada
export async function getRoundStatistics(roundId: string) {
  const round = await prisma.round.findUnique({
    where: { id: Number(roundId) },
    include: {
      games: {
        include: {
          goals: {
            include: {
              player: true,
            }
          },
          assists: {
            include: {
              player: true,
            }
          }
        }
      }
    }
  });

  if (!round) {
    throw new Error("Rodada não encontrada");
  }

  // Agregar estatísticas de gols e assistências por jogo
  const roundStats = round.games.map(game => ({
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    goals: game.goals.map(goal => ({
      player: goal.player.name,
      goalId: goal.id,
    })),
    assists: game.assists.map(assist => ({
      player: assist.player.name,
      assistId: assist.id,
    }))
  }));

  return roundStats;
}

export const getAllStatistics = async () => {
  const [players, games, teams] = await Promise.all([
    prisma.player.findMany({
      include: {
        goals: true,
        assists: true,  
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
    }),
    prisma.game.findMany({
      include: {
        goals: true,
        assists: true,
      },
    }),
    prisma.team.findMany({
      include: {
        players: {
          include: { player: true },
        },
        round: true,
      },
    }),
  ]);

  const totalGoals = players.reduce((acc, p) => acc + p.goals.length, 0);
  const totalAssists = players.reduce((acc, p) => acc + p.assists.length, 0);
  const totalGames = games.length;

  const topScorer = players.reduce((max, p) =>
    p.goals.length > max.goals.length ? p : max, players[0]
  );
  const topAssister = players.reduce((max, p) =>
    p.assists.length > max.assists.length ? p : max, players[0]
  );

  const activePlayers = players.filter(p => p.isAvailable).length;
  const activePlayersPercentage = players.length
    ? Math.round((activePlayers / players.length) * 100)
    : 0;

  const gamesByMonth: Record<string, number> = {};
  const goalsByMonth: Record<string, number> = {};
  for (const game of games) {
    const date = new Date(game.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    gamesByMonth[monthYear] = (gamesByMonth[monthYear] || 0) + 1;
    goalsByMonth[monthYear] = (goalsByMonth[monthYear] || 0) + game.goals.length;
  }

  const teamsWithStats = teams.map(team => {
    const teamGames = games.filter(g => g.homeTeam === team.name || g.awayTeam === team.name);
    const goals = teamGames.reduce((acc, g) => {
      const score = g.homeTeam === team.name ? g.homeScore : g.awayScore;
      return acc + (score || 0);
    }, 0);
    const assists = teamGames.reduce((acc, g) => {
      return acc + g.assists.filter(a => team.players.some(tp => tp.playerId === a.playerId)).length;
    }, 0);

    const wins = teamGames.filter(g => {
      const teamScore = g.homeTeam === team.name ? g.homeScore : g.awayScore;
      const opponentScore = g.homeTeam === team.name ? g.awayScore : g.homeScore;
      return (teamScore || 0) > (opponentScore || 0);
    }).length;

    const draws = teamGames.filter(g => {
      return g.homeScore === g.awayScore;
    }).length;

    return {
      id: team.id,
      name: team.name,
      games: teamGames.length,
      goals,
      assists,
      wins,
      draws,
      losses: teamGames.length - wins - draws,
    };
  }).sort((a, b) => b.wins - a.wins);

  return {
    totalGoals,
    totalAssists,
    totalGames,
    goalsPerGame: totalGames ? totalGoals / totalGames : 0,
    assistsPerGame: totalGames ? totalAssists / totalGames : 0,
    topScorer,
    topAssister,
    playersCount: players.length,
    activePlayersPercentage,
    gamesByMonth,
    goalsByMonth,
    teams: teamsWithStats,
    players, // inclui goalsCount e assistsCount direto no frontend, se quiser
    games,
  };
};


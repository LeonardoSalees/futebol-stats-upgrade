"use client";

import { useState, useEffect } from "react";
import { User, Goal, Calendar, Trophy, Target, Award, TrendingUp, BarChart3, Star, Medal, Users } from "lucide-react";
import { CardSkeleton, SkeletonContainer } from "@/components/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Definir os tipos para Player e Game
type GoalType = {
  id: number;
  playerId: number;
  gameId: number;
  player?: {
    name: string;
  };
};

type AssistType = {
  id: number;
  playerId: number;
  gameId: number;
  player?: {
    name: string;
  };
};

type Player = {
  id: number;
  name: string;
  goals: GoalType[];
  assists: AssistType[];
  goalsCount?: number;
  assistsCount?: number;
  isAvailable?: boolean;
  player?: {
    name: string;
  };
};

type Game = {
  id: number;
  date: string;
  goals: GoalType[];
  assists: AssistType[];
  status?: string;
  teams?: { id: number; name: string }[];
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  finished: boolean;
};

type Team = {
  id: number;
  name: string;
  players: Player[];
  goals: number;
  assists: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  round?: { 
    id: number;
    name: string;
    date: string;
    finished: boolean;
  };
};

type Draw = {
  id: number;
  date: string;
  teams: Team[];
};

export default function Stats() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersRes, gamesRes, teamsRes] = await Promise.all([
          fetch("/api/players"),
          fetch("/api/games"),
          fetch("/api/teams")
        ]);

        const [playersData, gamesData, teamsData] = await Promise.all([
          playersRes.json(),
          gamesRes.json(),
          teamsRes.json()
        ]);

        setPlayers(playersData);
        setGames(gamesData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Configurar um intervalo para atualizar os dados a cada 30 segundos
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Cálculos gerais
  const totalGoals = players.reduce((acc, player) => acc + (player.goalsCount || 0), 0);
  const totalAssists = players.reduce((acc, player) => acc + (player.assistsCount || 0), 0);
  const totalGames = games.length;
  const goalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(1) : "0";
  const assistsPerGame = totalGames > 0 ? (totalAssists / totalGames).toFixed(1) : "0";
  
  // Encontrar o artilheiro
  const topScorer = players.length > 0 
    ? players.reduce((max, player) => {
        const currentGoals = player.goalsCount || 0;
        const maxGoals = max.goalsCount || 0;
        return currentGoals > maxGoals ? player : max;
      }, players[0])
    : null;

  // Encontrar o melhor assistente
  const topAssister = players.length > 0
    ? players.reduce((max, player) => {
        const currentAssists = player.assistsCount || 0;
        const maxAssists = max.assistsCount || 0;
        return currentAssists > maxAssists ? player : max;
      }, players[0])
    : null;

  // Ordenar jogadores por gols (para a tabela de classificação)
  const sortedPlayersByGoals = [...players].sort((a, b) => 
    (b.goalsCount || 0) - (a.goalsCount || 0)
  );

  // Ordenar jogadores por assistências
  const sortedPlayersByAssists = [...players].sort((a, b) => 
    (b.assistsCount || 0) - (a.assistsCount || 0)
  );

  // Calcular jogadores ativos
  const activePlayers = players.filter(player => player.isAvailable).length;
  const activePlayersPercentage = players.length > 0 
    ? Math.round((activePlayers / players.length) * 100) 
    : 0;

  // Calcular jogos por mês (para o gráfico)
  const gamesByMonth: Record<string, number> = {};
  games.forEach(game => {
    const date = new Date(game.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    gamesByMonth[monthYear] = (gamesByMonth[monthYear] || 0) + 1;
  });

  // Calcular gols por mês
  const goalsByMonth: Record<string, number> = {};
  games.forEach(game => {
    const date = new Date(game.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    goalsByMonth[monthYear] = (goalsByMonth[monthYear] || 0) + (game.goals?.length || 0);
  });

  // Cálculos para times
  const teamsWithStats = teams.map(team => {
    const teamGames = games.filter(game => 
      game.homeTeam === team.name || game.awayTeam === team.name
    ) || [];

    // Calcular gols diretamente dos placares dos jogos
    const teamGoals = teamGames.reduce((acc, game) => {
      const isHomeTeam = game.homeTeam === team.name;
      return acc + (isHomeTeam ? (game.homeScore || 0) : (game.awayScore || 0));
    }, 0);

    const teamAssists = teamGames.reduce((acc, game) => {
      const teamAssistsInGame = (game.assists || []).filter(assist => 
        team.players.some(player => player.id === assist.playerId)
      ).length;
      return acc + teamAssistsInGame;
    }, 0);

    const wins = teamGames.filter(game => {
      const isHomeTeam = game.homeTeam === team.name;
      const teamScore = isHomeTeam ? game.homeScore || 0 : game.awayScore || 0;
      const opponentScore = isHomeTeam ? game.awayScore || 0 : game.homeScore || 0;
      return teamScore > opponentScore;
    }).length;

    const draws = teamGames.filter(game => {
      const isHomeTeam = game.homeTeam === team.name;
      const teamScore = isHomeTeam ? game.homeScore || 0 : game.awayScore || 0;
      const opponentScore = isHomeTeam ? game.awayScore || 0 : game.homeScore || 0;
      return teamScore === opponentScore;
    }).length;

    return {
      ...team,
      goals: teamGoals || 0,
      assists: teamAssists || 0,
      games: teamGames.length || 0,
      wins: wins || 0,
      draws: draws || 0,
      losses: (teamGames.length - wins - draws) || 0
    };
  });

  const sortedTeams = [...teamsWithStats].sort((a, b) => {
    // Priorizar vitórias, depois empates
    if (a.wins !== b.wins) return b.wins - a.wins;
    if (a.draws !== b.draws) return b.draws - a.draws;
    return (b.goals || 0) - (a.goals || 0);
  });

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para obter a cor de fundo com base na cor do time
  const getTeamColorClass = (color: string) => {
    switch (color) {
      case "Verde":
        return "bg-green-600";
      case "Azul":
        return "bg-blue-600";
      case "Roxo":
        return "bg-purple-600";
      case "Vermelho":
        return "bg-red-600";
      case "Preto":
        return "bg-gray-800";
      default:
        return "bg-gray-700";
    }
  };

  if (loading) {
  return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <SkeletonContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </SkeletonContainer>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-0">Estatísticas</h1>
        <div className="text-sm text-gray-400">
          Atualizado em {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full sm:w-auto mb-4">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="players">Jogadores</TabsTrigger>
            <TabsTrigger value="teams">Times</TabsTrigger>
            <TabsTrigger value="games">Jogos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <User className="text-blue-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Jogadores</p>
                  <p className="text-2xl font-semibold text-white">{players.length}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activePlayersPercentage}% disponíveis
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Goal className="text-green-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Gols</p>
                  <p className="text-2xl font-semibold text-white">{totalGoals}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {goalsPerGame} gols/jogo
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Goal className="rotate-180 text-yellow-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Assistências</p>
                  <p className="text-2xl font-semibold text-white">{totalAssists}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {assistsPerGame} assistências/jogo
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Calendar className="text-purple-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Jogos Realizados</p>
                  <p className="text-2xl font-semibold text-white">{totalGames}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Target className="text-red-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Média de Gols/Jogo</p>
                  <p className="text-2xl font-semibold text-white">{goalsPerGame}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Trophy className="text-yellow-400 w-8 h-8" />
                <div>
                  <p className="text-sm text-gray-400">Artilheiro</p>
                  <p className="text-2xl font-semibold text-white">
                    {topScorer ? topScorer.name : "Nenhum"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {topScorer ? `${topScorer.goalsCount || 0} gols` : "0 gols"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Artilharia</h2>
              <div className="space-y-4">
                {sortedPlayersByGoals.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                        {player.goalsCount || 0} gols
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Assistências</h2>
              <div className="space-y-4">
                {sortedPlayersByAssists.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
                        {player.assistsCount || 0} assistências
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Destaques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-yellow-400 w-5 h-5" />
                  <h3 className="text-white font-medium">Artilheiro</h3>
                </div>
                <p className="text-white text-lg font-bold">{topScorer?.name || "Nenhum"}</p>
                <p className="text-gray-400 text-sm">{topScorer?.goalsCount || 0} gols</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Medal className="text-blue-400 w-5 h-5" />
                  <h3 className="text-white font-medium">Melhor Assistente</h3>
                </div>
                <p className="text-white text-lg font-bold">{topAssister?.name || "Nenhum"}</p>
                <p className="text-gray-400 text-sm">{topAssister?.assistsCount || 0} assistências</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-purple-400 w-5 h-5" />
                  <h3 className="text-white font-medium">Jogador Mais Completo</h3>
                </div>
                <p className="text-white text-lg font-bold">
                  {players.length > 0 
                    ? players.reduce((max, player) => {
                        const currentTotal = (player.goalsCount || 0) + (player.assistsCount || 0);
                        const maxTotal = (max.goalsCount || 0) + (max.assistsCount || 0);
                        return currentTotal > maxTotal ? player : max;
                      }, players[0]).name 
                    : "Nenhum"}
                </p>
                <p className="text-gray-400 text-sm">
                  {players.length > 0 
                    ? `${(players.reduce((max, player) => {
                        const currentTotal = (player.goalsCount || 0) + (player.assistsCount || 0);
                        const maxTotal = (max.goalsCount || 0) + (max.assistsCount || 0);
                        return currentTotal > maxTotal ? player : max;
                      }, players[0]).goalsCount || 0) + (players.reduce((max, player) => {
                        const currentTotal = (player.goalsCount || 0) + (player.assistsCount || 0);
                        const maxTotal = (max.goalsCount || 0) + (max.assistsCount || 0);
                        return currentTotal > maxTotal ? player : max;
                      }, players[0]).assistsCount || 0)} participações`
                    : "0 participações"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="players" className="mt-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Classificação de Jogadores</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Posição</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Jogador</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Gols</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Assistências</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Total</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Média/Jogo</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayersByGoals.map((player, index) => {
                    const totalParticipations = (player.goalsCount || 0) + (player.assistsCount || 0);
                    const gamesPlayed = games.filter(game => 
                      game.goals.some(g => g.playerId === player.id) || 
                      game.assists.some(a => a.playerId === player.id)
                    ).length;
                    const average = gamesPlayed > 0 ? (totalParticipations / gamesPlayed).toFixed(1) : "0";
                    
                    return (
                      <tr key={player.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white">{index + 1}º</td>
                        <td className="py-3 px-4 text-white">{player.name}</td>
                        <td className="py-3 px-4 text-center text-white">{player.goalsCount || 0}</td>
                        <td className="py-3 px-4 text-center text-white">{player.assistsCount || 0}</td>
                        <td className="py-3 px-4 text-center text-white font-medium">{totalParticipations}</td>
                        <td className="py-3 px-4 text-center text-white">{average}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Classificação dos Times</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">J</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">V</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">E</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">D</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">GP</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">GC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, index) => {
                      const goalsAgainst = games.reduce((acc, game) => {
                        if (game.homeTeam === team.name) {
                          return acc + (game.awayScore || 0);
                        } else if (game.awayTeam === team.name) {
                          return acc + (game.homeScore || 0);
                        }
                        return acc;
                      }, 0);

                      return (
                        <tr key={team.id} className="border-b border-gray-700/50">
                          <td className="py-3 px-4 text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${getTeamColorClass(team.name)}`}></span>
                                <span>{team.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-white">{team.games || 0}</td>
                          <td className="py-3 px-4 text-center text-white">{team.wins || 0}</td>
                          <td className="py-3 px-4 text-center text-white">{team.draws || 0}</td>
                          <td className="py-3 px-4 text-center text-white">{team.losses || 0}</td>
                          <td className="py-3 px-4 text-center text-white">{team.goals || 0}</td>
                          <td className="py-3 px-4 text-center text-white">{goalsAgainst || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Distribuição de Gols</h2>
              <div className="space-y-4">
                {sortedTeams.map(team => {
                  // Garantir que temos um valor numérico para os gols
                  const teamGoals = team.goals || 0;
                  const percentage = totalGoals > 0 ? (teamGoals / totalGoals) * 100 : 0;
                  
                  return (
                    <div key={team.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${getTeamColorClass(team.name)}`}></span>
                          <span className="text-white">{team.name}</span>
                        </div>
                        <span className="text-gray-400">{teamGoals} gols</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Jogadores por Time</h2>
              <div className="space-y-6">
                {teams.map(team => (
                  <div key={team.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${getTeamColorClass(team.name)}`}></span>
                      <h3 className="text-lg font-medium text-white">{team.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {team.players && team.players.length > 0 ? (
                        team.players.map(player => (
                          <div 
                            key={player.id}
                            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/30 p-2 rounded"
                          >
                            <User className="w-4 h-4" />
                            <span>{player.player?.name || player.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-400 col-span-2">
                          Nenhum jogador associado a este time
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Histórico de Sorteios</h2>
              <div className="space-y-4">
                {teams.map(team => {
                  const roundDate = team.round?.date ? new Date(team.round.date) : new Date();
                  const roundName = team.round?.name || `Rodada ${team.round?.id || 'N/A'}`;
                  const roundStatus = team.round?.finished ? 'Finalizada' : 'Em andamento';
                  
                  return (
                    <div key={team.id} className="space-y-2 bg-gray-800/30 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${getTeamColorClass(team.name)}`}></span>
                          <span className="text-white font-medium">{team.name}</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                          {roundName}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatDate(roundDate.toString())}</span>
                        <span>{roundStatus}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {team.players && team.players.length > 0 ? (
                          team.players.map((player) => (
                            <div 
                              key={player.id}
                              className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/30 p-2 rounded"
                            >
                              <Users className="w-4 h-4" />
                              <span>{player.player?.name || player.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 col-span-2">
                            Nenhum jogador associado a este time
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="games" className="mt-4">
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Histórico de Jogos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Times</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Placar</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Gols</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Assistências</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map(game => {
                    const gameDate = new Date(game.date);
                    const formattedDate = gameDate.toLocaleDateString('pt-BR');
                    const totalGoals = game.goals?.length || 0;
                    const totalAssists = game.assists?.length || 0;
                    
                    return (
                      <tr key={game.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white">{formattedDate}</td>
                        <td className="py-3 px-4 text-white">
                          {game.homeTeam} vs {game.awayTeam}
                        </td>
                        <td className="py-3 px-4 text-center text-white font-bold">
                          {game.homeScore || 0} x {game.awayScore || 0}
                        </td>
                        <td className="py-3 px-4 text-center text-white">{totalGoals}</td>
                        <td className="py-3 px-4 text-center text-white">{totalAssists}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant="outline" 
                            className={
                              game.finished 
                                ? "bg-green-900/20 text-green-400 border-green-800" 
                                : "bg-yellow-900/20 text-yellow-400 border-yellow-800"
                            }
                          >
                            {game.finished ? "Finalizado" : "Em andamento"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

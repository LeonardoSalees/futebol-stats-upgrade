"use client";

import { useState, useEffect } from "react";
import { User, Goal, Calendar, Trophy, Target, Award, TrendingUp, BarChart3, Star, Medal, Users } from "lucide-react";
import { CardSkeleton, SkeletonContainer } from "@/components/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date-format";
import { Player, Game, Team, AssistType, GoalType } from "@/app/types";
import axios from "axios";
import { StatCard } from "@/components/statCard";


export default function Stats() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("/api/stats");
      const data = response.data;
      setPlayers(data.players);
      setGames(data.games);
      setTeams(data.teams);
      setData(data);
      setLoading(false);
      console.log(data);
    };
    fetchData();
  }, []);

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
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="players">Jogadores</TabsTrigger>
            <TabsTrigger value="games">Jogos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Jogadores"
              icon={<User className="text-blue-400 w-8 h-8" />}
              value={players.length}
              subtitle={`${data.activePlayersPercentage}% disponíveis`}
            />

            <StatCard
              title="Gols"
              icon={<Goal className="text-green-400 w-8 h-8" />}
              value={data.totalGoals || 0}
              subtitle={`${players.length > 0 ? (data.totalGoals / players.length).toFixed(2) : 0} gols/jogo`}
            />

            <StatCard
              title="Assistências"
              icon={<Goal className="rotate-180 text-yellow-400 w-8 h-8" />}
              value={data.totalAssists || 0}
              subtitle={`${players.length > 0 ? (data.totalAssists / players.length).toFixed(2) : 0} assistências/jogo`}
            />

            <StatCard
              title="Jogos Realizados"
              icon={<Calendar className="text-purple-400 w-8 h-8" />}
              value={data.totalGames || 0}
            />

            <StatCard
              title="Média de Gols/Jogo"
              icon={<Target className="text-red-400 w-8 h-8" />}
              value={players.length > 0 ? (data.totalGoals / players.length).toFixed(2) : 0}
            />

            <StatCard
              title="Artilheiro"
              icon={<Trophy className="text-yellow-400 w-8 h-8" />}
              value={data.topScorer && data.topScorer.name}
              subtitle={`${data.topScorer && `${data.topScorer._count.goals} gols`}`}
            />
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Destaques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Artilheiro"
                icon={<Star className="text-yellow-400 w-5 h-5" />}
                value={data.topScorer?.name || 'Nenhum'}
                subtitle={`${data.topScorer?._count.goals || 0} gols`}
              />

              <StatCard
                title="Melhor Assistente"
                icon={<Medal className="text-blue-400 w-5 h-5" />}
                value={data.topAssister?.name || 'Nenhum'}
                subtitle={`${data.topAssister?._count.assists || 0} assistências`}
              />

              <StatCard
                title="Jogador Mais Completo"
                icon={<Award className="text-purple-400 w-5 h-5" />}
                value={
                  players.length > 0
                    ? players.reduce((max: any) => {
                      const currentTotal =
                        (max._count.goals || 0) + (max._count.assists || 0);
                      const maxTotal =
                        (max._count.goals || 0) + (max._count.assists || 0);
                      return currentTotal > maxTotal ? max : max;
                    }).name
                    : 'Nenhum'
                }
                subtitle={`${players.length > 0
                    ? `${players.reduce((max: any) => {
                      const currentTotal =
                        (max._count.goals || 0) + (max._count.assists || 0);
                      const maxTotal =
                        (max._count.goals || 0) + (max._count.assists || 0);
                      return currentTotal > maxTotal ? max : max;
                    })._count.goals} participações`
                    : '0 participações'
                  }`}
              />
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
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Gols</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Assistências</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Total/Participações</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Média/Jogo</th>
                  </tr>
                </thead>
                <tbody>
                  {players && players.map((player: Player, index: number) => {
                    const totalParticipations = (player._count.goals || 0) + (player._count.assists || 0);
                    const gamesPlayed = data.games.filter((game: Game) =>
                      game.goals.some((g: GoalType) => g.playerId === player.id) ||
                      game.assists.some((a: AssistType) => a.playerId === player.id)
                    ).length;
                    const average = gamesPlayed > 0 ? (totalParticipations / gamesPlayed).toFixed(1) : "0";

                    return (
                      <tr key={player.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white">{index + 1}º</td>
                        <td className="py-3 px-4 text-white">{player.name}</td>
                        <td className="py-3 px-4 text-center text-white">{player._count.goals || 0}</td>
                        <td className="py-3 px-4 text-center text-white">{player._count.assists || 0}</td>
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
                  {data.games && data.games.map((game: Game, index: number) => {
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

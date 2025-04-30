// src/app/round/[roundId]/page.tsx
'use client'

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Assist, Game, Goal, Player, Round } from "@prisma/client";
import { dateInBrazilDaysAndHours, dateInBrazilHours } from "@/utils/date-format";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Plus, Trophy, CheckCircle, Clock, Flag, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type GoalWithPlayer = Goal & {
  player: Player
}
type AssistWithPlayer = Assist & {
  player: Player;
};
type GameWithRelations = Game & {
  id: number,
  homeTeam: string;
  awayTeam: string;
  players: Player[];
  goals: GoalWithPlayer[]
  assists: AssistWithPlayer[];
};

type RoundWithGames = Round & {
  games: GameWithRelations[];
};

export default function RoundPage() {
  const [round, setRound] = useState<RoundWithGames | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { roundId } = useParams();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Carregar os dados da rodada
    const fetchRound = async () => {
      try {
        const response = await axios.get(`/api/rounds/${roundId}`);
        setRound(response.data);
      } catch (error) {
        console.error("Erro ao carregar a rodada:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRound();
  }, [roundId]);

  const handleFinishRound = async () => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem finalizar rodadas.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`/api/rounds/${roundId}/finish`);
      router.refresh();
      toast({
        title: "Sucesso!",
        description: "Rodada finalizada com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro ao finalizar a rodada:", error);
      toast({
        title: "Erro!",
        description: error.response?.data?.error || "Erro ao finalizar a rodada.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> Rodada não encontrada.</span>
        </div>
      </div>
    );
  }

  // Garantir que games seja um array, mesmo que vazio
  const games = round.games || [];

  // Contar jogos finalizados e ativos
  const finishedGames = games.filter(game => game.finished).length;
  const activeGames = games.filter(game => !game.finished).length;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Cabeçalho da Rodada */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className="hover:bg-gray-100 p-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Rodada</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl shadow-lg p-6 space-y-6 text-white"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-400">{round.name}</h2>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{dateInBrazilDaysAndHours(round.date)}</span>
              </div>
            </div>
          </div>

          {!round.finished ? (
            isAdmin ? (
              <Link href={`/rounds/${round.id}/new-game`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3 rounded-lg flex items-center gap-3 shadow-lg hover:shadow-green-500/30 transition-all duration-300 border border-green-500/30"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-inner">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">Novo Jogo</span>
                    <span className="text-xs text-green-200">Adicionar partida</span>
                  </div>
                </motion.div>
              </Link>
            ) : (
              <div className="bg-slate-700/50 px-5 py-3 rounded-lg flex items-center gap-3 border border-slate-600/30 opacity-70 cursor-not-allowed">
                <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center shadow-inner">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-lg text-gray-400">Novo Jogo</span>
                  <span className="text-xs text-gray-500">Apenas administradores</span>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-700/50 px-5 py-3 rounded-lg flex items-center gap-3 border border-slate-600/30 opacity-70">
              <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center shadow-inner">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-lg text-gray-400">Novo Jogo</span>
                <span className="text-xs text-gray-500">Rodada finalizada</span>
              </div>
            </div>
          )}
        </div>

        {/* Status da Rodada */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {round.finished ? (
                <>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-400">Rodada Finalizada</h3>
                    <p className="text-sm text-gray-300">Todos os jogos foram concluídos</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-400">Rodada Ativa</h3>
                    <p className="text-sm text-gray-300">Jogos em andamento ou pendentes</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{games.length}</p>
                <p className="text-xs text-gray-400">Total de Jogos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{finishedGames}</p>
                <p className="text-xs text-gray-400">Finalizados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{activeGames}</p>
                <p className="text-xs text-gray-400">Ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de jogos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Jogos da Rodada</h3>

          {games.length === 0 ? (
            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
              <p className="text-gray-300 italic">Nenhum jogo cadastrado ainda.</p>
              <p className="text-sm text-gray-400 mt-2">Clique em "Novo Jogo" para adicionar partidas.</p>
            </div>
          ) : (
            games.map((game: GameWithRelations) => (
              <Link href={`/games/${game.id}`} key={game.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-700/50 rounded-lg p-4 mt-2 space-y-3 hover:bg-slate-600/50 cursor-pointer transition-colors"
                >
                  {/* Status do jogo */}
                  <div className="flex justify-end">
                    {game.finished ? (
                      <div className="flex items-center gap-1 bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>Finalizado</span>
                      </div>
                    ) : game.started ? (
                      <div className="flex items-center gap-1 bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Em andamento</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-900/50 text-amber-400 px-2 py-1 rounded-full text-xs">
                        <Flag className="h-3 w-3" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </div>

                  {/* Placar + horário */}
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-white text-lg">
                      {game.homeTeam} <span className="text-amber-400 font-bold">{game.homeScore}</span> x <span className="text-amber-400 font-bold">{game.awayScore}</span> {game.awayTeam}
                    </div>
                    <div className="text-sm text-gray-400">⌚ {dateInBrazilHours(game.date)}</div>
                  </div>

                  {/* Gols e assistências */}
                  <div className="text-sm text-gray-300 space-y-2">
                    {game.goals && game.goals.length > 0 ? (
                      game.goals.map((goal) => {
                        const assist = game.assists && game.assists.find((a) => a.minute === goal.minute);
                        const isHomeTeam = goal.team === game.homeTeam;

                        return (
                          <div
                            key={goal.id}
                            className={`flex flex-col sm:flex-row gap-3 bg-slate-600/50 rounded-md px-4 py-2 ${isHomeTeam ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`flex items-center gap-2 ${isHomeTeam ? '' : 'flex-row-reverse'}`}>
                              <span className="font-medium">{goal.player.name}</span>
                              <span className="text-xs text-gray-400">{goal.minute}'</span>
                            </div>

                            {assist && assist.player && (
                              <div className={`flex items-center gap-2 text-gray-400 ${isHomeTeam ? 'ml-4' : 'mr-4'} mt-1 sm:mt-0 ${isHomeTeam ? '' : 'flex-row-reverse'}`}>
                                <span className="text-blue-400">🤝</span>
                                <span>{assist.player.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 italic">Nenhum gol registrado</div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>

        {/* Botão de finalizar rodada */}
        {!round.finished && (
          <div className="mt-6">
            {isAdmin ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-lg font-medium">
                    Finalizar Rodada
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalizar Rodada</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja finalizar esta rodada? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinishRound}>
                      Finalizar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div className="w-full bg-slate-700/50 py-6 px-4 rounded-lg flex items-center justify-center gap-3 cursor-not-allowed">
                <Lock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">Apenas administradores podem finalizar rodadas</span>
              </div>
            )}
          </div>
        )}

        {round.finished && (
          <div className="mt-6 bg-green-900/30 p-4 rounded-lg text-center">
            <p className="text-green-400 font-medium">Rodada Finalizada</p>
          </div>
        )}
      </motion.div>
    </main>
  );
}

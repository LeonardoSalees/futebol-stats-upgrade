"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateInBrazilDays } from "@/utils/date-format";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ROUTES, BUTTON_STYLES, TEXT_STYLES } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  finished: boolean;
}

interface Round {
  id: string;
  name: string;
  date: string;
  finished: boolean;
  games: Game[];
}

// Componente de navegação principal com cards
const MainNavigation = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const handleNewRound = () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem criar novas rodadas");
      return;
    }
    router.push(ROUTES.NEW_ROUND);
  };

  const handleTeams = () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem sortear times");
      return;
    }
    router.push(ROUTES.TEAMS);
  };

  const handleConfirmation = () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem confirmar jogadores");
      return;
    }
    router.push(ROUTES.PLAYERS_CONFIRMATION);
  };

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Link href={ROUTES.STATS} className="group">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-3 h-full shadow-lg transform transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 transition-colors">
              <span className="text-lg font-bold text-white">📊</span>
            </div>
            <h3 className="text-sm font-bold text-white">Estatísticas</h3>
          </div>
        </div>
      </Link>
      
      <div className="group cursor-pointer" onClick={handleTeams}>
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-3 h-full shadow-lg transform transition-all duration-300 group-hover:shadow-green-500/20 group-hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-600 transition-colors">
              <span className="text-lg font-bold text-white">⚽</span>
            </div>
            <h3 className="text-sm font-bold text-white">Sortear Times</h3>
            {!isAdmin && (
              <div className="mt-1 flex items-center text-xs text-gray-400">
                <FaLock className="mr-1 h-3 w-3" />
                Admin
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href={ROUTES.PLAYERS} className="group">
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-3 h-full shadow-lg transform transition-all duration-300 group-hover:shadow-purple-500/20 group-hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-600 transition-colors">
              <span className="text-lg font-bold text-white">👥</span>
            </div>
            <h3 className="text-sm font-bold text-white">Jogadores</h3>
          </div>
        </div>
      </Link>

      <div className="group cursor-pointer" onClick={handleConfirmation}>
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-3 h-full shadow-lg transform transition-all duration-300 group-hover:shadow-yellow-500/20 group-hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-600 transition-colors">
              <span className="text-lg font-bold text-white">✓</span>
            </div>
            <h3 className="text-sm font-bold text-white">Confirmar</h3>
            {!isAdmin && (
              <div className="mt-1 flex items-center text-xs text-gray-400">
                <FaLock className="mr-1 h-3 w-3" />
                Admin
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="group cursor-pointer" onClick={handleNewRound}>
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg p-3 h-full shadow-lg transform transition-all duration-300 group-hover:shadow-indigo-500/20 group-hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-600 transition-colors">
              <span className="text-lg font-bold text-white">➕</span>
            </div>
            <h3 className="text-sm font-bold text-white">Nova Rodada</h3>
            {!isAdmin && (
              <div className="mt-1 flex items-center text-xs text-gray-400">
                <FaLock className="mr-1 h-3 w-3" />
                Admin
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de rodada ativa com design moderno
const ActiveRound = ({ round }: { round: Round }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/rounds/${round.id}`);
  };
  
  return (
    <section 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 cursor-pointer hover:bg-gray-800/80 transition-colors"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-2">
        <h2 className="text-white font-bold text-base flex items-center">
          <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          Rodada Atual
        </h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
              <span className="text-yellow-400 text-base">📅</span>
            </div>
            <span className="text-gray-300 text-sm">
              {dateInBrazilDays(new Date(round.date))}
            </span>
          </div>
          <div className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-medium">
            Jogos Ativos
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center text-base">
            <div className="flex-1 text-right">
              <span className="font-bold text-white text-sm">{round.games[0].homeTeam}</span>
            </div>
            <div className="mx-3 flex items-center">
              <span className="text-xl font-bold text-yellow-400">{round.games[0].homeScore}</span>
              <span className="mx-1 text-gray-400">x</span>
              <span className="text-xl font-bold text-yellow-400">{round.games[0].awayScore}</span>
            </div>
            <div className="flex-1 text-left">
              <span className="font-bold text-white text-sm">{round.games[0].awayTeam}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de histórico de partidas
const MatchHistory = ({ rounds }: { rounds: Round[] | undefined }) => {
  const router = useRouter();

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Histórico de Partidas</h2>
      <div className="grid gap-4">
        {rounds?.map((round) => (
          <div 
            key={round.id} 
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => router.push(`/rounds/${round.id}`)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">{round.name}</span>
              <span className="text-gray-400 text-sm">
                {dateInBrazilDays(new Date(round.date))}
              </span>
            </div>
            <div className="space-y-2">
              {round.games.map((game) => (
                <div key={game.id} className="flex justify-between items-center text-sm">
                  <span className="text-white">{game.homeTeam}</span>
                  <span className="text-yellow-400 font-bold">
                    {game.homeScore} x {game.awayScore}
                  </span>
                  <span className="text-white">{game.awayTeam}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function Home() {
  const { rounds, loading, error, refetchRounds, hasActiveGame, activeRound } = useAppContext();

  return (
    <div className="pt-20 space-y-6">
      {/* Navegação Principal */}
      <MainNavigation />

      {/* Estado de Carregamento */}
      {loading ? (
        <SkeletonLoader />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={refetchRounds} />
      ) : (
        <div className="space-y-6">
          {/* Rodada Ativa */}
          {hasActiveGame && activeRound && <ActiveRound round={activeRound} />}

          {/* Histórico de Partidas */}
          <MatchHistory rounds={rounds} />
        </div>
      )}
    </div>
  );
}

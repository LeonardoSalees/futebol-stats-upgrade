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
import { RoundWithGames } from "@/types";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaUsers, FaFootballBall, FaCalendarCheck, FaTrophy, FaClipboardList } from "react-icons/fa";

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
  date: string;
  finished: boolean;
  games: Game[] | null; // Verifica se a lista de jogos é null ou não
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
const ActiveRound = ({ round }: { round: RoundWithGames | undefined }) => {
  const router = useRouter();
  
  if (!round || !round.games) {
    return null; // Caso o round ou os jogos sejam nulos ou indefinidos
  }

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
              <span className="font-bold text-white text-sm">{round.games[0]?.homeTeam}</span>
            </div>
            <div className="mx-3 flex items-center">
              <span className="text-xl font-bold text-yellow-400">{round.games[0]?.homeScore}</span>
              <span className="mx-1 text-gray-400">x</span>
              <span className="text-xl font-bold text-yellow-400">{round.games[0]?.awayScore}</span>
            </div>
            <div className="flex-1 text-left">
              <span className="font-bold text-white text-sm">{round.games[0]?.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente de histórico de partidas
const MatchHistory = ({ rounds }: { rounds: RoundWithGames[] | undefined }) => {
  const router = useRouter();

  if (!rounds || rounds.length === 0) {
    return null; // Caso os rounds sejam nulos ou vazios
  }

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Histórico de Partidas</h2>
      <div className="grid gap-4">
        {rounds.map((round) => (
          <div 
            key={round.id} 
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => router.push(`/rounds/${round.id}`)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">{round.id}</span>
              <span className="text-gray-400 text-sm">
                {dateInBrazilDays(new Date(round.date))}
              </span>
            </div>
            <div className="space-y-2">
              {round.games?.map((game) => (
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
  const [tenant, setTenant] = useState<any>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [errorTenant, setErrorTenant] = useState<string | null>(null);

  useEffect(() => {
    // Extrair subdomínio do host
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    const isLocalSubdomain = host.includes('localhost') && subdomain !== 'localhost';
    
    // Verificar se temos um subdomínio
    if (isLocalSubdomain || (subdomain !== 'localhost' && !host.includes('localhost:3000'))) {
      // Verificar o tenant
      fetch(`/api/tenant/verify?subdomain=${subdomain}`)
        .then(res => {
          if (!res.ok) {
            // Em vez de gerar um erro, apenas consideramos como visitante do site principal
            setTenant({ name: 'Sistema Central', subdomain: 'central' });
            setLoadingTenant(false);
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setTenant(data);
          }
          setLoadingTenant(false);
        })
        .catch(err => {
          console.error('Erro ao verificar tenant:', err);
          // Em vez de mostrar erro, exibimos a landing page
          setTenant({ name: 'Sistema Central', subdomain: 'central' });
          setLoadingTenant(false);
        });
    } else {
      setTenant({ name: 'Sistema Central', subdomain: 'central' });
      setLoadingTenant(false);
    }
  }, []);

  if (loadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (tenant?.subdomain !== 'central') {
    // Redirecionar para a dashboard da quadra específica
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 p-4">
        <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-lg text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            {tenant?.name || 'Bem-vindo'}
          </h1>
          
          <div className="mb-6 text-gray-600">
            <p>
              Você está acessando a quadra {tenant.name} ({tenant.subdomain}).
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Link 
              href="/stats"
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Ver estatísticas
            </Link>
            
            <Link 
              href="/games"
              className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Jogos
            </Link>
            
            <Link 
              href="/login"
              className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Homepage principal com marketing
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/field-bg.jpg')] bg-cover opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Transforme suas <span className="text-yellow-400">estatísticas de futebol</span> em vantagem competitiva
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                A plataforma completa para gestão de estatísticas, torneios e desempenho para sua quadra de futebol.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a href="#solicitar-demo" className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg text-center transition-colors">
                  Solicitar Demo
                </a>
                <a href="#recursos" className="px-8 py-3 bg-transparent hover:bg-white/10 border border-white rounded-lg text-center transition-colors">
                  Conheça os Recursos
                </a>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-full h-[400px] bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                  <div className="h-8 bg-gray-700 flex items-center px-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-700 p-2 rounded-lg mb-3">
                      <div className="h-6 w-3/4 bg-gray-600 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-900/50 p-4 rounded-lg h-32">
                        <div className="flex justify-between mb-2">
                          <div className="h-5 w-20 bg-blue-700 rounded"></div>
                          <div className="h-5 w-5 bg-blue-700 rounded-full"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-blue-700/60 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-blue-700/60 rounded"></div>
                        <div className="mt-4 flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
                        </div>
                      </div>
                      <div className="bg-green-900/50 p-4 rounded-lg h-32">
                        <div className="flex justify-between mb-2">
                          <div className="h-5 w-20 bg-green-700 rounded"></div>
                          <div className="h-5 w-5 bg-green-700 rounded-full"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-green-700/60 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-green-700/60 rounded"></div>
                        <div className="mt-4 flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
                        </div>
                      </div>
                      <div className="bg-purple-900/50 p-4 rounded-lg h-32">
                        <div className="flex justify-between mb-2">
                          <div className="h-5 w-20 bg-purple-700 rounded"></div>
                          <div className="h-5 w-5 bg-purple-700 rounded-full"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-purple-700/60 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-purple-700/60 rounded"></div>
                        <div className="mt-4 flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
                        </div>
                      </div>
                      <div className="bg-yellow-900/50 p-4 rounded-lg h-32">
                        <div className="flex justify-between mb-2">
                          <div className="h-5 w-20 bg-yellow-700 rounded"></div>
                          <div className="h-5 w-5 bg-yellow-700 rounded-full"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-yellow-700/60 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-yellow-700/60 rounded"></div>
                        <div className="mt-4 flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20 bg-gradient-to-b from-gray-900 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Nossa plataforma oferece tudo o que você precisa para gerenciar sua quadra de futebol com facilidade e eficiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-800/80 transition-colors">
                <FaChartBar className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Estatísticas Detalhadas</h3>
              <p className="text-gray-400">
                Acompanhe gols, assistências, vitórias e todos os dados importantes de cada jogador. Visualize tendências e evolução ao longo do tempo.
              </p>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors group">
              <div className="w-14 h-14 bg-green-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-800/80 transition-colors">
                <FaUsers className="text-2xl text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Jogadores</h3>
              <p className="text-gray-400">
                Cadastre jogadores, controle presenças e organize times de forma equilibrada para jogos mais competitivos e divertidos.
              </p>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-colors group">
              <div className="w-14 h-14 bg-yellow-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-800/80 transition-colors">
                <FaFootballBall className="text-2xl text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sorteio Inteligente</h3>
              <p className="text-gray-400">
                Algoritmo avançado que forma times equilibrados com base no histórico de desempenho de cada jogador.
              </p>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-800/80 transition-colors">
                <FaCalendarCheck className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Controle de Rodadas</h3>
              <p className="text-gray-400">
                Crie e gerencie rodadas de jogos, registre resultados em tempo real e mantenha um histórico completo das partidas.
              </p>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors group">
              <div className="w-14 h-14 bg-red-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-800/80 transition-colors">
                <FaTrophy className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rankings e Premiações</h3>
              <p className="text-gray-400">
                Crie rankings automáticos para artilheiros, assistentes e jogadores mais valiosos. Incentive a competição saudável.
              </p>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-colors group">
              <div className="w-14 h-14 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-800/80 transition-colors">
                <FaClipboardList className="text-2xl text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirmação de Presença</h3>
              <p className="text-gray-400">
                Sistema intuitivo para que jogadores confirmem presença nas rodadas, facilitando o planejamento dos jogos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-xl text-gray-300">
              Oferecemos uma solução completa que atende a todas as necessidades dos organizadores e jogadores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Economia de Tempo</h3>
              <p className="text-gray-400">
                Automatize tarefas administrativas e foque no que realmente importa: jogar futebol.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Dados Precisos</h3>
              <p className="text-gray-400">
                Acesso a estatísticas detalhadas para tomada de decisões baseadas em dados reais.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Adaptabilidade</h3>
              <p className="text-gray-400">
                Sistema flexível que se adapta às necessidades específicas da sua quadra.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Engajamento dos Jogadores</h3>
              <p className="text-gray-400">
                Aumente a participação com rankings, estatísticas individuais e competições.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Profissionalismo</h3>
              <p className="text-gray-400">
                Eleve o nível dos seus jogos com uma plataforma profissional e organizada.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Acesso em Qualquer Lugar</h3>
              <p className="text-gray-400">
                Plataforma responsiva acessível em todos os dispositivos, a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="solicitar-demo" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-8 md:p-12 shadow-2xl border border-blue-500/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Pronto para transformar sua experiência de futebol?</h2>
                <p className="text-xl text-blue-100 mb-6">
                  Entre em contato hoje mesmo e solicite uma demonstração gratuita para sua quadra.
                </p>
                <form className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Nome" 
                      className="px-4 py-3 bg-blue-700/50 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-blue-300 w-full"
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="px-4 py-3 bg-blue-700/50 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-blue-300 w-full"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nome da sua quadra" 
                    className="px-4 py-3 bg-blue-700/50 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-blue-300 w-full"
                  />
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
                  >
                    Solicitar Demonstração
                  </button>
                </form>
              </div>
              <div className="hidden md:block md:w-1/3">
                <div className="w-48 h-48 mx-auto bg-blue-700/50 rounded-full flex items-center justify-center border-4 border-blue-300/30">
                  <FaFootballBall className="text-7xl text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">&copy; 2023 FutebolStats. Todos os direitos reservados.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <a href="#recursos" className="text-gray-400 hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#solicitar-demo" className="text-gray-400 hover:text-white transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

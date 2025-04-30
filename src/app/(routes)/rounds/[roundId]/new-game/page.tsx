// src/app/round/[id]/new-game.tsx

'use client'

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import axios from "axios";
import { ArrowLeft, Calendar, Trophy, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NewGamePage() {
  const {roundId} = useParams();
  const id = parseInt(roundId as string || '0');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<string>("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<string>("");
  const [roundFinished, setRoundFinished] = useState(false);
  const [roundLoading, setRoundLoading] = useState(true);

  // Verificar se a rodada está finalizada e buscar os times disponíveis
  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const response = await axios.get(`/api/rounds/${id}`);
        setRoundFinished(response.data.finished);
        
        // Buscar os times da rodada
        if (response.data.teams && response.data.teams.length > 0) {
          const teamNames = response.data.teams.map((team: any) => team.name);
          setAvailableTeams(teamNames);
        } else {
          setError("Nenhum time foi sorteado para esta rodada. Sorteie os times primeiro.");
        }
      } catch (error) {
        console.error("Erro ao verificar status da rodada:", error);
        setError("Erro ao verificar status da rodada");
      } finally {
        setRoundLoading(false);
      }
    };

    fetchRoundData();
  }, [id]);

  const handleHomeTeamChange = (team: string) => {
    setSelectedHomeTeam(team);
    if (team === selectedAwayTeam) {
      setSelectedAwayTeam("");
    }
  };

  const handleAwayTeamChange = (team: string) => {
    setSelectedAwayTeam(team);
    if (team === selectedHomeTeam) {
      setSelectedHomeTeam("");
    }
  };

  const createGame = async () => {
    if (!selectedHomeTeam || !selectedAwayTeam) {
      setError("Selecione os dois times para criar o jogo");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const {data} = await axios.post(`/api/games`, {
        roundId: id,
        homeTeam: selectedHomeTeam,
        awayTeam: selectedAwayTeam,
        date: new Date(),
      });
      router.push(`/games/${data.id}`);
    } catch (error: any) {
      console.error("Erro ao criar jogo:", error);
      setError(error.response?.data?.error || "Erro ao criar jogo");
    } finally {
      setLoading(false);
    }
  };

  // Se a rodada estiver finalizada, mostrar mensagem de erro
  if (roundFinished) {
    return (
      <main className="max-w-xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Jogo</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl shadow-lg p-6 space-y-6 text-white"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center">Rodada Finalizada</h2>
          <p className="text-center text-gray-300">
            Não é possível criar um novo jogo para uma rodada que já foi finalizada.
          </p>
          
          <Button
            onClick={() => router.back()}
            className="w-full bg-white text-red-800 hover:bg-gray-100"
          >
            Voltar para a Rodada
          </Button>
        </motion.div>
      </main>
    );
  }

  // Se estiver carregando o status da rodada, mostrar loading
  if (roundLoading) {
    return (
      <main className="max-w-xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Jogo</h1>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  // Se não houver times disponíveis, mostrar mensagem de erro
  if (availableTeams.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Jogo</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl shadow-lg p-6 space-y-6 text-white"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center">Nenhum Time Disponível</h2>
          <p className="text-center text-gray-300">
            Não há times sorteados para esta rodada. Sorteie os times primeiro.
          </p>
          
          <Button
            onClick={() => router.push(`/rounds/${id}/draw-teams`)}
            className="w-full bg-white text-yellow-800 hover:bg-gray-100"
          >
            Ir para Sorteio de Times
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className="hover:bg-gray-100 p-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Jogo</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl shadow-lg p-6 space-y-6 text-white"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center">Selecione os Times</h2>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-2 text-center">Time da Casa</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableTeams.map((team) => (
                  <button
                    key={team}
                    onClick={() => handleHomeTeamChange(team)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedHomeTeam === team
                        ? "bg-green-600 text-white font-bold"
                        : "bg-slate-700/50 hover:bg-slate-600/70"
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
              {selectedHomeTeam && (
                <div className="mt-3 p-3 bg-green-600/20 rounded-lg text-center">
                  <p className="font-medium">{selectedHomeTeam}</p>
                </div>
              )}
            </div>
            
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
              VS
            </div>
            
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-2 text-center">Time Visitante</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableTeams.map((team) => (
                  <button
                    key={team}
                    onClick={() => handleAwayTeamChange(team)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedAwayTeam === team
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-slate-700/50 hover:bg-slate-600/70"
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
              {selectedAwayTeam && (
                <div className="mt-3 p-3 bg-blue-600/20 rounded-lg text-center">
                  <p className="font-medium">{selectedAwayTeam}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            <p className="text-sm">A data será definida automaticamente</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 p-3 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        <Button
          onClick={createGame}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-medium"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar Jogo'}
        </Button>
      </motion.div>
    </main>
  );
}

'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X, Users, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/app/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";

interface Player {
  id: number;
  name: string;
  isAvailable: boolean;
}

export default function PlayersConfirmation() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/players");
      setPlayers([...response.data]);
    } catch (error) {
      console.error("Erro ao carregar jogadores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de jogadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (playerId: number, currentStatus: boolean) => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem alterar a disponibilidade dos jogadores",
        variant: "destructive",
      });
      return;
    }

    try {
      setRefreshing(true);
      await axios.put(`/api/players/${playerId}`, {
        isAvailable: !currentStatus,
        playerId
      });
      
      // Atualiza apenas o jogador específico em vez de recarregar toda a lista
      setPlayers(players.map(player => 
        player.id === playerId 
          ? { ...player, isAvailable: !currentStatus } 
          : player
      ));
      
      toast({
        title: "Sucesso",
        description: `Jogador ${!currentStatus ? "disponibilizado" : "indisponibilizado"} com sucesso`,
      });
    } catch (err) {
      console.error("Erro ao atualizar disponibilidade", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a disponibilidade do jogador",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Confirmação de Jogadores</h1>
        </div>
        <Button 
          onClick={fetchPlayers} 
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full"
          disabled={refreshing}
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Card principal */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Disponibilidade para Próxima Rodada</h2>
            <p className="text-gray-400 text-sm">Confirme quais jogadores estarão disponíveis para jogar</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : players.length === 0 ? (
          <div className="bg-slate-700/50 p-6 rounded-lg text-center">
            <p className="text-gray-300">Nenhum jogador cadastrado.</p>
            <Button 
              onClick={() => router.push('/players')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Cadastrar Jogadores
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.isAvailable 
                    ? 'bg-green-900/30 border border-green-800/50' 
                    : 'bg-red-900/30 border border-red-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    player.isAvailable ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {player.isAvailable ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <X className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-white">{player.name}</span>
                </div>
                <Button
                  onClick={() => toggleAvailability(player.id, player.isAvailable)}
                  className={`${
                    player.isAvailable 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  disabled={!isAdmin || refreshing}
                >
                  {player.isAvailable ? 'Disponível' : 'Indisponível'}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {!isAdmin && (
          <div className="mt-6 bg-slate-700/50 p-4 rounded-lg text-center">
            <p className="text-gray-300">
              Apenas administradores podem alterar a disponibilidade dos jogadores.
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
}

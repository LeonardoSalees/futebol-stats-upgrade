"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/app/contexts/AppContext';
import { Player } from '@/app/types';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaFutbol, 
  FaHandshake,
  FaUser,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaTrophy,
  FaMedal,
  FaStar,
  FaInfoCircle,
  FaLock
} from 'react-icons/fa';
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PlayersPage() {
  const router = useRouter();
  const { players, loading, error, refetchPlayers } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlayer, setNewPlayer] = useState({ name: '', isAvailable: true });
  const [isNewPlayerDialogOpen, setIsNewPlayerDialogOpen] = useState(false);
  const { isAdmin } = useAuth();

  const filteredPlayers = players?.filter(player => {
    if (!player) return false;
    
    const nameMatch = player.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const teamMatch = player.team?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    return nameMatch || teamMatch;
  });

  const handleNewPlayer = () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem adicionar novos jogadores");
      return;
    }
    setIsNewPlayerDialogOpen(true);
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast.error('Nome do jogador é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });

      if (!response.ok) throw new Error('Erro ao adicionar jogador');

      await refetchPlayers();
      setNewPlayer({ name: '', isAvailable: true });
      setIsNewPlayerDialogOpen(false);
      toast.success('Jogador adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      toast.error('Erro ao adicionar jogador');
    }
  };

  const handleAddGoal = async (player: Player) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem adicionar gols");
      return;
    }
    
    try {
      const response = await fetch(`/api/players/${player.id}/goals`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao adicionar gol');

      await refetchPlayers();
      toast.success('Gol adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar gol:', error);
      toast.error('Erro ao adicionar gol');
    }
  };

  const handleAddAssist = async (player: Player) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem adicionar assistências");
      return;
    }
    
    try {
      const response = await fetch(`/api/players/${player.id}/assists`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao adicionar assistência');

      await refetchPlayers();
      toast.success('Assistência adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar assistência:', error);
      toast.error('Erro ao adicionar assistência');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">Erro ao carregar jogadores: {error.message}</div>
        </div>
      </div>
    );
    }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Jogadores</h1>
                <p className="mt-1 text-sm text-gray-400">Gerencie os jogadores do time</p>
              </div>
              {isAdmin ? (
                <Button 
                  onClick={handleNewPlayer} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
                  title="Adicionar novo jogador"
                >
                  <FaPlus className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center text-gray-400 text-sm">
                  <FaLock className="mr-2" />
                  Apenas administradores podem adicionar jogadores
                </div>
              )}
            </div>
          </div>

          {/* Search and Quick Add */}
          <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar jogadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-full"
                />
              </div>
            </div>
      </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPlayers?.map((player) => (
              <div
                key={player.id}
                className="bg-gray-800 shadow rounded-lg p-4 sm:p-6 hover:bg-gray-750 transition-colors duration-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-white truncate max-w-[150px]">{player.name}</h3>
                        {player.isAvailable ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                            <FaUserCheck className="mr-1 h-3 w-3" /> Disponível
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                            <FaUserTimes className="mr-1 h-3 w-3" /> Indisponível
                          </span>
                        )}
                      </div>
                      {player.team && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                            <FaUsers className="mr-1 h-3 w-3" /> {player.team}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats Section */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {isAdmin ? (
                          <Button 
                            onClick={() => handleAddGoal(player)}
                            className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
                            title="Adicionar Gol"
                          >
                            <FaFutbol className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="bg-gradient-to-r from-yellow-600 to-amber-500 p-2 rounded-lg opacity-50">
                            <FaFutbol className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-lg">{player.goalsCount || 0}</span>
                          <span className="text-gray-400 text-xs">Gols</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isAdmin ? (
                          <Button 
                            onClick={() => handleAddAssist(player)}
                            className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
                            title="Adicionar Assistência"
                          >
                            <FaHandshake className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="bg-gradient-to-r from-purple-600 to-violet-500 p-2 rounded-lg opacity-50">
                            <FaHandshake className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-lg">{player.assistsCount || 0}</span>
                          <span className="text-gray-400 text-xs">Assist</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isNewPlayerDialogOpen} onOpenChange={setIsNewPlayerDialogOpen}>
        {/* <DialogTrigger asChild>
          <Button
            onClick={handleNewPlayer}
            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg w-full sm:w-auto"
          >
            <FaPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Jogador</span>
          </Button>
        </DialogTrigger> */}
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Jogador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome do Jogador
              </label>
              <Input
                type="text"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Digite o nome do jogador"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="available"
                type="checkbox"
                checked={newPlayer.isAvailable}
                onChange={(e) => setNewPlayer({ ...newPlayer, isAvailable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-300">
                Disponível para jogos
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                onClick={handleAddPlayer}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

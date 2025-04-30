"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Player } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUsers, FaRandom, FaCheck, FaFutbol, FaHandshake } from "react-icons/fa";
import { ListSkeleton, SkeletonContainer } from "@/components/skeletons";
import { useAppContext } from "../contexts/AppContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PlayerWithCounts = {
  id: number;
  name: string;
  team: string | null;
  isAvailable: boolean;
  _count: {
    goals: number;
    assists: number;
  };
};

// Cores dos coletes disponíveis
const TEAM_COLORS = ["Verde", "Azul", "Roxo", "Vermelho", "Preto"];

interface SortableItemProps {
  id: number;
  player: {
    id: number;
    name: string;
    team: string | null;
    isAvailable: boolean;
    _count: {
      goals: number;
      assists: number;
    };
  };
  colorClass: string;
}

export function SortableItem({ id, player, colorClass }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className={`inline-block w-4 h-4 rounded-full mr-2 ${colorClass}`}></span>
        <span className="font-medium text-white">{player.name}</span>
      </div>
      <div className="flex items-center gap-4 text-gray-300 text-sm">
        <div className="flex items-center gap-1">
          <FaFutbol className="text-yellow-400 h-3 w-3" />
          {player._count.goals || 0}
        </div>
        <div className="flex items-center gap-1">
          <FaHandshake className="text-green-400 h-3 w-3" />
          {player._count.assists || 0}
        </div>
      </div>
    </li>
  );
}

export default function ManageTeamsPage() {
  const { activeRound } = useAppContext();
  const [players, setPlayers] = useState<PlayerWithCounts[]>([]);
  const [teams, setTeams] = useState<PlayerWithCounts[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawing, setDrawing] = useState<boolean>(false);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data }: { data: PlayerWithCounts[] } = await axios.get("/api/players/availables");
      setPlayers(data);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao carregar jogadores.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTeams = async () => {
    if (teams.length === 0) {
      toast.error("Times inválidos.");
      return;
    }
    
    if (!activeRound) {
      toast.error("Nenhuma rodada ativa encontrada. Crie uma rodada primeiro.");
      return;
    }
  
    try {
      setDrawing(true);
      const formattedTeams = teams.map((teamPlayers, index) => ({
        name: TEAM_COLORS[index] || `Time ${index + 1}`,
        players: teamPlayers.map((player) => player.id),
      }));
  
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: activeRound.id,
          teams: formattedTeams,
        }),
      });
  
      if (response.ok) {
        toast.success("Times confirmados com sucesso!");
      } else {
        const error = await response.json();
        console.error("Erro:", error);
        toast.error("Erro ao confirmar times.");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao confirmar times.");
    } finally {
      setDrawing(false);
    }
  };

  const handleTeamDraw = () => {
    setDrawing(true);
    const shuffledPlayers = [...players];
    shuffledPlayers.sort(() => Math.random() - 0.5);

    const maxPlayersPerTeam = 5;
    const numTeams = Math.ceil(shuffledPlayers.length / maxPlayersPerTeam);

    let newTeams: PlayerWithCounts[][] = [];

    for (let i = 0; i < numTeams; i++) {
      newTeams.push(shuffledPlayers.slice(i * maxPlayersPerTeam, (i + 1) * maxPlayersPerTeam));
    }

    setTeams(newTeams);
    setDrawing(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over &&active.id !== over.id) {
      setTeams((teams) => {
        const oldIndex = teams.findIndex((team) => team.some((player) => player.id === active.id));
        const newIndex = teams.findIndex((team) => team.some((player) => player.id === over.id));

        const oldTeam = teams[oldIndex];
        const newTeam = teams[newIndex];

        const oldPlayerIndex = oldTeam.findIndex((player) => player.id === active.id);
        const newPlayerIndex = newTeam.findIndex((player) => player.id === over.id);

        const updatedOldTeam = [...oldTeam];
        const updatedNewTeam = [...newTeam];

        const [movedPlayer] = updatedOldTeam.splice(oldPlayerIndex, 1);
        updatedNewTeam.splice(newPlayerIndex, 0, movedPlayer);

        const updatedTeams = [...teams];
        updatedTeams[oldIndex] = updatedOldTeam;
        updatedTeams[newIndex] = updatedNewTeam;

        return updatedTeams;
      });
    }
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

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <FaUsers className="mr-2 h-6 w-6 text-blue-400" />
                  Sortear os times
                </h1>
                <p className="mt-1 text-sm text-gray-400">Distribua os jogadores em times equilibrados</p>
                {!activeRound && (
                  <p className="mt-2 text-sm text-yellow-400">
                    <span className="font-medium">Atenção:</span> Você precisa ter uma rodada ativa para confirmar os times.
                  </p>
                )}
              </div>
        <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
          onClick={handleTeamDraw} 
          disabled={loading || drawing}
                title="Sortear times aleatoriamente"
        >
                {drawing ? "Sorteando..." : <FaRandom className="h-4 w-4" />}
        </Button>
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-4">
        {loading ? (
          <SkeletonContainer>
            <ListSkeleton />
          </SkeletonContainer>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {teams.map((team, index) => (
              <SortableContext key={index} items={team.map((player) => player.id)} strategy={verticalListSortingStrategy}>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg font-medium text-white mb-3">
                    <span className={`inline-block w-4 h-4 rounded-full mr-2 ${getTeamColorClass(TEAM_COLORS[index] || "")}`}></span>
                    Time {TEAM_COLORS[index] || String.fromCharCode(65 + index)}
                  </h2>
                  <ul className="space-y-2">
                    {team.map((player) => (
                      <SortableItem key={player.id} id={player.id} player={player} colorClass={getTeamColorClass(TEAM_COLORS[index] || "")} />
                    ))}
                  </ul>
                </div>
              </SortableContext>
            ))}
          </DndContext>
        )}
      </div>

          {/* Confirm Button */}
          {teams.length > 0 && (
            <div className="pt-4">
      <Button 
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg w-full"
        onClick={handleConfirmTeams} 
                disabled={loading || drawing || teams.length === 0 || !activeRound}
                title={!activeRound ? "Nenhuma rodada ativa encontrada" : "Confirmar times sorteados"}
      >
                {drawing ? "Confirmando..." : <FaCheck className="h-4 w-4" />}
      </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

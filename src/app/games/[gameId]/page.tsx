// src/app/rounds/[gameId]/live/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@radix-ui/react-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@radix-ui/react-select";
import { ArrowLeft, CirclePlay, Clock, Flag, UserCircle2, Trophy, Award, Users, X } from "lucide-react";
import { DialogHeader } from "@/app/components/ui/dialog";
import axios from "axios";
import { Game, type Player } from "@prisma/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function RoundLivePage() {
    const gameId = useParams()?.gameId as string;
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [homeTeamName, setHomeTeamName] = useState("");
    const [awayTeamName, setAwayTeamName] = useState<string | undefined>("");
    const [showModal, setShowModal] = useState(false);
    const [selectedScorer, setSelectedScorer] = useState("");
    const [selectedAssist, setSelectedAssist] = useState("");
    const [players, setPlayers] = useState<Player[] | null | undefined>([]);
    const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(null);
    const [roundId, setRoundId] = useState<number | null>(null);
    const [gameDetails, setGameDetails] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScorerSelect, setShowScorerSelect] = useState(false);
    const [showAssistSelect, setShowAssistSelect] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const router = useRouter();
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Buscar jogadores
                const playersResponse = await axios.get('/api/players');
                setPlayers(playersResponse.data);
                
                // Buscar detalhes do jogo
                const gameResponse = await axios.get(`/api/games/${gameId}`);
                const gameData = gameResponse.data;
                setGameDetails(gameData);
                setAwayTeamName(gameData.awayTeam);
                setHomeTeamName(gameData.homeTeam);
                setHomeScore(gameData.homeScore || 0);
                setAwayScore(gameData.awayScore || 0);
                setIsRunning(gameData.started);
                setRoundId(gameData.roundId);
                setTime(gameData.time || 0);
                setIsFinished(gameData.finished || false);
                
                // Se o jogo estiver finalizado, redirecionar para a página da rodada
                if (gameData.finished) {
                    toast("Este jogo já foi finalizado");
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast.error("Erro ao carregar dados do jogo");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [gameId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && !isFinished) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1;
                    // Atualiza o tempo no servidor a cada 30 segundos
                    if (newTime % 10 === 0) {
                        axios.put(`/api/games/${gameId}`, {
                            time: newTime,
                            gameId
                        }).catch(err => console.error("Erro ao atualizar tempo:", err));
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, gameId, isFinished]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handleStart = async () => {
        try {
            setLoading(true);
            // Envia um PUT para a API para iniciar a partida
            await axios.put(`/api/games/${gameId}`, {
                started: true,
                gameId
            });

            // Atualiza o estado local para refletir que a partida foi iniciada
            setIsRunning(true);
            toast.success("Partida iniciada com sucesso!");
        } catch (error) {
            console.error("Erro ao iniciar partida:", error);
            toast.error("Erro ao iniciar partida!");
        } finally {
            setLoading(false);
        }
    };

    const handleScoreClick = (team: "home" | "away") => {
        if (isFinished) return;
        setSelectedTeam(team);
        setShowModal(true);
    };
    
    const handleFinishGame = async () => {
        if (isFinished) return;
        
        const confirm = window.confirm("Tem certeza que deseja finalizar a partida?");
        if (!confirm) return;

        try {
            setLoading(true);
            setIsRunning(false);
            const { data } = await axios.post(`/api/games/${gameId}/finish`);
            setIsFinished(true);
            toast.success("Partida finalizada com sucesso!");
            router.push(`/rounds/${data.roundId}`);
        } catch (error) {
            console.error("Erro ao finalizar partida:", error);
            toast.error("Erro ao finalizar partida!");
            setLoading(false);
        }
    }

    const handleRegisterGoal = async () => {
        if (!selectedScorer || !selectedTeam) {
            toast.error("Selecione o autor do gol e o time");
            return;
        }
        
        try {
            setLoading(true);
            const scorer = players?.find((p) => p.name === selectedScorer);
            const assist = players?.find((p) => p.name === selectedAssist);

            if (!scorer || !gameId) return;
            
            // Verifica se o autor do gol e da assistência são o mesmo jogador
            if (assist && assist.id === scorer.id) {
                toast.error("Um jogador não pode dar assistência para seu próprio gol");
                setLoading(false);
                return;
            }
            
            // Determina o time do jogador com base na seleção
            const team = selectedTeam === "home" ? homeTeamName : awayTeamName;
           
            // Envia o gol para o backend
            await axios.post("/api/goals", {
                playerId: scorer.id,
                gameId: Number(gameId),
                minute: Math.floor(time / 60),
                team: team,
            });
            
            // Atualiza o placar
            if (selectedTeam === "home") {
                const newScore = homeScore + 1;
                setHomeScore(newScore);
                await axios.post(`/api/games/${gameId}/score`, {
                    homeScore: newScore,
                    awayScore,
                    gameId,
                });
            } else if (selectedTeam === "away") {
                const newScore = awayScore + 1;
                setAwayScore(newScore);
                await axios.post(`/api/games/${gameId}/score`, {
                    homeScore,
                    awayScore: newScore,
                    gameId,
                });
            }

            // Se houver assistência e for diferente do autor do gol
            if (assist && assist.id !== scorer.id) {
                await axios.post("/api/assists", {
                    playerId: assist.id,
                    gameId: Number(gameId),
                    minute: Math.floor(time / 60),
                    team: team,
                });
            }

            // Fecha o modal e limpa os estados
            setShowModal(false);
            setSelectedScorer("");
            setSelectedAssist("");
            setSelectedTeam(null);
            
            toast.success("Gol registrado com sucesso!");
        } catch (error) {
            console.error("Erro ao registrar gol/assistência:", error);
            toast.error("Erro ao registrar gol!");
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }
    
    return (
        <main className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Button
                    onClick={() => router.back()}
                    className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Detalhes do Jogo
                </h1>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-600 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-slate-800 to-gray-900 text-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6"
            >
                {/* Cabeçalho do jogo */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold">{homeTeamName} vs {awayTeamName}</h2>
                            <p className="text-xs sm:text-sm text-gray-400">Jogo #{gameId}</p>
                            {isFinished && (
                                <p className="text-xs text-red-400 mt-1">Jogo finalizado</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                        <span className="font-mono text-base sm:text-lg">{formatTime(time)}</span>
                    </div>
                </div>
                
                {/* Placar */}
                <div className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
                    <div className="text-center mb-2 sm:mb-4">
                        <span className="text-xs sm:text-sm uppercase tracking-widest text-gray-400">Placar Atual</span>
                    </div>
                    
                    <div className="flex justify-center items-center gap-3 sm:gap-6">
                        <motion.div 
                            className="flex-1 text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="text-lg sm:text-2xl font-medium text-gray-300 mb-1">{homeTeamName}</div>
                            <div 
                                onClick={() => isRunning && !isFinished ? handleScoreClick("home") : undefined}
                                className={`text-4xl sm:text-6xl font-extrabold ${isRunning && !isFinished ? "cursor-pointer hover:text-green-400 transition-colors" : ""}`}
                            >
                                {homeScore}
                            </div>
                        </motion.div>
                        
                        <div className="text-3xl sm:text-4xl font-bold text-yellow-400">x</div>
                        
                        <motion.div 
                            className="flex-1 text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="text-lg sm:text-2xl font-medium text-gray-300 mb-1">{awayTeamName}</div>
                            <div 
                                onClick={() => isRunning && !isFinished ? handleScoreClick("away") : undefined}
                                className={`text-4xl sm:text-6xl font-extrabold ${isRunning && !isFinished ? "cursor-pointer hover:text-green-400 transition-colors" : ""}`}
                            >
                                {awayScore}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Controles do jogo */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {!isRunning && !isFinished ? (
                        <Button
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 sm:py-6 text-base sm:text-lg font-medium flex items-center justify-center gap-2"
                            onClick={handleStart}
                            disabled={loading}
                        >
                            <CirclePlay className="w-4 h-4 sm:w-5 sm:h-5" /> Iniciar Partida
                        </Button>
                    ) : isRunning && !isFinished ? (
                        <Button
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 sm:py-6 text-base sm:text-lg font-medium flex items-center justify-center gap-2"
                            onClick={handleFinishGame}
                            disabled={loading}
                        >
                            <Flag className="w-4 h-4 sm:w-5 sm:h-5" /> Finalizar Partida
                        </Button>
                    ) : (
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 sm:py-6 text-base sm:text-lg font-medium flex items-center justify-center gap-2"
                            onClick={() => router.push(`/rounds/${roundId}`)}
                            disabled={loading}
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Voltar para a Rodada
                        </Button>
                    )}
                </div>
            </motion.div>
            
            {/* Instruções */}
            {isRunning && !isFinished && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center"
                >
                    <p className="text-xs sm:text-sm">
                        <span className="font-bold">Dica:</span> Clique no placar do time para registrar um gol
                    </p>
                </motion.div>
            )}

            {/* Modal de registro de gol - Versão para celular */}
            <Dialog open={showModal}
                onOpenChange={(isOpen) => {
                    setShowModal(isOpen);
                    if (!isOpen) {
                        setSelectedScorer("");
                        setSelectedAssist("");
                        setShowScorerSelect(false);
                        setShowAssistSelect(false);
                    }
                }}>
                <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-gradient-to-br from-slate-800 to-gray-900 text-white rounded-xl shadow-xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <div className="text-xl font-semibold flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-400" />
                                Registrar Gol
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-full hover:bg-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-300">
                                    Gol para: <span className="font-semibold text-white">{selectedTeam === "home" ? homeTeamName : awayTeamName}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Minuto: {Math.floor(time / 60)}'</p>
                            </div>
                            
                            {/* Seleção de autor do gol */}
                            <div>
                                <label className="block mb-2 font-medium text-sm text-gray-300">
                                    Autor do Gol
                                </label>
                                
                                <button
                                    onClick={() => setShowScorerSelect(!showScorerSelect)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white font-medium rounded-lg py-2 px-3 text-left flex items-center justify-between text-sm"
                                >
                                    <span>{selectedScorer || "Selecione o jogador"}</span>
                                    <span className="text-xs bg-slate-600 px-2 py-1 rounded">▼</span>
                                </button>
                                
                                {showScorerSelect && (
                                    <div className="mt-2 max-h-40 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg">
                                        {players && players.length > 0 ? (
                                            players.map((player) => (
                                                <button
                                                    key={player.id}
                                                    onClick={() => {
                                                        setSelectedScorer(player.name);
                                                        setShowScorerSelect(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 py-2 px-3 hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-sm"
                                                >
                                                    <UserCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <span>{player.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-3 text-center text-gray-400 text-sm">
                                                Nenhum jogador disponível
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Seleção de assistência */}
                            <div>
                                <label className="block mb-2 font-medium text-sm text-gray-300">
                                    Assistência (opcional)
                                </label>
                                
                                <button
                                    onClick={() => setShowAssistSelect(!showAssistSelect)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white font-medium rounded-lg py-2 px-3 text-left flex items-center justify-between text-sm"
                                >
                                    <span>{selectedAssist || "Selecione o jogador"}</span>
                                    <span className="text-xs bg-slate-600 px-2 py-1 rounded">▼</span>
                                </button>
                                
                                {showAssistSelect && (
                                    <div className="mt-2 max-h-40 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg">
                                        {players && players.length > 0 ? (
                                            players
                                                .filter(player => player.name !== selectedScorer)
                                                .map((player) => (
                                                    <button
                                                        key={player.id}
                                                        onClick={() => {
                                                            setSelectedAssist(player.name);
                                                            setShowAssistSelect(false);
                                                        }}
                                                        className="w-full flex items-center gap-2 py-2 px-3 hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-sm"
                                                    >
                                                        <UserCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                        <span>{player.name}</span>
                                                    </button>
                                                ))
                                        ) : (
                                            <div className="py-3 text-center text-gray-400 text-sm">
                                                Nenhum jogador disponível
                                            </div>
                                        )}
                                        
                                        {players && players.length > 0 && players.filter(player => player.name !== selectedScorer).length === 0 && (
                                            <div className="py-3 text-center text-gray-400 text-sm">
                                                Não é possível selecionar o mesmo jogador como autor do gol e da assistência
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botão para registrar o gol */}
                            <Button
                                onClick={handleRegisterGoal}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 font-medium text-sm"
                            >
                                Registrar Gol
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}

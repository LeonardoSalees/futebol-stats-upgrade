

// Definir os tipos para Player e Game
export type GoalType = {
  id: number;
  playerId: number;
  gameId: number;
  player?: {
    name: string;
  };
};

export type AssistType = {
  id: number;
  playerId: number;
  gameId: number;
  player?: {
    name: string;
  };
};

export type Player = {
  id: number;
  name: string;
  goals: GoalType[];
  assists: AssistType[];
  _count: {
    goals: number;
    assists: number;
  };
  assistsCount?: number;
  isAvailable?: boolean;
  player?: {
    name: string;
  };
};

export type Game = {
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

export type Team = {
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

export type Draw = {
  id: number;
  date: string;
  teams: Team[];
};
import { Assist, Game, Goal, Player, Round } from "@prisma/client";

export type GoalWithPlayer = Goal & {
  player: Player;
};

export type AssistWithPlayer = Assist & {
  player: Player;
};

export type GameWithRelations = Game & {
  id: number;
  homeTeam: string;
  awayTeam: string;
  players: Player[];
  goals: GoalWithPlayer[];
  assists: AssistWithPlayer[];
};

export type RoundWithGames = Round & {
  games: GameWithRelations[];
};

export type ApiError = {
  message: string;
  status: number;
}; 
import { z } from "zod";

export const GoalSchema = z.object({
  id: z.number().int().positive().optional(),
  playerId: z.number().int().positive(),
  gameId: z.number().int().positive(),
  team: z.string().min(1),
  minute: z.number().int().min(0),
});
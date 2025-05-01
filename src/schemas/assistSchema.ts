import { z } from "zod";

export const assistSchema = z.object({
  id: z.number().int().positive().optional(),
  playerId: z.number().int().positive({
    message: "playerId deve ser um número inteiro positivo",
  }),
  gameId: z.number().int().positive({
    message: "gameId deve ser um número inteiro positivo",
  }),
  minute: z.number().int().min(0, {
    message: "O minuto não pode ser negativo",
  }),
  team: z.string().min(1, {
    message: "O time é obrigatório",
  }),
});
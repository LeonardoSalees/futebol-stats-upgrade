import { z } from 'zod'

export const roundSchema = z.object({
  id: z.number().optional(), // autoincrementado pelo banco de dados
  date: z.coerce.date().default(new Date()), // aceita string e converte para Date
  finished: z.boolean().default(false),

  // Relacionamentos: tipicamente não são validados diretamente no input
  games: z.array(z.any()).optional(), // substitua z.any() por gameSchema se quiser validar a estrutura
  teams: z.array(z.any()).optional()
})

export type Round = z.infer<typeof roundSchema>
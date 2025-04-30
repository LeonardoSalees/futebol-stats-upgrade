import { describe, it, expect } from 'vitest';
import { assistSchema } from '@/schemas/assistSchema';

describe('assistSchema', () => {
  it('should accept a valid assist', () => {
    const result = assistSchema.safeParse({
      playerId: 1,
      gameId: 1,
      minute: 45,
      team: 'Team A',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a negative playerId', () => {
    const result = assistSchema.safeParse({
      playerId: -1,
      gameId: 1,
      minute: 45,
      team: 'Team A',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('playerId deve ser um número inteiro positivo');
  });

  it('should reject a negative gameId', () => {
    const result = assistSchema.safeParse({
      playerId: 1,
      gameId: -1,
      minute: 45,
      team: 'Team A',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('gameId deve ser um número inteiro positivo');
  });

  it('should reject a negative minute', () => {
    const result = assistSchema.safeParse({
      playerId: 1,
      gameId: 1,
      minute: -5,
      team: 'Team A',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('O minuto não pode ser negativo');
  });

  it('should reject an empty team', () => {
    const result = assistSchema.safeParse({
      playerId: 1,
      gameId: 1,
      minute: 45,
      team: '',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('O time é obrigatório');
  });
}); 
import { describe, expect, it } from 'vitest';
import { gameSchema } from '@/schemas/gameSchema';

describe('gameSchema', () => {
  it('valida com sucesso um objeto válido mínimo', () => {
    const validGame = {
      roundId: 1,
      homeTeam: 'Time A',
      awayTeam: 'Time B',
    };

    const parsed = gameSchema.parse(validGame);
    expect(parsed.roundId).toBe(1);
    expect(parsed.homeScore).toBe(0); // default aplicado
    expect(parsed.finished).toBe(false);
  });

  it('valida com campos opcionais preenchidos', () => {
    const validGame = {
      roundId: 1,
      homeTeam: 'Time A',
      awayTeam: 'Time B',
      date: new Date(),
      homeScore: 3,
      awayScore: 1,
      started: true,
      finished: true,
      startedAt: new Date(),
      time: 90,
      goalIds: [1, 2],
      assistIds: [3],
      playerIds: [4, 5, 6],
      gameStatPlayerIds: [7, 8],
    };

    const parsed = gameSchema.parse(validGame);
    expect(parsed.goalIds).toContain(1);
    expect(parsed.time).toBe(90);
  });

  it('falha se homeTeam estiver vazio', () => {
    const invalidGame = {
      roundId: 1,
      homeTeam: '',
      awayTeam: 'Time B',
    };

    expect(() => gameSchema.parse(invalidGame)).toThrowError(/Nome do time da casa é obrigatório/);
  });

  it('falha se awayTeam estiver faltando', () => {
    const invalidGame = {
      roundId: 1,
      homeTeam: 'Time A',
    };

    expect(() => gameSchema.parse(invalidGame)).toThrowError();
  });

  it('falha se score for negativo', () => {
    const invalidGame = {
      roundId: 1,
      homeTeam: 'Time A',
      awayTeam: 'Time B',
      homeScore: -1,
    };

    expect(() => gameSchema.parse(invalidGame)).toThrowError();
  });

  it('falha se time for negativo', () => {
    const invalidGame = {
      roundId: 1,
      homeTeam: 'Time A',
      awayTeam: 'Time B',
      time: -10,
    };

    expect(() => gameSchema.parse(invalidGame)).toThrowError();
  });
});
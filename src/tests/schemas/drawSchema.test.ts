import { describe, it, expect } from 'vitest';
import { drawSchema } from '@/schemas/drawSchema';

// Test cases for drawSchema

describe('drawSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      roundId: 1,
      teams: [
        {
          name: 'Team A',
          players: [1, 2, 3]
        },
        {
          name: 'Team B',
          players: [4, 5, 6]
        }
      ]
    };

    expect(() => drawSchema.parse(validData)).not.toThrow();
  });

  it('should throw an error for missing roundId', () => {
    const invalidData = {
      teams: [
        {
          name: 'Team A',
          players: [1, 2, 3]
        }
      ]
    };

    expect(() => drawSchema.parse(invalidData)).toThrow();
  });

  it('should throw an error for empty teams array', () => {
    const invalidData = {
      roundId: 1,
      teams: []
    };

    expect(() => drawSchema.parse(invalidData)).toThrow();
  });

  it('should throw an error for invalid player ID', () => {
    const invalidData = {
      roundId: 1,
      teams: [
        {
          name: 'Team A',
          players: [-1, 2, 3]
        }
      ]
    };

    expect(() => drawSchema.parse(invalidData)).toThrow();
  });
}); 
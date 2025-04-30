import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000/api'; // Ajuste a URL conforme necessário

type AssistResponse = { id: number; minute?: number };

describe('Assist API', () => {
  it('should create a new assist', async () => {
    const response = await fetch(`${baseUrl}/assists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: 1,
        playerId: 1,
        minute: 45,
        team: 'Team A'
      })
    });
    const data = await response.json() as AssistResponse;
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
  });

  it('should fetch all assists', async () => {
    const response = await fetch(`${baseUrl}/assists`);
    const data = await response.json() as AssistResponse[];
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });


});
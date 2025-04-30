import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000/api'; // Adjust the URL as necessary

type PlayerResponse = { id: number; name?: string };

describe('Player API', () => {
  it('should create a new player', async () => {
    const response = await fetch(`${baseUrl}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `John Doe ${Date.now()}`,
        isAvailable: true,
        team: 'Team A'
      })
    });
    const data = await response.json() as PlayerResponse;
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
  });

  it('should fetch all players', async () => {
    const response = await fetch(`${baseUrl}/players`);
    const data = await response.json() as PlayerResponse[];
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should update a player', async () => {
    const response = await fetch(`${baseUrl}/players`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        name: 'Jane Doe'
      })
    });
    const data = await response.json() as PlayerResponse;
    expect(response.status).toBe(200);
    expect(data.name).toBe('Jane Doe');
  });

}); 
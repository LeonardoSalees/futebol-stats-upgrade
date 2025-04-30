// utils/api.ts
export const fetchRounds = async () => {
    const response = await fetch('/api/rounds');
    const data = await response.json();
    return data;
  };
  
  export const createGame = async (gameData: any) => {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });
  
    if (!response.ok) {
      throw new Error('Erro ao criar jogo');
    }
  };
  
// components/FormGame.tsx
import { useState } from 'react';
import { createGame } from '../utils/api';

const FormGame = () => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [roundId, setRoundId] = useState(1); // Pode ser ajustado dinamicamente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGame({ homeTeam, awayTeam, roundId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="homeTeam" className="block text-sm font-semibold">Time da Casa</label>
        <input
          type="text"
          id="homeTeam"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="awayTeam" className="block text-sm font-semibold">Time Visitante</label>
        <input
          type="text"
          id="awayTeam"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          className="input"
        />
      </div>
      <button type="submit" className="btn">Criar Jogo</button>
    </form>
  );
};

export default FormGame;
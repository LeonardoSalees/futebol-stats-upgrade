export const ROUTES = {
  STATS: '/stats',
  TEAMS: '/teams',
  PLAYERS: '/players',
  PLAYERS_CONFIRMATION: '/players-confirmation',
  SETTINGS: '/settings',
  NEW_ROUND: '/rounds/new-round',
  ROUND_DETAILS: (id: number) => `/rounds/${id}`,
} as const;

export const BUTTON_STYLES = {
  PRIMARY: 'border-2 border-b-blue-100 bg-gradient-to-r from-neutral-950 to-blue-950 text-white hover:from-pink-600 hover:to-from-neutral-950 w-full p-4 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105',
  SUCCESS: 'border-2 border-b-blue-100 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-pink-600 hover:to-from-neutral-950 w-full p-4 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105',
  DETAILS: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-500',
} as const;

export const TEXT_STYLES = {
  HEADING: 'text-2xl font-semibold text-yellow-400 mb-4',
  SUBHEADING: 'text-lg text-yellow-400',
  ACTIVE_STATUS: 'text-green-400 font-bold',
  GAME_SCORE: 'text-blue-100',
} as const; 
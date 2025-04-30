export interface Player {
  id: string;
  name: string;
  isAvailable: boolean;
  team?: string;
  goalsCount?: number;
  assistsCount?: number;
} 
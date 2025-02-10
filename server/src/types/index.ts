// server/src/types/index.ts
interface Guild {
    id: string;
    name: string;
    description: string;
    memecoin: string;
    entryFee: number;
    treasury: number;
    members: string[];
    established: string;
    mascotImage: string;
    stats: GuildStats;
    monster: Monster;
  }
  
  interface GuildStats {
    weeklyWins: number;
    weeklyBattles: number;
    totalWins: number;
    totalBattles: number;
    weeklyEarnings: number;
    totalEarnings: number;
  }
  
  interface Monster {
    name: string;
    baseStats: MonsterStats;
  }
  
  interface MonsterStats {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  }
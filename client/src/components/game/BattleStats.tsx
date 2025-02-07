import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  { name: "总场数", translation: "Total Score", value: 200, winRate: "35%", matches: 125 },
  { name: "匹配赛", translation: "Equipment", value: 100, winRate: "35%", matches: 125 },
  { name: "排位赛", translation: "Ranking", value: 80, winRate: "35%", matches: 125 },
  { name: "人机对战", translation: "PvP Battles", value: 20, winRate: "35%", matches: 125 }
];

export default function BattleStats() {
  return (
    <Card className="bg-black/40 border-cyan-500/20 p-6 mt-6">
      <h2 className="text-lg font-semibold mb-6">
        <span className="block text-xs">数据统计</span>
        <span className="text-cyan-400">Data Statistics</span>
      </h2>

      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.name}>
            <div className="flex justify-between mb-2">
              <div>
                <span className="block text-xs">{stat.name}</span>
                <span className="text-sm text-muted-foreground">{stat.translation}</span>
              </div>
              <div className="text-right">
                <span className="block text-cyan-400 font-mono text-lg">{stat.value}</span>
                <span className="text-sm text-muted-foreground">Win Rate: {stat.winRate}</span>
              </div>
            </div>
            <Progress value={stat.value} className="h-3" />
          </div>
        ))}
      </div>
    </Card>
  );
}

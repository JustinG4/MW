import { Card } from "@/components/ui/card";
import { Coins, Diamond } from "lucide-react";

const matchHistory = [
  { date: "12/06/2016", currency: 500, experience: 200, type: "排位赛", translation: "Ranked Match" },
  { date: "12/06/2016", currency: 500, experience: 200, type: "排位赛", translation: "Ranked Match" },
  { date: "12/06/2016", currency: 500, experience: 200, type: "排位赛", translation: "Ranked Match" },
  { date: "12/06/2016", currency: 500, experience: 200, type: "排位赛", translation: "Ranked Match" }
];

export default function RightPanel() {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-sm border-l border-cyan-500/20 p-4">
      <h2 className="text-lg font-semibold mb-4">
        <span className="block text-xs">最近战绩</span>
        <span className="text-cyan-400">Recent Battle Records</span>
      </h2>

      <div className="space-y-3">
        {matchHistory.map((match, index) => (
          <Card key={index} className="bg-black/60 border-cyan-500/20 p-4 hover:bg-cyan-500/10 transition-colors">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <div className="text-muted-foreground">{match.date}</div>
                <div>
                  <span className="text-xs">{match.type}</span>
                  <span className="text-xs text-muted-foreground ml-2">{match.translation}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{match.currency}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Diamond className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">{match.experience}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

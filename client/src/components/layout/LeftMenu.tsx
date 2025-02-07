import { Button } from "@/components/ui/button";
import { Trophy, History, Sparkles, Gem, Star } from "lucide-react";

const menuItems = [
  { icon: Trophy, text: "排行榜", translation: "Leaderboard" },
  { icon: History, text: "战斗履历", translation: "Battle History", active: true },
  { icon: Sparkles, text: "技能", translation: "Skills" },
  { icon: Gem, text: "符文", translation: "Runes" },
  { icon: Star, text: "成就", translation: "Achievements" }
];

export default function LeftMenu() {
  return (
    <div className="w-64 bg-black/40 backdrop-blur-sm border-r border-cyan-500/20 p-4">
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Button
            key={item.translation}
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 ${
              item.active 
                ? "bg-cyan-500/20 text-cyan-400" 
                : "hover:bg-cyan-500/10 hover:text-cyan-400"
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.active ? "text-cyan-400" : ""}`} />
            <div className="flex flex-col items-start">
              <span className="text-xs">{item.text}</span>
              <span className="text-xs text-muted-foreground">{item.translation}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

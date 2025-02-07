import TopBar from "@/components/layout/TopBar";
import LeftMenu from "@/components/layout/LeftMenu";
import RightPanel from "@/components/layout/RightPanel";
import PlayerProfile from "@/components/game/PlayerProfile";
import BattleStats from "@/components/game/BattleStats";

export default function GameDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGgtNnYxMmgtNnYtNmgtNnYxMmgxOHYtNmgtNnYtNnptLTYtNmg2djZoLTZ6IiBmaWxsPSJyZ2JhKDAsIDI1NSwgMjU1LCAwLjAyKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="relative h-screen flex flex-col">
        <TopBar />
        
        <div className="flex-1 flex">
          <LeftMenu />
          
          <main className="flex-1 p-6 overflow-auto">
            <PlayerProfile />
            <BattleStats />
          </main>
          
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

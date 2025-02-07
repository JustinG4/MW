import TopBar from "@/components/layout/TopBar";
import LeftMenu from "@/components/layout/LeftMenu";
import RightPanel from "@/components/layout/RightPanel";
import PlayerProfile from "@/components/game/PlayerProfile";
import BattleStats from "@/components/game/BattleStats";

export default function GameDashboard() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      {/* Geometric pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative h-screen flex flex-col">
        <TopBar />

        <div className="flex-1 flex">
          <LeftMenu />

          {/* Empty central game container */}
          <main className="flex-1 relative bg-gradient-to-b from-black/40 to-black/20">
            <div className="absolute inset-0 border border-cyan-500/10" />
          </main>

          {/* Right side stats and battle history */}
          <div className="w-[420px] bg-black/40 border-l border-cyan-500/20">
            <div className="p-6">
              <PlayerProfile />
              <BattleStats />
            </div>
          </div>

          <RightPanel />
        </div>
      </div>
    </div>
  );
}
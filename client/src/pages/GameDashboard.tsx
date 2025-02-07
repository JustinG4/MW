import { ReactNode } from 'react';
import TopBar from "@/components/layout/TopBar";
import LeftMenu from "@/components/layout/LeftMenu";
import RightPanel from "@/components/layout/RightPanel";
import PlayerProfile from "@/components/game/PlayerProfile";
import BattleStats from "@/components/game/BattleStats";

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
}

const DashboardSection = ({ children, className = "" }: DashboardSectionProps) => (
  <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/20 ${className}`}>
    {children}
  </div>
);

export default function GameDashboard() {
  return (
    <div className="min-h-screen bg-[#070B14]">
      {/* Background grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
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
          {/* Left Menu */}
          <DashboardSection className="w-64">
            <LeftMenu />
          </DashboardSection>

          {/* Main Game Area */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 border border-cyan-500/10" />
          </div>

          {/* Stats Panel */}
          <DashboardSection className="w-[420px]">
            <PlayerProfile />
            <BattleStats />
          </DashboardSection>

          {/* Battle History */}
          <DashboardSection className="w-80">
            <RightPanel />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
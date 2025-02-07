import { ReactNode } from 'react';
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Play, Pause, Users, Mail, Settings, Network } from "lucide-react";

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
    <div className="min-h-screen bg-background p-8">
      {/* Main Controls */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 mb-8">
        {/* Media Controls */}
        <div className="flex justify-center gap-4">
          <NeumorphicButton variant="raised" className="p-4">
            <Play className="w-6 h-6 text-accent" />
          </NeumorphicButton>
          <NeumorphicButton variant="raised" className="p-4">
            <Pause className="w-6 h-6 text-accent" />
          </NeumorphicButton>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-surface rounded-full shadow-neumorphic w-full max-w-md mx-auto">
          <div className="h-full w-3/4 bg-accent/20 rounded-full shadow-neumorphic-pressed" />
        </div>

        {/* Stats Display with Icons Above */}
        <div className="w-full max-w-2xl mx-auto">
          {/* Navigation Icons */}
          <div className="flex justify-end gap-2 mb-4">
            {[
              { icon: Users, label: "Social" },
              { icon: Mail, label: "Mail" },
              { icon: Settings, label: "Settings" },
              { icon: Network, label: "Network" }
            ].map((item) => (
              <NeumorphicButton
                key={item.label}
                variant="raised"
                className="p-3"
              >
                <item.icon className="w-5 h-5 text-accent-muted" />
              </NeumorphicButton>
            ))}
          </div>

          {/* Stats Container */}
          <div className="p-8 rounded-2xl bg-surface shadow-neumorphic min-h-[400px]">
            <h2 className="text-accent text-xl mb-6 font-medium">Completed Tasks</h2>
            <div className="h-4 bg-surface rounded-full shadow-neumorphic mb-8">
              <div className="h-full w-[75%] bg-accent/20 rounded-full shadow-neumorphic-pressed" />
            </div>

            <h2 className="text-accent text-xl mb-6 font-medium">Postponed Tasks</h2>
            <div className="h-4 bg-surface rounded-full shadow-neumorphic">
              <div className="h-full w-[30%] bg-accent/20 rounded-full shadow-neumorphic-pressed" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mt-8">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <NeumorphicButton
              key={i}
              variant="switch"
              isActive={i === 2}
              className="w-12 h-12 flex items-center justify-center text-accent-muted"
            >
              {i + 1}
            </NeumorphicButton>
          ))}
        </div>

        <NeumorphicButton variant="raised" className="text-accent">
          View All
        </NeumorphicButton>
      </div>
    </div>
  );
}
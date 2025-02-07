import { ReactNode } from 'react';
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Users, Mail, Settings, Network } from "lucide-react";

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
      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
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
          <div className="p-8 rounded-2xl bg-surface shadow-neumorphic min-h-[400px] mb-8">
            <h2 className="text-accent text-xl mb-6 font-medium">Completed Tasks</h2>
            <div className="h-4 bg-surface rounded-full shadow-neumorphic mb-8">
              <div className="h-full w-[75%] bg-accent/20 rounded-full shadow-neumorphic-pressed" />
            </div>

            <h2 className="text-accent text-xl mb-6 font-medium">Postponed Tasks</h2>
            <div className="h-4 bg-surface rounded-full shadow-neumorphic">
              <div className="h-full w-[30%] bg-accent/20 rounded-full shadow-neumorphic-pressed" />
            </div>
          </div>

          {/* Number Controls - Centered Below Stats */}
          <div className="flex justify-center gap-2 mt-8">
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
        </div>
      </div>
    </div>
  );
}
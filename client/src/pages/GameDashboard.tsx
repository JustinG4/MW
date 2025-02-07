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
              { icon: Users, label: "Social", color: "text-blue-400" },
              { icon: Mail, label: "Mail", color: "text-yellow-400" },
              { icon: Settings, label: "Settings", color: "text-emerald-400" },
              { icon: Network, label: "Network", color: "text-purple-400" }
            ].map((item) => (
              <NeumorphicButton
                key={item.label}
                variant="raised"
                className="p-3"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </NeumorphicButton>
            ))}
          </div>

          {/* Stats Container */}
          <div className="p-12 rounded-2xl bg-surface shadow-neumorphic min-h-[500px] mb-8">
            <div className="flex items-center justify-center h-full">
              <span className="text-accent-muted text-lg">No content to display</span>
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
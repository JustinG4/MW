import { ReactNode } from 'react';
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Users, ChartNetwork, MessagesSquare, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import LeftMenu from "@/components/layout/LeftMenu";
import RightPanel from "@/components/layout/RightPanel";
import GameContainer from "@/components/game/GameContainer";

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
}

const DashboardSection = ({ children, className = "" }: DashboardSectionProps) => (
  <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/20 ${className}`}>
    {children}
  </div>
);

interface DashboardSectionProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function GameDashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Display with Icons Above */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Navigation Icons */}
          <div className="flex justify-end gap-2 mb-4">
            {[
              { icon: Users, label: "Profile", color: "text-blue-400" },
              { icon: ChartNetwork, label: "Network", color: "text-yellow-400" },
              { icon: MessagesSquare, label: "Messages", color: "text-emerald-400" },
              { icon: Wallet, label: "Wallet", color: "text-purple-400" }
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NeumorphicButton
                  variant="raised"
                  className="p-3"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 5 }}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </motion.div>
                </NeumorphicButton>
              </motion.div>
            ))}
          </div>

          {/* Stats Container */}
          <div className="md:p-12 rounded-2xl bg-surface shadow-neumorphic min-h-[700px] w-full mb-8">
            <div className="flex items-center justify-center h-full relative">
              <iframe 
                src="/memedom/index.html"
                className="w-full h-full rounded-xl"
                style={{ 
                  minHeight: '576px',  // Match canvas height
                  maxWidth: '1024px',   // Match canvas width
                  border: 'none'
                }}
              />
              
              {/* Overlapping Border - Higher z-index */}
              <div className="absolute inset-0 rounded-xl pointer-events-none z-10">
                <div className="absolute inset-0 rounded-xl border-2 border-surface/50 shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]" />
              </div>
            </div>
          </div>

          {/* Number Controls - Centered */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NeumorphicButton
                  variant="switch"
                  isActive={false}
                  className="w-12 h-12 flex items-center justify-center text-accent-muted"
                >
                  <motion.span
                    initial={{ y: 0 }}
                    whileHover={{ y: -2 }}
                  >
                    {i + 1}
                  </motion.span>
                </NeumorphicButton>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
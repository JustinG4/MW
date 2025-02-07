import { ReactNode } from 'react';
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Users, ChartNetwork, MessagesSquare, Wallet } from "lucide-react";
import { motion } from "framer-motion";

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
          <div className="p-12 rounded-2xl bg-surface shadow-neumorphic min-h-[500px] mb-8">
            <div className="flex items-center justify-center h-full">
              <span className="text-accent-muted text-lg">No content to display</span>
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
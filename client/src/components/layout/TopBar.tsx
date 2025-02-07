import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, Mail, Users, Network } from "lucide-react";
import ResourceCounter from "../game/ResourceCounter";

export default function TopBar() {
  return (
    <div className="h-16 w-full flex items-center justify-between px-6 bg-black/30 backdrop-blur-sm border-b border-cyan-500/20">
      <Button 
        variant="ghost" 
        size="icon"
        className="rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-8">
        <div className="flex gap-3">
          <ResourceCounter
            type="green-crystal"
            amount={5606}
            icon="hexagonal-emerald"
          />
          <ResourceCounter
            type="yellow-crystal"
            amount={5800}
            icon="hexagonal-amber"
          />
          <ResourceCounter
            type="blue-orb"
            amount={25600}
            icon="circular-energy"
          />
        </div>

        <div className="flex gap-2">
          {[
            { icon: Users, label: "Social" },
            { icon: Mail, label: "Mail" },
            { icon: Settings, label: "Settings" },
            { icon: Network, label: "Network" }
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full hover:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
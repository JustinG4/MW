import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, Mail, Users, Network } from "lucide-react";
import ResourceCounter from "../game/ResourceCounter";

export default function TopBar() {
  return (
    <div className="h-16 border-b border-cyan-500/20 bg-gradient-to-r from-black/60 to-black/40">
      <div className="h-full w-full flex items-center justify-between px-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all group"
        >
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/40" />
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Right side resources and icons */}
        <div className="flex items-center gap-8">
          <div className="flex gap-3">
            <ResourceCounter type="green-crystal" amount={5606} />
            <ResourceCounter type="yellow-crystal" amount={5800} />
            <ResourceCounter type="blue-orb" amount={25600} />
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
                className="w-10 h-10 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors relative group"
              >
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/40" />
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
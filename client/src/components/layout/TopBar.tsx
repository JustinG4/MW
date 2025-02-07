import { ChevronLeft, Users, Mail, Settings, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceProps {
  type: "green" | "yellow" | "blue";
  amount: number;
}

const Resource = ({ type, amount }: ResourceProps) => {
  const getStyles = () => {
    switch (type) {
      case "green":
        return "from-emerald-500/20 to-emerald-500/10 border-emerald-500/30";
      case "yellow":
        return "from-yellow-500/20 to-yellow-500/10 border-yellow-500/30";
      case "blue":
        return "from-cyan-500/20 to-cyan-500/10 border-cyan-500/30";
    }
  };

  return (
    <div className={`
      px-3 py-1.5 
      bg-gradient-to-r ${getStyles()}
      rounded border
      backdrop-blur-sm
    `}>
      <span className="font-mono text-sm text-white">
        {amount.toLocaleString()}
      </span>
    </div>
  );
};

export default function TopBar() {
  return (
    <div className="h-16 border-b border-cyan-500/20 bg-gradient-to-r from-black/60 to-black/40">
      <div className="h-full w-full flex items-center justify-between px-6">
        {/* Back Button */}
        <Button 
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 rounded-full bg-black/40 hover:bg-cyan-500/20 transition-all group"
        >
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 group-hover:border-cyan-500/50" />
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          {/* Resources */}
          <div className="flex gap-3">
            <Resource type="green" amount={5606} />
            <Resource type="yellow" amount={5800} />
            <Resource type="blue" amount={25600} />
          </div>

          {/* Action Icons */}
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
                className="relative w-10 h-10 rounded-full hover:bg-cyan-500/20 transition-all group"
              >
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/40" />
                <item.icon className="h-5 w-5 text-white" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
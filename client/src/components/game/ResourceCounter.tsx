import { Hexagon, CircleDot } from "lucide-react";

interface ResourceCounterProps {
  type: "green-crystal" | "yellow-crystal" | "blue-orb";
  amount: number;
  icon: string;
}

export default function ResourceCounter({ type, amount }: ResourceCounterProps) {
  const getIcon = () => {
    switch (type) {
      case "green-crystal":
        return <Hexagon className="h-5 w-5 text-emerald-400" />;
      case "yellow-crystal":
        return <Hexagon className="h-5 w-5 text-yellow-400" />;
      case "blue-orb":
        return <CircleDot className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
      {getIcon()}
      <span className="text-sm font-medium">{amount.toLocaleString()}</span>
    </div>
  );
}

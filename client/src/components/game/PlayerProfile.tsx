import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function PlayerProfile() {
  return (
    <Card className="bg-black/40 border-cyan-500/20 p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-cyan-500/50">
            <AvatarImage src="https://api.dicebear.com/7.x/pixel-art/svg?seed=John" />
            <AvatarFallback>JG</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            56
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">JHON GIGGER</h2>
          <p className="text-sm text-muted-foreground">Level 56 Player</p>
        </div>
      </div>
    </Card>
  );
}

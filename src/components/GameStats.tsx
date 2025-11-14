import { Timer, Target, Trophy, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GameStatsProps {
  moves: number;
  matches: number;
  totalPairs: number;
  time: string;
  bestScore: number | null;
}

const GameStats = ({ moves, matches, totalPairs, time, bestScore }: GameStatsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
        <Timer className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Tiempo</p>
          <p className="text-lg font-bold text-primary">{time}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-secondary/10 rounded-xl border border-secondary/20">
        <Target className="w-5 h-5 text-secondary" />
        <div>
          <p className="text-xs text-muted-foreground">Movimientos</p>
          <p className="text-lg font-bold text-secondary">{moves}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-success/10 rounded-xl border border-success/20">
        <Trophy className="w-5 h-5 text-success" />
        <div>
          <p className="text-xs text-muted-foreground">Parejas</p>
          <p className="text-lg font-bold text-success">
            {matches}/{totalPairs}
          </p>
        </div>
      </div>

      {bestScore !== null && (
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-xl border border-accent/20">
          <Award className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Mejor</p>
            <p className="text-lg font-bold text-accent">{bestScore}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;

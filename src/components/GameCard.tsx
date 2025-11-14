import { cn } from "@/lib/utils";
import { CardType } from "@/pages/Index";

interface GameCardProps {
  card: CardType;
  onClick: () => void;
  index: number;
}

const GameCard = ({ card, onClick, index }: GameCardProps) => {
  return (
    <div
      className="animate-scale-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={onClick}
        disabled={card.isMatched}
        className={cn(
          "relative w-full aspect-square rounded-2xl transition-all duration-500 transform-gpu perspective-1000",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-primary/50",
          card.isMatched && "opacity-50 cursor-default hover:scale-100"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card Back */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-card)]",
            "flex items-center justify-center backface-hidden border-2 border-primary-glow/30",
            "hover:shadow-[var(--shadow-glow)] transition-shadow duration-300"
          )}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="text-white/80 text-4xl font-bold animate-pulse-glow">?</div>
          {/* Decorative elements */}
          <div className="absolute top-2 right-2 w-8 h-8 border-2 border-white/20 rounded-full" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-white/20 rounded-full" />
        </div>

        {/* Card Front */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-card shadow-[var(--shadow-card)]",
            "flex items-center justify-center backface-hidden border-2",
            card.isMatched
              ? "border-success/50 bg-gradient-to-br from-success/10 to-primary/10"
              : "border-border/50"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className={cn(
              "text-6xl transition-all duration-300",
              card.isMatched && "animate-bounce-in"
            )}
          >
            {card.emoji}
          </div>
          {card.isMatched && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success/20 to-transparent animate-pulse-glow" />
          )}
        </div>

        {/* Glow effect on hover */}
        {!card.isMatched && !card.isFlipped && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary-glow) / 0.3), hsl(var(--accent-glow) / 0.3))",
            }}
          />
        )}
      </button>
    </div>
  );
};

export default GameCard;

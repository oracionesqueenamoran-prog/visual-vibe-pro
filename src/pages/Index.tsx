import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, Trophy, Timer } from "lucide-react";
import { toast } from "sonner";
import GameCard from "@/components/GameCard";
import GameStats from "@/components/GameStats";
import Confetti from "@/components/Confetti";

export interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎸", "🎺", "🎻"];

const Index = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    initializeGame();
    const saved = localStorage.getItem("memoryGameBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (matches === EMOJIS.length && matches > 0) {
      setIsPlaying(false);
      setShowConfetti(true);
      
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem("memoryGameBestScore", moves.toString());
        toast.success("🎉 ¡Nuevo récord! ¡Increíble!", {
          description: `Completado en ${moves} movimientos`,
        });
      } else {
        toast.success("🎊 ¡Felicidades! ¡Lo lograste!", {
          description: `Completado en ${moves} movimientos`,
        });
      }

      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [matches, moves, bestScore]);

  const initializeGame = () => {
    const duplicatedEmojis = [...EMOJIS, ...EMOJIS];
    const shuffled = duplicatedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsPlaying(false);
    setShowConfetti(false);
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying) setIsPlaying(true);

    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
          toast.success("¡Match! 🎉", {
            duration: 1000,
          });
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--game-bg-start))] to-[hsl(var(--game-bg-end))] py-8 px-4 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-4 px-6 py-3 bg-card/80 backdrop-blur-xl rounded-full shadow-[var(--shadow-soft)] border border-border/50">
            <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Juego de Memoria
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-pulse-glow" />
          </div>
          <p className="text-muted-foreground text-lg">
            Encuentra todas las parejas en el menor número de movimientos
          </p>
        </div>

        {/* Stats and Controls */}
        <Card className="mb-8 p-6 bg-card/80 backdrop-blur-xl border-border/50 shadow-[var(--shadow-card)] animate-fade-in-up animation-delay-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <GameStats
              moves={moves}
              matches={matches}
              totalPairs={EMOJIS.length}
              time={formatTime(time)}
              bestScore={bestScore}
            />
            
            <Button
              onClick={initializeGame}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Nuevo Juego
            </Button>
          </div>
        </Card>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in-up animation-delay-400">
          {cards.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              index={index}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4 animate-fade-in-up animation-delay-600">
          {matches === EMOJIS.length && matches > 0 && (
            <Card className="p-6 bg-gradient-to-r from-success/20 to-primary/20 backdrop-blur-xl border-success/30 shadow-[var(--shadow-glow)] animate-bounce-in">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Trophy className="w-8 h-8 text-success animate-pulse-glow" />
                <h2 className="text-2xl font-bold text-success">
                  ¡Juego Completado!
                </h2>
                <Trophy className="w-8 h-8 text-success animate-pulse-glow" />
              </div>
              <p className="text-lg text-card-foreground">
                Tiempo: <span className="font-bold text-primary">{formatTime(time)}</span> • 
                Movimientos: <span className="font-bold text-primary">{moves}</span>
                {bestScore === moves && (
                  <span className="ml-2">
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-accent animate-pulse-glow">
                      ¡Nuevo Récord! 🏆
                    </Badge>
                  </span>
                )}
              </p>
            </Card>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-sm rounded-full border border-border/30">
              <Timer className="w-4 h-4" />
              <span>Tiempo: {formatTime(time)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-sm rounded-full border border-border/30">
              <Sparkles className="w-4 h-4" />
              <span>Progreso: {matches}/{EMOJIS.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

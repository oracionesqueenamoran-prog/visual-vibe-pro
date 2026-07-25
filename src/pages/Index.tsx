import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  RotateCcw,
  Trophy,
  Timer,
  User,
  Save,
  Medal,
} from "lucide-react";
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

export interface Score {
  name: string;
  moves: number;
  time: number;
  date: string;
}

const EMOJIS = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎸", "🎺", "🎻"];

const LEADERBOARD_KEY = "memoryGameLeaderboard";
const PLAYER_NAME_KEY = "memoryGamePlayerName";
const BEST_SCORE_KEY = "memoryGameBestScore";

const Index = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const leaderboardRef = useRef<Score[]>([]);
  const movesRef = useRef(moves);
  const timeRef = useRef(time);
  const finalMovesRef = useRef(moves);
  const finalTimeRef = useRef(time);

  useEffect(() => {
    leaderboardRef.current = leaderboard;
  }, [leaderboard]);

  useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const saveScore = useCallback(
    (name: string, moves: number, time: number) => {
      const newScore: Score = {
        name,
        moves,
        time,
        date: new Date().toISOString(),
      };
      const updated = [...leaderboardRef.current, newScore]
        .sort((a, b) => a.moves - b.moves || a.time - b.time)
        .slice(0, 10);
      setLeaderboard(updated);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      toast.success("Puntuación guardada", {
        description: `${name}: ${moves} movimientos en ${formatTime(time)}`,
      });
    },
    []
  );

  useEffect(() => {
    initializeGame();
    const saved = localStorage.getItem(BEST_SCORE_KEY);
    if (saved) setBestScore(parseInt(saved));
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) setPlayerName(savedName);
    const savedScores = localStorage.getItem(LEADERBOARD_KEY);
    if (savedScores) setLeaderboard(JSON.parse(savedScores));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (matches === EMOJIS.length && matches > 0 && !gameCompleted) {
      setGameCompleted(true);
    }
  }, [matches, gameCompleted]);

  useEffect(() => {
    if (!gameCompleted) return;

    setIsPlaying(false);
    setShowConfetti(true);

    finalMovesRef.current = movesRef.current;
    finalTimeRef.current = timeRef.current;

    const finalMoves = finalMovesRef.current;

    if (!bestScore || finalMoves < bestScore) {
      setBestScore(finalMoves);
      localStorage.setItem(BEST_SCORE_KEY, finalMoves.toString());
      toast.success("🎉 ¡Nuevo récord! ¡Increíble!", {
        description: `Completado en ${finalMoves} movimientos`,
      });
    } else {
      toast.success("🎊 ¡Felicidades! ¡Lo lograste!", {
        description: `Completado en ${finalMoves} movimientos`,
      });
    }

    if (!scoreSaved) {
      if (playerName.trim()) {
        saveScore(playerName.trim(), finalMovesRef.current, finalTimeRef.current);
        setScoreSaved(true);
      } else {
        setShowSaveForm(true);
      }
    }

    setTimeout(() => setShowConfetti(false), 5000);
  }, [gameCompleted, bestScore, playerName, scoreSaved, saveScore]);

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
    setGameCompleted(false);
    setScoreSaved(false);
    setShowSaveForm(false);
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

  const handleNameChange = (value: string) => {
    setPlayerName(value);
    localStorage.setItem(PLAYER_NAME_KEY, value.trim());
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) return;
    saveScore(name, finalMovesRef.current, finalTimeRef.current);
    setScoreSaved(true);
    setShowSaveForm(false);
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
          <p className="text-muted-foreground text-lg mb-4">
            Encuentra todas las parejas en el menor número de movimientos
          </p>
          <div className="flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <Input
              placeholder="Escribe tu nombre"
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="max-w-[220px] bg-card/80 backdrop-blur-xl border-border/50"
            />
          </div>
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

              {showSaveForm ? (
                <form
                  onSubmit={handleSaveScore}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4"
                >
                  <Input
                    placeholder="Tu nombre"
                    value={playerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="max-w-[220px] bg-card/80 backdrop-blur-xl border-border/50"
                  />
                  <Button
                    type="submit"
                    disabled={!playerName.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar puntuación
                  </Button>
                </form>
              ) : (
                scoreSaved && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Puntuación guardada para <span className="font-medium text-primary">{playerName}</span>
                  </p>
                )
              )}
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

        {/* Leaderboard */}
        <Card className="mt-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-[var(--shadow-card)] animate-fade-in-up animation-delay-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-primary" />
              Tabla de puntuaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-center">
                No hay puntuaciones guardadas todavía. Completa una partida y guarda tu nombre.
              </p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((score, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-card/60 rounded-xl border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium text-card-foreground">
                        {score.name}
                      </span>
                      {index === 0 && (
                        <Medal className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{score.moves} movimientos</span>
                      <span>{formatTime(score.time)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

import { useState, useEffect, useRef, useCallback } from "react";

const CELL_SIZE = 20;
const WIDTH = 400;
const HEIGHT = 400;
const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [directionChanged, setDirectionChanged] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const moveInterval = useRef(null);
  const boardRef = useRef(null); // Ref para centrar el tablero

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setStatsLoaded(true);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const idUsuario = user.id;

      fetch(`/api/statsSnake/${idUsuario}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener las estadísticas");
          return res.json();
        })
        .then((data) => {
          const highScore = Number(data.high_score) || 0;
          const played = Number(data.games_played) || 0;

          setBestScore(highScore);
          setGamesPlayed(played);

          setStatsLoaded(true);
        })
        .catch(() => {
          setStatsLoaded(true);
        });
    } catch {
      setStatsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!gameOver || !statsLoaded || statsSaved) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const idUsuario = user.id;

      fetch(`/api/statsSnake/${idUsuario}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          highScore: bestScore,
          gamesPlayed: gamesPlayed + 1,
        }),
      })
        .then(() => {
          console.log("Estadísticas guardadas correctamente");
          setGamesPlayed((g) => g + 1);
          setStatsSaved(true);
        })
        .catch((error) => {
          console.error("Error al guardar la estadística:", error);
        });
    } catch (e) {
      console.error("Error al parsear user en localStorage:", e);
    }
  }, [gameOver, statsLoaded, statsSaved, bestScore, gamesPlayed]);

  const onGameOver = useCallback(() => {
    setGameOver(true);
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore]);

  const generateFood = useCallback((snakePositions) => {
    let newFood;
    let isOnSnake = true;

    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * (WIDTH / CELL_SIZE)),
        y: Math.floor(Math.random() * (HEIGHT / CELL_SIZE)),
      };
      isOnSnake = snakePositions.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }

    setFood(newFood);
  }, []);

  useEffect(() => {
    if (gameOver || !gameStarted) {
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
      }
      return;
    }

    moveInterval.current = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= WIDTH / CELL_SIZE ||
          newHead.y < 0 ||
          newHead.y >= HEIGHT / CELL_SIZE
        ) {
          onGameOver();
          return prevSnake;
        }

        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          onGameOver();
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        setDirectionChanged(false);
        return newSnake;
      });
    }, 150);

    return () => clearInterval(moveInterval.current);
  }, [direction, food, gameOver, onGameOver, generateFood, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;

      const newDir = DIRECTIONS[e.key];
      if (!newDir) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (directionChanged) return;

      if (
        (direction.x === -newDir.x && direction.y === 0) ||
        (direction.y === -newDir.y && direction.x === 0)
      ) {
        return;
      }

      setDirection(newDir);
      setDirectionChanged(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, directionChanged, gameStarted]);

  useEffect(() => {
    if (gameStarted && boardRef.current) {
      boardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [gameStarted]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.ArrowRight);
    setFood({ x: 15, y: 10 });
    setScore(0);
    setGameOver(false);
    setDirectionChanged(false);
    setStatsSaved(false);
    setGameStarted(true);
  };

  return (
    <div className="snake-container" style={{ userSelect: "none" }}>
      <h2>Snake</h2>
      <div className="snake-scoreboard">
        <p>Score: {score}</p>
        <p>Best Score: {bestScore}</p>
        <p>Games Played: {gamesPlayed}</p>
        {gameOver && <p style={{ color: "red" }}>Game Over</p>}
        {!gameStarted && (
          <button onClick={startGame}>Empezar partida</button>
        )}
        {gameOver && (
          <button onClick={startGame}>Volver a jugar</button>
        )}
      </div>
      {gameStarted && (
        <div
          ref={boardRef}
          className="snake-board"
          style={{
            width: WIDTH,
            height: HEIGHT,
            backgroundColor: "#eee",
            position: "relative",
            margin: "0 auto",
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="snake-segment"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                backgroundColor: index === 0 ? "#16a085" : "#27ae60",
                position: "absolute",
                animation: index === 0 ? "snakeMove 0.5s infinite" : "none",
              }}
            />
          ))}
          <div
            className="snake-fruit"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              backgroundColor: "#c0392b",
              position: "absolute",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SnakeGame;

import React, { useState, useEffect, useRef } from "react";

const GRAVITY = 0.4;
const JUMP_HEIGHT = -10;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_GAP = 175;
const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const DUCK_SIZE = 20;
const OBSTACLE_SPEED = 4;

const randomObstacleHeight = () =>
  Math.floor(Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100)) + 50;

const FlappyDuck = () => {
  const [duckY, setDuckY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([
    { x: GAME_WIDTH, height: randomObstacleHeight(), passed: false },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameRef = useRef();

  useEffect(() => {
    if (gameOver) return;

    const handle = setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setDuckY((y) => {
        const newY = y + velocity;
        if (newY + DUCK_SIZE > GAME_HEIGHT) {
          setGameOver(true);
          return GAME_HEIGHT - DUCK_SIZE;
        }
        if (newY < 0) {
          return 0;
        }
        return newY;
      });
    }, 20);

    return () => clearInterval(handle);
  }, [velocity, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const handle = setInterval(() => {
      setObstacles((obs) => {
        let newObs = obs
          .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
          .filter((o) => o.x + OBSTACLE_WIDTH > 0);

        if (
          newObs.length === 0 ||
          newObs[newObs.length - 1].x < GAME_WIDTH - 200
        ) {
          newObs.push({
            x: GAME_WIDTH,
            height: randomObstacleHeight(),
            passed: false,
          });
        }

        return newObs;
      });
    }, 20);

    return () => clearInterval(handle);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    setObstacles((prevObstacles) =>
      prevObstacles.map((obs) => {
        const duckLeft = 50;
        const duckRight = duckLeft + DUCK_SIZE;
        const duckTop = duckY;
        const duckBottom = duckY + DUCK_SIZE;

        const obstacleLeft = obs.x;
        const obstacleRight = obs.x + OBSTACLE_WIDTH;

        const upperPipeBottom = obs.height;
        const lowerPipeTop = obs.height + OBSTACLE_GAP;

        // Colisión
        if (
          duckRight > obstacleLeft &&
          duckLeft < obstacleRight &&
          (duckTop < upperPipeBottom || duckBottom > lowerPipeTop)
        ) {
          setGameOver(true);
        }

        // Puntuación
        if (!obs.passed && obstacleRight < duckLeft) {
          setScore((s) => s + 1);
          return { ...obs, passed: true };
        }

        return obs;
      })
    );
  }, [duckY, obstacles, gameOver]);

  const handleJump = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    setVelocity(JUMP_HEIGHT);
  };

  const resetGame = () => {
    setDuckY(GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([
      { x: GAME_WIDTH, height: randomObstacleHeight(), passed: false },
    ]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      onClick={handleJump}
      onKeyDown={(e) => {
        if (e.code === "Space") {
          e.preventDefault();
          handleJump();
        }
      }}
      className="flappyDuck_gameContainer"
    >
      <div
        className="flappyDuck_duck"
        style={{
          top: duckY,
          left: 50,
          width: DUCK_SIZE,
          height: DUCK_SIZE,
          position: "absolute",
        }}
        aria-label="Flappy Duck"
      />

      {obstacles.map(({ x, height }, i) => (
        <React.Fragment key={i}>
          <div
            className="flappyDuck_obstacleUpper"
            style={{
              left: x,
              height: height,
              width: OBSTACLE_WIDTH,
              position: "absolute",
              top: 0,
            }}
          />
          <div
            className="flappyDuck_obstacleLower"
            style={{
              left: x,
              top: height + OBSTACLE_GAP,
              height: GAME_HEIGHT - (height + OBSTACLE_GAP),
              width: OBSTACLE_WIDTH,
              position: "absolute",
            }}
          />
        </React.Fragment>
      ))}

      <div className="flappyDuck_score">Score: {score}</div>

      {gameOver && (
        <div className="flappyDuck_gameOver">
          Game Over <br />
          <button className="flappyDuck_restartButton" onClick={resetGame}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default FlappyDuck;

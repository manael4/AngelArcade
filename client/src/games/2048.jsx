import React, { useState, useEffect } from "react";

const SIZE = 4;

const getEmptyGrid = () =>
  Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(null));

const cloneGrid = (grid) => grid.map((row) => row.slice());

const getRandomInt = (max) => Math.floor(Math.random() * max);

const addRandomTile = (grid) => {
  const emptyPositions = [];
  grid.forEach((row, r) =>
    row.forEach((tile, c) => {
      if (!tile) emptyPositions.push({ r, c });
    })
  );
  if (emptyPositions.length === 0) return grid;

  const pos = emptyPositions[getRandomInt(emptyPositions.length)];
  const newGrid = cloneGrid(grid);
  newGrid[pos.r][pos.c] = {
    id: Date.now() + Math.random(),
    value: Math.random() < 0.9 ? 2 : 4,
    merged: false,
  };
  return newGrid;
};

const gridsEqual = (a, b) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!a[r][c] && !b[r][c]) continue;
      if (!a[r][c] || !b[r][c]) return false;
      if (a[r][c].value !== b[r][c].value) return false;
      if (a[r][c].id !== b[r][c].id) return false;
    }
  }
  return true;
};

const canMove = (grid) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = grid[r][c];
      if (!tile) return true;
      if (
        c + 1 < SIZE &&
        grid[r][c + 1] &&
        grid[r][c + 1].value === tile.value
      )
        return true;
      if (
        r + 1 < SIZE &&
        grid[r + 1][c] &&
        grid[r + 1][c].value === tile.value
      )
        return true;
    }
  }
  return false;
};

const transpose = (matrix) =>
  matrix[0].map((_, i) => matrix.map((row) => row[i]));

const slideAndCombine = (row) => {
  let arr = row.filter((tile) => tile !== null);
  let points = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (
      arr[i].value === arr[i + 1].value &&
      !arr[i].merged &&
      !arr[i + 1].merged
    ) {
      arr[i] = {
        id: Date.now() + Math.random(),
        value: arr[i].value * 2,
        merged: true,
      };
      points += arr[i].value;
      arr.splice(i + 1, 1);
      arr[i].merged = true;
    }
  }
  while (arr.length < SIZE) arr.push(null);
  return { newRow: arr, points };
};

const resetMerged = (grid) => {
  return grid.map((row) =>
    row.map((tile) => (tile ? { ...tile, merged: false } : null))
  );
};

const Game2048 = () => {
  const [grid, setGrid] = useState(() =>
    addRandomTile(addRandomTile(getEmptyGrid()))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [moving, setMoving] = useState(false);

  // Obtener userId de localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || null;

  // Obtener la mejor puntuación al montar componente
  useEffect(() => {
    if (!userId) return;

    const fetchBestScore = async () => {
      try {
        const res = await fetch(`/api/stats2048/${userId}`);
        if (!res.ok) throw new Error("Error al obtener estadísticas");
        const data = await res.json();
        setBestScore(data.best_score || 0);
      } catch (error) {
        console.error("Fetch best score error:", error);
      }
    };

    fetchBestScore();
  }, [userId]);

  // Actualizar la mejor puntuación si la nueva es mayor
  useEffect(() => {
    if (!userId) return;
    if (score <= bestScore) return;

    const updateBestScore = async (newScore) => {
      try {
        const res = await fetch(`/api/stats2048/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ best_score: newScore }),
        });
        if (!res.ok) throw new Error("Error al actualizar mejor puntuación");
        const data = await res.json();
        setBestScore(data.best_score);
      } catch (error) {
        console.error("Update best score error:", error);
      }
    };

    updateBestScore(score);
  }, [score, bestScore, userId]);

  const move = (direction) => {
    if (gameOver || moving) return;

    setMoving(true);

    let rotated = false,
      reversed = false;
    let newGrid;

    switch (direction) {
      case "up":
        newGrid = transpose(grid);
        rotated = true;
        break;
      case "down":
        newGrid = transpose(grid).map((row) => row.slice().reverse());
        rotated = true;
        reversed = true;
        break;
      case "left":
        newGrid = cloneGrid(grid);
        break;
      case "right":
        newGrid = grid.map((row) => row.slice().reverse());
        reversed = true;
        break;
      default:
        setMoving(false);
        return;
    }

    let movedGrid = [];
    let totalPoints = 0;
    for (let row of newGrid) {
      const { newRow, points } = slideAndCombine(row);
      totalPoints += points;
      movedGrid.push(newRow);
    }

    if (reversed) movedGrid = movedGrid.map((row) => row.slice().reverse());
    if (rotated) movedGrid = transpose(movedGrid);

    movedGrid = resetMerged(movedGrid);

    if (gridsEqual(grid, movedGrid)) {
      setMoving(false);
      return;
    }

    setGrid(movedGrid);
    setScore((prev) => prev + totalPoints);

    setTimeout(() => {
      setGrid(addRandomTile(movedGrid));
      setMoving(false);
    }, 180);
  };

  const resetGame = () => {
    setGrid(addRandomTile(addRandomTile(getEmptyGrid())));
    setScore(0);
    setGameOver(false);
    setMoving(false);
  };

  useEffect(() => {
    if (!canMove(grid)) setGameOver(true);
  }, [grid]);

  const renderTiles = () => {
    let tiles = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const tile = grid[r][c];
        if (!tile) continue;

        tiles.push(
          <div
            key={tile.id}
            className={`game2048-tile game2048-tile-${tile.value} ${
              tile.value <= 4 ? "game2048-tile--light" : "game2048-tile--dark"
            } ${tile.merged ? "pop" : ""}`}
            style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
          >
            {tile.value}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div
      className="game2048-container"
      tabIndex={0}
      onKeyDown={(e) => {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            move("up");
            break;
          case "ArrowDown":
            e.preventDefault();
            move("down");
            break;
          case "ArrowLeft":
            e.preventDefault();
            move("left");
            break;
          case "ArrowRight":
            e.preventDefault();
            move("right");
            break;
          default:
            break;
        }
      }}
    >
      <h2 className="game2048-title">Juego 2048</h2>
      <div className="game2048-score">
        Puntuación: {score} | Mejor: {bestScore}
      </div>
      <div className="game2048-grid">
        {[...Array(SIZE * SIZE)].map((_, i) => (
          <div key={i} className="game2048-tile-bg" />
        ))}
        {renderTiles()}
      </div>
      <button className="game2048-button" onClick={resetGame}>
        Reiniciar Juego
      </button>
      {gameOver && (
        <div className="game2048-gameover">
          ¡Juego terminado! No hay más movimientos.
        </div>
      )}
      <div className="game2048-instructions">
        Usa las flechas del teclado para mover las fichas y combinarlas.
      </div>
    </div>
  );
};

export default Game2048;

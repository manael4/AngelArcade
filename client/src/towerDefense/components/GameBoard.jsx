// src/components/GameBoard.jsx
import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import Enemy from "./Enemy";
import Tower from "./Tower";
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, PATH } from "../utils/constants";

const GameBoard = () => {
  const { towers, enemies, addTower, selectedTowerType, setSelectedTowerType, waveInProgress, gameOver, gameWon } =
    useContext(GameContext);

  const handleMapClick = (e) => {
    if (!selectedTowerType || waveInProgress || gameOver || gameWon) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    // Verificar que la posición no esté en el camino
    if (PATH.some((p) => p.x === x && p.y === y)) {
      alert("No puedes colocar torres sobre el camino");
      return;
    }

    // Verificar que no haya torre ya ahí
    if (towers.some((t) => t.position.x === x && t.position.y === y)) {
      alert("Ya hay una torre en esa posición");
      return;
    }

    // Añadir torre
    const success = addTower(selectedTowerType, { x, y });
    if (success) {
      setSelectedTowerType(null);
    } else {
      alert("No tienes suficientes recursos para construir esa torre");
    }
  };

  return (
    <div
      onClick={handleMapClick}
      style={{
        width: MAP_WIDTH * TILE_SIZE,
        height: MAP_HEIGHT * TILE_SIZE,
        border: "2px solid #333",
        position: "relative",
        backgroundColor: "#88b04b",
        margin: "0 auto",
        userSelect: "none",
      }}
    >
      {/* Renderizar camino */}
      {PATH.map((pos, i) => (
        <div
          key={`path-${i}`}
          style={{
            position: "absolute",
            left: pos.x * TILE_SIZE,
            top: pos.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundColor: "#b99e3b",
            border: "1px solid #777",
            boxSizing: "border-box",
          }}
        />
      ))}

      {/* Renderizar torres */}
      {towers.map((tower) => (
        <Tower key={tower.id} tower={tower} />
      ))}

      {/* Renderizar enemigos */}
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </div>
  );
};

export default GameBoard;

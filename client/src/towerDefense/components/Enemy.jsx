// src/components/Enemy.jsx
import { TILE_SIZE } from "../utils/constants";
import { useGameLogic } from "../hooks/useGameLogic";

const Enemy = ({ enemy }) => {
  const { calculateEnemyPosition } = useGameLogic();
  const pos = calculateEnemyPosition(enemy);

  // Barra de vida
  const healthPercent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: TILE_SIZE - 8,
        height: TILE_SIZE - 8,
        backgroundColor: enemy.type === "boss" ? "purple" : "black",
        borderRadius: 6,
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      <div
        style={{
          height: 5,
          backgroundColor: "red",
          width: `${healthPercent}%`,
          borderRadius: "4px 0 0 4px",
        }}
      />
    </div>
  );
};

export default Enemy;

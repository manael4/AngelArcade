import { useContext, useEffect, useRef, useState } from "react";
import { TILE_SIZE, TOWER_TYPES } from "../utils/constants";
import { GameContext } from "../context/GameContext";

const colors = {
  archer: "red",
  slow: "blue",
  explosive: "brown",
  fast: "orange",
  lethal: "green",
};

const icons = {
  archer: "🏹",
  slow: "❄️",
  explosive: "💣",
  fast: "⚡",
  lethal: "☠️",
};

const Tower = ({ tower }) => {
  const { position, type, level, id } = tower;
  const { upgradeTower, resources } = useContext(GameContext);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const towerRef = useRef(null);

  const towerStats = TOWER_TYPES[type];
  const upgradeCost = Math.floor(towerStats.cost * (0.8 + 0.4 * (level - 1)));
  const canAfford = resources >= upgradeCost;

  const handleClick = (e) => {
    e.stopPropagation();
    setShowUpgrade(!showUpgrade);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (towerRef.current && !towerRef.current.contains(e.target)) {
        setShowUpgrade(false);
      }
    };

    if (showUpgrade) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUpgrade]);

  const baseDamage = towerStats.damage;
  const currentDamage = Math.floor(baseDamage + baseDamage * 0.5 * (level - 1));
  const nextDamage = Math.floor(baseDamage + baseDamage * 0.5 * level);

  return (
    <>
      <div
        ref={towerRef}
        onClick={handleClick}
        style={{
          position: "absolute",
          left: position.x * TILE_SIZE,
          top: position.y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          backgroundColor: colors[type],
          borderRadius: 8,
          border: "2px solid black",
          cursor: "pointer",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 24,
          userSelect: "none",
        }}
        title={`${towerStats.name} (Nivel ${level}) - ${towerStats.description}`}
      >
        {icons[type]}
      </div>

      {showUpgrade && (
        <div
          style={{
            position: "absolute",
            left: position.x * TILE_SIZE,
            top: position.y * TILE_SIZE + TILE_SIZE,
            backgroundColor: "#222",
            color: "white",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            zIndex: 10,
            minWidth: 140,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <strong>
              {level < 5
                ? `Mejora (Nivel ${level} → ${level + 1})`
                : `Nivel máximo (Nivel ${level})`}
            </strong>
          </div>
          <div>🗡️ Daño: {currentDamage}{level < 5 ? ` → ${nextDamage}` : ""}</div>
          <div>🎯 Rango: {towerStats.range}</div>
          <div>⚡ Velocidad: {towerStats.fireRate}ms</div>

          {level < 5 && (
            <>
              <div style={{ margin: "6px 0" }}>
                💰 Coste: {upgradeCost} monedas
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAfford) {
                    upgradeTower(id);
                    setShowUpgrade(false);
                  }
                }}
                disabled={!canAfford}
                style={{
                  backgroundColor: "#444",
                  color: "white",
                  borderRadius: 4,
                  padding: "4px 6px",
                  cursor: canAfford ? "pointer" : "not-allowed",
                  width: "100%",
                  textDecoration: canAfford ? "none" : "line-through",
                  opacity: canAfford ? 1 : 0.5,
                }}
              >
                Mejorar
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Tower;

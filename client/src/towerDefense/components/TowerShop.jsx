import { useContext, useEffect } from "react";
import { GameContext } from "../context/GameContext";
import { TOWER_TYPES } from "../utils/constants";

const TowerShop = () => {
  const { selectedTowerType, setSelectedTowerType, resources } = useContext(GameContext);

  useEffect(() => {
    if (selectedTowerType) {
      const towerCost = TOWER_TYPES[selectedTowerType]?.cost || Infinity;
      if (resources < towerCost) {
        setSelectedTowerType(null);
      }
    }
  }, [selectedTowerType, resources, setSelectedTowerType]);

  return (
    <div
      style={{
        margin: "10px auto",
        width: 600,
        display: "flex",
        justifyContent: "space-around",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {Object.entries(TOWER_TYPES).map(([key, tower]) => (
        <button
          key={key}
          disabled={resources < tower.cost}
          onClick={() => setSelectedTowerType(key)}
          style={{
            backgroundColor: selectedTowerType === key ? "#4CAF50" : "#ddd",
            border: "1px solid #888",
            borderRadius: 6,
            padding: "10px 15px",
            cursor: resources < tower.cost ? "not-allowed" : "pointer",
            userSelect: "none",
          }}
          title={`${tower.name}\nCosto: ${tower.cost}\nDaño: ${tower.damage}\nRango: ${tower.range}\nVelocidad: ${tower.fireRate} ms\n${tower.description}`}
        >
          {tower.name} (${tower.cost})
        </button>
      ))}
    </div>
  );
};

export default TowerShop;

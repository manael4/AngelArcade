// TowerDefenseGame.jsx
import { GameProvider } from "./context/GameContext";
import GameBoard from "./components/GameBoard";
import HUD from "./components/HUD";
import TowerShop from "./components/TowerShop";
import { useGameLogic } from "./hooks/useGameLogic";

const TowerDefenseGame = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

const GameContent = () => {
  useGameLogic();

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h1>Tower Defense React</h1>
      <HUD />
      <TowerShop />
      <GameBoard />
    </div>
  );
};

export default TowerDefenseGame;

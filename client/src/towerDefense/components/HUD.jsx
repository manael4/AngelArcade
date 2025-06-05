// src/components/HUD.jsx
import { useContext } from "react";
import { GameContext } from "../context/GameContext";

const HUD = () => {
  const { lives, resources, currentWave, nextWave, gameOver, gameWon, resetGame } =
    useContext(GameContext);

  return (
    <div
      style={{
        margin: "15px auto",
        width: 600,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>Vidas: {lives}</div>
      <div>Recursos: {resources}</div>
      <div>Oleada: {currentWave}</div>
      <div>
        {!gameOver && !gameWon && (
          <button onClick={nextWave} style={{ cursor: "pointer", padding: "4px 10px" }}>
            Siguiente Oleada
          </button>
        )}
        {(gameOver || gameWon) && (
          <button onClick={resetGame} style={{ cursor: "pointer", padding: "4px 10px" }}>
            Reiniciar Juego
          </button>
        )}
      </div>
      {(gameOver || gameWon) && (
        <div style={{ color: gameWon ? "green" : "red", fontSize: 20, fontWeight: "bold" }}>
          {gameWon ? "¡Has ganado!" : "¡Has perdido!"}
        </div>
      )}
    </div>
  );
};

export default HUD;

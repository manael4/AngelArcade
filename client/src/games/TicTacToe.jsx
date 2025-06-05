import { useState, useEffect, useCallback } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0, Empates: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Debug userId
  console.log("user from localStorage:", user);
  console.log("userId:", userId);

  const cargarStats = useCallback(async () => {
    if (!userId) {
      setLoadingStats(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/statsTicTacToe/${userId}`);
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setScore({
        X: data.winsX || 0,
        O: data.winsO || 0,
        Empates: data.draws || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStats(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  const actualizarStats = async (resultado) => {
    if (!userId) return;

    let url = "";
    switch (resultado) {
      case "X":
        url = `http://localhost:3001/api/statsTicTacToe/winsX/${userId}`;
        break;
      case "O":
        url = `http://localhost:3001/api/statsTicTacToe/winsO/${userId}`;
        break;
      case "Empate":
        url = `http://localhost:3001/api/statsTicTacToe/draws/${userId}`;
        break;
      default:
        return;
    }

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al actualizar estadísticas");
      const data = await res.json();

      // Actualizar el estado local con la respuesta real del backend
      setScore({
        X: data.winsX || score.X,
        O: data.winsO || score.O,
        Empates: data.draws || score.Empates,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const checkWinner = (updatedBoard) => {
    const combos = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6],
    ];

    for (const [a,b,c] of combos) {
      if (updatedBoard[a] && updatedBoard[a] === updatedBoard[b] && updatedBoard[a] === updatedBoard[c]) {
        return updatedBoard[a];
      }
    }
    if (!updatedBoard.includes(null)) return 'Empate';
    return null;
  };

  const handleClick = async (index) => {
    if (board[index] || winner || loadingStats) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);

      // Actualizamos las estadísticas en el backend (el backend devolverá el conteo actualizado)
      await actualizarStats(result);
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
  };

  return (
    <div className="tictactoe-container">
      <div>
        <h2>Juego: Tres en Raya</h2>
        <div className="tictactoe-board">
          {board.map((cell, index) => (
            <div 
              key={index} 
              className={`tictactoe-cell ${cell === 'X' ? 'tictactoe-x' : cell === 'O' ? 'tictactoe-o' : ''}`} 
              onClick={() => handleClick(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        {winner && (
          <div className="tictactoe-result">
            {winner === 'Empate' ? '¡Empate!' : `¡Ganó ${winner}!`}
            <button onClick={resetGame}>Jugar otra vez</button>
          </div>
        )}
      </div>

      <div className="tictactoe-scoreboard">
        <h3>Marcador</h3>
        <p>🟦 X: {score.X}</p>
        <p>🟥 O: {score.O}</p>
        <p>⚪ Empates: {score.Empates}</p>
      </div>
    </div>
  );
};

export default TicTacToe;

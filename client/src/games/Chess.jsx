import { useState, useEffect } from "react";

const initialBoard = () => {
  const emptyRow = Array(8).fill(null);
  const board = Array(8).fill(null).map(() => [...emptyRow]);

  const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  const frontRank = Array(8).fill("pawn");

  board[0] = backRank.map((type) => ({ type, color: "black", hasMoved: false }));
  board[1] = frontRank.map((type) => ({ type, color: "black", hasMoved: false }));
  board[6] = frontRank.map((type) => ({ type, color: "white", hasMoved: false }));
  board[7] = backRank.map((type) => ({ type, color: "white", hasMoved: false }));

  return board;
};

const pieceEmojis = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const ChessPiece = ({ piece }) => {
  if (!piece) return null;
  const { type, color } = piece;

  return (
    <span>{pieceEmojis[color][type]}</span>
  );
};

const isLegalMove = (board, fromRow, fromCol, toRow, toCol, piece, turn) => {
  if (!piece || piece.color !== turn) return false;
  const dx = toCol - fromCol;
  const dy = toRow - fromRow;
  const dest = board[toRow][toCol];
  if (dest && dest.color === piece.color) return false;

  switch (piece.type) {
    case "pawn": {
      const dir = piece.color === "white" ? -1 : 1;
      const startRow = piece.color === "white" ? 6 : 1;
      if (dx === 0 && !dest) {
        if (dy === dir) return true;
        if (dy === 2 * dir && fromRow === startRow && !board[fromRow + dir][fromCol]) return true;
      }
      if (Math.abs(dx) === 1 && dy === dir && dest && dest.color !== piece.color) return true;
      return false;
    }
    case "rook": {
      if (dx !== 0 && dy !== 0) return false;
      const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
      const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
      for (let i = 1; i < Math.max(Math.abs(dx), Math.abs(dy)); i++) {
        if (board[fromRow + i * stepY][fromCol + i * stepX]) return false;
      }
      return true;
    }
    case "knight":
      return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    case "bishop": {
      if (Math.abs(dx) !== Math.abs(dy)) return false;
      const stepX = dx / Math.abs(dx);
      const stepY = dy / Math.abs(dy);
      for (let i = 1; i < Math.abs(dx); i++) {
        if (board[fromRow + i * stepY][fromCol + i * stepX]) return false;
      }
      return true;
    }
    case "queen": {
      if (dx === 0 || dy === 0) return isLegalMove(board, fromRow, fromCol, toRow, toCol, { ...piece, type: "rook" }, turn);
      if (Math.abs(dx) === Math.abs(dy)) return isLegalMove(board, fromRow, fromCol, toRow, toCol, { ...piece, type: "bishop" }, turn);
      return false;
    }
    case "king":
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default:
      return false;
  }
};

const getLegalMoves = (board, row, col, piece, turn) => {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isLegalMove(board, row, col, r, c, piece, turn)) {
        moves.push(`${r}-${c}`);
      }
    }
  }
  return moves;
};

const ChessGame = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ white: 0, black: 0 });

  // Cargar stats al montar el componente
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const idUsuario = user.id;

      fetch(`http://localhost:3001/api/statsChess/${idUsuario}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener las estadísticas");
          return res.json();
        })
        .then((data) => {
          setScore({
            white: data.wins_white || 0,
            black: data.wins_black || 0,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (e) {
      console.error("Error al parsear user en localStorage:", e);
    }
  }, []);

  // Enviar score actualizado a la API cada vez que cambie
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const idUsuario = user.id;

      fetch(`/api/statsChess/${idUsuario}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wins_white: score.white,
          wins_black: score.black,
        }),
      }).catch((error) => {
        console.error("Error al guardar la estadística:", error);
      });
    } catch (e) {
      console.error("Error al parsear user en localStorage:", e);
    }
  }, [score]);

  const handleSquareClick = (row, col) => {
    if (winner) return;
    const piece = board[row][col];

    if (selected) {
      const [fromRow, fromCol] = selected;
      const movingPiece = board[fromRow][fromCol];
      if (
        (fromRow !== row || fromCol !== col) &&
        isLegalMove(board, fromRow, fromCol, row, col, movingPiece, turn)
      ) {
        movePiece(fromRow, fromCol, row, col);
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      setSelected(null);
      setLegalMoves([]);
    } else if (piece && piece.color === turn) {
      setSelected([row, col]);
      setLegalMoves(getLegalMoves(board, row, col, piece, turn));
    }
  };

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map((row) => row.slice());
    const target = newBoard[toRow][toCol];

    if (target && target.type === "king") {
      setWinner(turn);
      setScore((prev) => ({
        ...prev,
        [turn]: prev[turn] + 1,
      }));
    }

    const movingPiece = { ...newBoard[fromRow][fromCol], hasMoved: true };
    newBoard[toRow][toCol] = movingPiece;
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelected(null);
    setTurn("white");
    setLegalMoves([]);
    setWinner(null);
  };

  return (
    <div className="chess_container" style={{ display: "flex", gap: "20px" }}>
      <div className="chess_score_panel">
        <div>Victorias:</div>
        <div>♔ Blancas: {score.white}</div>
        <div>♚ Negras: {score.black}</div>
        {winner && (
          <div className="chess_winner_message">
            ¡{winner === "white" ? "Blancas ♔" : "Negras ♚"} ganan!
          </div>
        )}
        <div className="chess_turn_indicator">
          Turno: {turn === "white" ? "Blancas ♔" : "Negras ♚"}
        </div>
        <button className="chess_button" onClick={resetGame}>Reiniciar</button>
      </div>

      <div>
        <div className="chess_board">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selected && selected[0] === rowIndex && selected[1] === colIndex;
              const isLegal = legalMoves.includes(`${rowIndex}-${colIndex}`);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  className={`chess_square ${isDark ? "chess_dark" : "chess_light"} ${isSelected ? "chess_selected" : ""} ${isLegal ? "chess_legal_move" : ""}`}
                >
                  <ChessPiece piece={piece} row={rowIndex} col={colIndex} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessGame;

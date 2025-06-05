import { useState, useEffect } from 'react';
import GameCard from './games/GameCard';
import TicTacToe from './games/TicTacToe';
import Snake from './games/Snake';
import Buscaminas from './games/Buscaminas';
import Solitario from './games/Solitario';
import TowerDefenseGame from './towerDefense/TowerDefenseGame';
import Memory from './games/Memory';
import Chess from './games/Chess';
import LoginRegister from './components/LoginRegister';
import Game2048 from './games/2048'; 
import GameStatsMenu from './components/GameStatsMenu'; 

const App = () => {
  const [user, setUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveGame(null);
  };

  const gameComponents = {
    tictactoe: <TicTacToe />,
    snake: <Snake />,
    buscaminas: <Buscaminas />,
    solitario: <Solitario />,
    towerDefense: <TowerDefenseGame />,
    memory: <Memory />,
    chess: <Chess />,
    game2048: <Game2048 />,
    stats: <GameStatsMenu user={user} />,  
  };

  const renderGame = () => {
    if (activeGame) {
      return gameComponents[activeGame];
    }

    return (
      <>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setActiveGame('stats')}
            className='stats_mainMenu'
          >
            Ver estadísticas
          </button>
        </div>
        <div className="main-game-list">
          <GameCard title="Tres en Raya" imageSrc="/images/TicTacToe.png" onClick={() => setActiveGame('tictactoe')} className="main-game-card" />
          <GameCard title="Snake" imageSrc="/images/Snake.png" onClick={() => setActiveGame('snake')} className="main-game-card" />
          <GameCard title="Buscaminas" imageSrc="/images/Buscaminas.png" onClick={() => setActiveGame('buscaminas')} className="main-game-card" />
          <GameCard title="Solitario" imageSrc="/images/Solitario.png" onClick={() => setActiveGame('solitario')} className="main-game-card" />
          <GameCard title="Memory" imageSrc="/images/Memory.png" onClick={() => setActiveGame('memory')} className="main-game-card" />
          <GameCard title="Tower Defense (desarrollo)" imageSrc="/images/Tower.png" onClick={() => setActiveGame('towerDefense')} className="main-game-card" />
          <GameCard title="Ajedrez" imageSrc="/images/Ajedrez.png" onClick={() => setActiveGame('chess')} className="main-game-card" />
          <GameCard title="2048" imageSrc="/images/2048.png" onClick={() => setActiveGame('game2048')} className="main-game-card" />
        </div>
      </>
    );
  };

  if (!user) {
    return <LoginRegister onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="main-container">
      <h1 className="main-title">Ángel Arcade: Minijuegos Web</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span>Bienvenido/a, {user.username}</span>
        <button className="main-logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
      {activeGame && (
        <button className="main-back-button" onClick={() => setActiveGame(null)}>Volver al menú</button>
      )}
      {renderGame()}
    </div>
  );
};

export default App;

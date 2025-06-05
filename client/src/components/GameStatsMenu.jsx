import { useEffect, useState } from 'react';

const TABS = ['Tic Tac Toe', '2048', 'Buscaminas', 'Ajedrez', 'Memory', 'Snake', 'Solitario'];

const GameStatsMenu = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState('Tic Tac Toe');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async (url) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
      }
    };

    switch (selectedTab) {
      case 'Tic Tac Toe':
        fetchStats(`/api/statsTicTacToe/${user.id}`);
        break;
      case '2048':
        fetchStats(`/api/stats2048/${user.id}`);
        break;
      case 'Buscaminas':
        fetchStats(`/api/statsBuscaminas/${user.id}`);
        break;
      case 'Ajedrez':
        fetchStats(`/api/statsChess/${user.id}`);
        break;
      case 'Memory':
        fetchStats(`/api/statsMemory/${user.id}`);
        break;
      case 'Snake':
        fetchStats(`/api/statsSnake/${user.id}`);
        break;
      case 'Solitario':
        fetchStats(`/api/statsSolitario/${user.id}`);
        break;
      default:
        break;
    }
  }, [selectedTab, user]);

  const renderTicTacToeStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Victorias X</th>
          <th>Victorias O</th>
          <th>Empates</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.winsX ?? 0}</td>
          <td>{stats.winsO ?? 0}</td>
          <td>{stats.draws ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );

  const render2048Stats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Puntuación Máxima</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.best_score ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderBuscaminasStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Dificultad</th>
          <th>Partidas Jugadas</th>
          <th>Victorias</th>
          <th>Mejor Tiempo (segundos)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Fácil</td>
          <td>{stats.easy_gamesPlayed ?? 0}</td>
          <td>{stats.easy_wins ?? 0}</td>
          <td>{stats.easy_fastestTime != null ? stats.easy_fastestTime : '-'}s</td>
        </tr>
        <tr>
          <td>Normal</td>
          <td>{stats.normal_gamesPlayed ?? 0}</td>
          <td>{stats.normal_wins ?? 0}</td>
          <td>{stats.normal_fastestTime != null ? stats.normal_fastestTime : '-'}s</td>
        </tr>
        <tr>
          <td>Difícil</td>
          <td>{stats.hard_gamesPlayed ?? 0}</td>
          <td>{stats.hard_wins ?? 0}</td>
          <td>{stats.hard_fastestTime != null ? stats.hard_fastestTime : '-'}s</td>
        </tr>
      </tbody>
    </table>
  );

  const renderChessStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Victorias Blancas</th>
          <th>Victorias Negras</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.wins_white ?? 0}</td>
          <td>{stats.wins_black ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderMemoryStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Partidas</th>
          <th>Mejor Tiempo</th>
          <th>Parejas Descubiertas</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.gamesPlayed ?? 0}</td>
          <td>{stats.bestScore ?? '-'}s</td>
          <td>{stats.pairsDiscovered ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderSnakeStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Partidas Jugadas</th>
          <th>Puntuación Máxima</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.games_played ?? 0}</td>
          <td>{stats.high_score ?? 0}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderSolitarioStats = () => (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Partidas</th>
          <th>Victorias</th>
          <th>Mejor Tiempo</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{stats.gamesPlayed ?? 0}</td>
          <td>{stats.wins ?? 0}</td>
          <td>{stats.bestTime ?? '-'}s</td>
        </tr>
      </tbody>
    </table>
  );

  const renderAchievements = () => {
  let achievements = [];

  switch (selectedTab) {
    case 'Tic Tac Toe':
      achievements = [
        { title: 'Ganar 1 partida con X', unlocked: (stats.winsX ?? 0) > 0},
        { title: 'Ganar 5 partidas con X', unlocked: (stats.winsX ?? 0) >= 5},
        { title: 'Ganar 10 partidas con X', unlocked: (stats.winsX ?? 0) >= 10},
        { title: 'Ganar 1 partida con O', unlocked: (stats.winsO ?? 0) > 0},
        { title: 'Ganar 5 partidas con O', unlocked: (stats.winsO ?? 0) >= 5},
        { title: 'Ganar 10 partidas con O', unlocked: (stats.winsO ?? 0) >= 10},
        { title: 'Empatar 1 partida', unlocked: (stats.draws ?? 0) >= 1},
        { title: 'Empatar 5 partidas', unlocked: (stats.draws ?? 0) >= 5},
        { title: 'Empatar 10 partidas', unlocked: (stats.draws ?? 0) >= 10},
        { title: 'Jugar 100 partidas', unlocked: ((stats.winsX ?? 0) + (stats.winsO ?? 0)) >= 100},
      ];
      break;

    case '2048':
      achievements = [
        { title: 'Alcanzar 512 puntos', unlocked: (stats.best_score ?? 0) >= 512},
        { title: 'Alcanzar 1024 puntos', unlocked: (stats.best_score ?? 0) >= 1024},
        { title: 'Alcanzar 2048 puntos', unlocked: (stats.best_score ?? 0) >= 2048},
        { title: 'Alcanzar 3072 puntos', unlocked: (stats.best_score ?? 0) >= 3072},
        { title: 'Alcanzar 4096 puntos', unlocked: (stats.best_score ?? 0) >= 4096},
      ];
      break;

    case 'Buscaminas':
      achievements = [
        { title: 'Ganar 1 partida fácil', unlocked: (stats.easy_wins ?? 0) >= 1},
        { title: 'Ganar 5 partidas fácil', unlocked: (stats.easy_wins ?? 0) >= 5},
        { title: 'Ganar 10 partidas fácil', unlocked: (stats.easy_wins ?? 0) >= 10},
        { title: 'Ganar 1 partida normal', unlocked: (stats.normal_wins ?? 0) >= 1},
        { title: 'Ganar 5 partidas normales', unlocked: (stats.normal_wins ?? 0) >= 5},
        { title: 'Ganar 10 partidas normales', unlocked: (stats.normal_wins ?? 0) >= 10},
        { title: 'Ganar 1 partida difícil', unlocked: (stats.hard_wins ?? 0) >= 1},
        { title: 'Ganar 5 partidas difíciles', unlocked: (stats.hard_wins ?? 0) >= 5},
        { title: 'Ganar 10 partidas difíciles', unlocked: (stats.hard_wins ?? 0) >= 10},
        // Para los tiempos, barra completa si cumple el tiempo, vacía si no, para simplificar:
        { title: 'Mejor tiempo fácil < 60s', unlocked: (stats.easy_fastestTime != null && stats.easy_fastestTime < 60)},
        { title: 'Mejor tiempo fácil < 30s', unlocked: (stats.easy_fastestTime != null && stats.easy_fastestTime < 30)},
        { title: 'Mejor tiempo normal < 200s', unlocked: (stats.normal_fastestTime != null && stats.normal_fastestTime < 200)},
        { title: 'Mejor tiempo normal < 120s', unlocked: (stats.normal_fastestTime != null && stats.normal_fastestTime < 120)},
        { title: 'Mejor tiempo difícil < 300s', unlocked: (stats.hard_fastestTime != null && stats.hard_fastestTime < 300)},
        { title: 'Mejor tiempo difícil < 180s', unlocked: (stats.hard_fastestTime != null && stats.hard_fastestTime < 180)},
      ];
      break;

    case 'Ajedrez':
      achievements = [
        { title: 'Ganar 1 partida con blancas', unlocked: (stats.wins_white ?? 0) >= 1},
        { title: 'Ganar 5 partidas con blancas', unlocked: (stats.wins_white ?? 0) >= 5},
        { title: 'Ganar 10 partidas con blancas', unlocked: (stats.wins_white ?? 0) >= 10},
        { title: 'Ganar 25 partidas con blancas', unlocked: (stats.wins_white ?? 0) >= 25},
        { title: 'Ganar 1 partida con negras', unlocked: (stats.wins_black ?? 0) >= 1},
        { title: 'Ganar 5 partidas con negras', unlocked: (stats.wins_black ?? 0) >= 5},
        { title: 'Ganar 10 partidas con negras', unlocked: (stats.wins_black ?? 0) >= 10},
        { title: 'Ganar 25 partidas con negras', unlocked: (stats.wins_black ?? 0) >= 25},
        { title: 'Ganar 1 partida', unlocked: ((stats.wins_white ?? 0) + (stats.wins_black ?? 0)) >= 1},
        { title: 'Ganar 10 partidas', unlocked: ((stats.wins_white ?? 0) + (stats.wins_black ?? 0)) >= 10},
        { title: 'Ganar 50 partidas', unlocked: ((stats.wins_white ?? 0) + (stats.wins_black ?? 0)) >= 50},
      ];
      break;

    case 'Memory':
      achievements = [
        { title: 'Jugar 1 partida', unlocked: (stats.gamesPlayed ?? 0) >= 1},
        { title: 'Jugar 10 partidas', unlocked: (stats.gamesPlayed ?? 0) >= 10},
        { title: 'Jugar 25 partidas', unlocked: (stats.gamesPlayed ?? 0) >= 25},
        { title: 'Jugar 100 partidas', unlocked: (stats.gamesPlayed ?? 0) >= 100},
        { title: 'Descubrir 10 parejas', unlocked: (stats.pairsDiscovered ?? 0) >= 10},
        { title: 'Descubrir 100 parejas', unlocked: (stats.pairsDiscovered ?? 0) >= 100},
        { title: 'Descubrir 250 parejas', unlocked: (stats.pairsDiscovered ?? 0) >= 250},
        { title: 'Descubrir 500 parejas', unlocked: (stats.pairsDiscovered ?? 0) >= 500},
        // Para los tiempos, barras llenas si cumple el tiempo, vacías si no
        { title: 'Mejor tiempo < 120s', unlocked: (stats.bestScore != null && stats.bestScore < 120)},
        { title: 'Mejor tiempo < 90s', unlocked: (stats.bestScore != null && stats.bestScore < 90)},
        { title: 'Mejor tiempo < 60s', unlocked: (stats.bestScore != null && stats.bestScore < 60)},
        { title: 'Mejor tiempo < 30s', unlocked: (stats.bestScore != null && stats.bestScore < 30)},
      ];
      break;

    case 'Snake':
      achievements = [
        { title: 'Jugar 1 partida', unlocked: (stats.games_played ?? 0) >= 1},
        { title: 'Jugar 10 partidas', unlocked: (stats.games_played ?? 0) >= 10},
        { title: 'Jugar 25 partidas', unlocked: (stats.games_played ?? 0) >= 25},
        { title: 'Jugar 100 partidas', unlocked: (stats.games_played ?? 0) >= 10},
        { title: 'Conseguir una puntuación máxima de 10', unlocked: (stats.high_score ?? 0) >= 10},
        { title: 'Conseguir una puntuación máxima de 25', unlocked: (stats.high_score ?? 0) >= 25},
        { title: 'Conseguir una puntuación máxima de 50', unlocked: (stats.high_score ?? 0) >= 50},
        { title: 'Conseguir una puntuación máxima de 100', unlocked: (stats.high_score ?? 0) >= 100},
      ];
      break;

    case 'Solitario':
      achievements = [
        { title: 'Completar 1 partida', unlocked: (stats.wins ?? 0) >= 1},
        { title: 'Completar 10 partidas', unlocked: (stats.wins ?? 0) >= 10},
        { title: 'Completar 25 partidas', unlocked: (stats.wins ?? 0) >= 25},
        // Para tiempos, barra llena si está por debajo del tiempo, vacía si no
        { title: 'Mejor tiempo < 300s', unlocked: (stats.bestTime != null && stats.bestTime < 300)},
        { title: 'Mejor tiempo < 240s', unlocked: (stats.bestTime != null && stats.bestTime < 240)},
        { title: 'Mejor tiempo < 180s', unlocked: (stats.bestTime != null && stats.bestTime < 180)},
      ];
      break;

    default:
      achievements = [];
  }

  if (achievements.length === 0) return null;

  return (
    <div className="achievements-section">
      <h3>Logros</h3>
      <div className="achievement-cards">
        {achievements.map(({ title, unlocked }, i) => (
          <div
            key={i}
            className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
          >
            <h4>{title}</h4>
            <span className="status-icon">{unlocked ? '✅' : '🔒'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


  const renderStatsTable = () => {
    if (selectedTab === 'Tic Tac Toe') return renderTicTacToeStats();
    if (selectedTab === '2048') return render2048Stats();
    if (selectedTab === 'Buscaminas') return renderBuscaminasStats();
    if (selectedTab === 'Ajedrez') return renderChessStats();
    if (selectedTab === 'Memory') return renderMemoryStats();
    if (selectedTab === 'Snake') return renderSnakeStats();
    if (selectedTab === 'Solitario') return renderSolitarioStats();
    return null;
  };

  return (
    <div className="game-stats-menu">
      <h2>Estadísticas de Juegos</h2>
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={selectedTab === tab ? 'active' : ''}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="stats-content">
        {renderStatsTable()}
        {renderAchievements()}
      </div>
    </div>
  );
};

export default GameStatsMenu;

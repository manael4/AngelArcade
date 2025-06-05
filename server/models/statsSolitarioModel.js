module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_solitario (
      id TEXT PRIMARY KEY,
      gamesPlayed INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      bestTime INTEGER,
      FOREIGN KEY(id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_solitario WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_solitario (id) VALUES (?)", [userId], callback);
  };

  const updateStats = (userId, gamesPlayed, wins, bestTime, callback) => {
    db.run(
      `UPDATE stats_solitario 
       SET gamesPlayed = ?, wins = ?, bestTime = ?
       WHERE id = ?`,
      [gamesPlayed, wins, bestTime, userId],
      callback
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateStats,
  };
};

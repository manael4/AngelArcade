module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_memory (
      id TEXT PRIMARY KEY,
      gamesPlayed INTEGER DEFAULT 0,
      bestScore INTEGER DEFAULT NULL,
      pairsDiscovered INTEGER DEFAULT 0,
      FOREIGN KEY (id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_memory WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_memory (id) VALUES (?)", [userId], callback);
  };

  const updateStats = (userId, gamesPlayed, bestScore, pairsDiscovered, callback) => {
    db.run(
      `UPDATE stats_memory 
       SET gamesPlayed = ?, bestScore = ?, pairsDiscovered = ? 
       WHERE id = ?`,
      [gamesPlayed, bestScore, pairsDiscovered, userId],
      callback
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateStats,
  };
};

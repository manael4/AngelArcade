module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_chess (
      id TEXT PRIMARY KEY,
      wins_white INTEGER DEFAULT 0,
      wins_black INTEGER DEFAULT 0,
      FOREIGN KEY (id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_chess WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_chess (id) VALUES (?)", [userId], callback);
  };

  const updateStats = (userId, wins_white, wins_black, callback) => {
    db.run(
      "UPDATE stats_chess SET wins_white = ?, wins_black = ? WHERE id = ?",
      [wins_white, wins_black, userId],
      callback
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateStats,
  };
};

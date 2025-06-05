module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_buscaminas (
      id TEXT PRIMARY KEY,
      easy_gamesPlayed INTEGER DEFAULT 0,
      normal_gamesPlayed INTEGER DEFAULT 0,
      hard_gamesPlayed INTEGER DEFAULT 0,
      easy_wins INTEGER DEFAULT 0,
      normal_wins INTEGER DEFAULT 0,
      hard_wins INTEGER DEFAULT 0,
      easy_fastestTime INTEGER,
      normal_fastestTime INTEGER,
      hard_fastestTime INTEGER,
      FOREIGN KEY(id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_buscaminas WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_buscaminas (id) VALUES (?)", [userId], callback);
  };

  const updateStats = (
    userId,
    easy_gamesPlayed,
    normal_gamesPlayed,
    hard_gamesPlayed,
    easy_wins,
    normal_wins,
    hard_wins,
    easy_fastestTime,
    normal_fastestTime,
    hard_fastestTime,
    callback
  ) => {
    db.run(
      `UPDATE stats_buscaminas SET
        easy_gamesPlayed = ?,
        normal_gamesPlayed = ?,
        hard_gamesPlayed = ?,
        easy_wins = ?,
        normal_wins = ?,
        hard_wins = ?,
        easy_fastestTime = ?,
        normal_fastestTime = ?,
        hard_fastestTime = ?
      WHERE id = ?`,
      [
        easy_gamesPlayed,
        normal_gamesPlayed,
        hard_gamesPlayed,
        easy_wins,
        normal_wins,
        hard_wins,
        easy_fastestTime,
        normal_fastestTime,
        hard_fastestTime,
        userId,
      ],
      callback
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateStats,
  };
};

module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_2048 (
      id TEXT PRIMARY KEY,
      best_score INTEGER DEFAULT 0,
      FOREIGN KEY (id) REFERENCES users(id)
    )
  `);

  // Obtener estadísticas por usuario
  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_2048 WHERE id = ?", [userId], callback);
  };

  // Crear registro de estadísticas para nuevo usuario
  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_2048 (id) VALUES (?)", [userId], callback);
  };

  // Actualizar mejor puntuación si es mayor que la actual
  const updateBestScore = (userId, newScore, callback) => {
    db.run(
      `UPDATE stats_2048
       SET best_score = CASE WHEN best_score < ? THEN ? ELSE best_score END
       WHERE id = ?`,
      [newScore, newScore, userId],
      callback
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateBestScore,
  };
};

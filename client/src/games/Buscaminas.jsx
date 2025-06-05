import { useState, useEffect, useCallback } from "react";

const Buscaminas = () => {
  const [tamaño, setTamaño] = useState(10);
  const [minas, setMinas] = useState(15);
  const [dificultad, setDificultad] = useState("easy");
  const [tablero, setTablero] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [juegoGanado, setJuegoGanado] = useState(false);
  const [primerClick, setPrimerClick] = useState(true);
  const [casillasReveladas, setCasillasReveladas] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);

  const inicializarTablero = useCallback(() => {
    return Array(tamaño)
      .fill()
      .map(() =>
        Array(tamaño)
          .fill()
          .map(() => ({
            tieneMina: false,
            revelada: false,
            marcada: false,
            minasCercanas: 0,
          }))
      );
  }, [tamaño]);

  const reiniciarJuego = useCallback(() => {
    setTablero(inicializarTablero());
    setJuegoTerminado(false);
    setJuegoGanado(false);
    setPrimerClick(true);
    setCasillasReveladas(0);
    setTiempo(0);
    setTemporizadorActivo(false);
  }, [inicializarTablero]);

  const colocarMinas = useCallback(
    (tableroActual, filaInicial, columnaInicial) => {
      let minasColocadas = 0;
      const nuevoTablero = JSON.parse(JSON.stringify(tableroActual));

      while (minasColocadas < minas) {
        const fila = Math.floor(Math.random() * tamaño);
        const columna = Math.floor(Math.random() * tamaño);

        if (
          (fila !== filaInicial || columna !== columnaInicial) &&
          !nuevoTablero[fila][columna].tieneMina
        ) {
          nuevoTablero[fila][columna].tieneMina = true;
          minasColocadas++;
        }
      }

      for (let fila = 0; fila < tamaño; fila++) {
        for (let columna = 0; columna < tamaño; columna++) {
          if (!nuevoTablero[fila][columna].tieneMina) {
            let contador = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                const nuevaFila = fila + i;
                const nuevaColumna = columna + j;
                if (
                  nuevaFila >= 0 &&
                  nuevaFila < tamaño &&
                  nuevaColumna >= 0 &&
                  nuevaColumna < tamaño &&
                  nuevoTablero[nuevaFila][nuevaColumna].tieneMina
                ) {
                  contador++;
                }
              }
            }
            nuevoTablero[fila][columna].minasCercanas = contador;
          }
        }
      }

      return nuevoTablero;
    },
    [minas, tamaño]
  );

  const revelarCasilla = useCallback(
    (tablero, fila, columna) => {
      if (
        fila < 0 ||
        fila >= tamaño ||
        columna < 0 ||
        columna >= tamaño ||
        tablero[fila][columna].revelada ||
        tablero[fila][columna].marcada
      ) {
        return 0;
      }

      tablero[fila][columna].revelada = true;
      let contador = 1;

      if (tablero[fila][columna].minasCercanas === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i !== 0 || j !== 0) {
              contador += revelarCasilla(tablero, fila + i, columna + j);
            }
          }
        }
      }

      return contador;
    },
    [tamaño]
  );

  const manejarClickDerecho = useCallback(
    (e, fila, columna) => {
      e.preventDefault();
      if (juegoTerminado || tablero[fila][columna].revelada) {
        return;
      }

      const nuevoTablero = JSON.parse(JSON.stringify(tablero));
      nuevoTablero[fila][columna].marcada =
        !nuevoTablero[fila][columna].marcada;
      setTablero(nuevoTablero);
    },
    [juegoTerminado, tablero]
  );

  const cambiarConfiguracion = useCallback(
    (nuevoTamaño, nuevoMinas, dificultadElegida) => {
      setTamaño(nuevoTamaño);
      setMinas(nuevoMinas);
      setDificultad(dificultadElegida);
      setTiempo(0);
    },
    []
  );

  useEffect(() => {
    reiniciarJuego();
  }, [tamaño, minas, reiniciarJuego]);

  useEffect(() => {
    let intervalo;
    if (temporizadorActivo) {
      intervalo = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [temporizadorActivo]);

  const actualizarStatsEnServidor = useCallback(async (victoria) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  if (!userData) return;
  const userId = userData.id;

  try {
    const res = await fetch(`http://localhost:3001/api/statsBuscaminas/${userId}`);
    const data = await res.json();
    console.log(data);

    const dificultadMap = {
      easy: "easy",
      normal: "normal",
      hard: "hard"
    };

    const dificultadBack = dificultadMap[dificultad];

    const partidasPrevias = data[`${dificultadBack}_gamesPlayed`] || 0;
    const victoriasPrevias = data[`${dificultadBack}_wins`] || 0;
    const mejorTiempoPrevio = data[`${dificultadBack}_fastestTime`];

    const body = {
      dificultad: dificultadBack,
      partidas: partidasPrevias + 1,
      victorias: victoriasPrevias + (victoria ? 1 : 0),
      tiempo: null
    };

    if (victoria && (mejorTiempoPrevio === null || tiempo < mejorTiempoPrevio)) {
      body.tiempo = tiempo;
    }

    await fetch(`http://localhost:3001/api/statsBuscaminas/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error("Error actualizando estadísticas:", error);
  }
}, [dificultad, tiempo]);

const manejarClick = useCallback(async (fila, columna) => {
  if (juegoTerminado || tablero[fila][columna].revelada || tablero[fila][columna].marcada) {
    return;
  }

  let nuevoTablero;
  if (primerClick) {
    nuevoTablero = colocarMinas(tablero, fila, columna);
    setTablero(nuevoTablero);
    setPrimerClick(false);
    setTemporizadorActivo(true);
  } else {
    nuevoTablero = JSON.parse(JSON.stringify(tablero));
  }

  if (nuevoTablero[fila][columna].tieneMina) {
    for (let f = 0; f < tamaño; f++) {
      for (let c = 0; c < tamaño; c++) {
        if (nuevoTablero[f][c].tieneMina) {
          nuevoTablero[f][c].revelada = true;
        }
      }
    }
    setTablero(nuevoTablero);
    setJuegoTerminado(true);
    setTemporizadorActivo(false);
    await actualizarStatsEnServidor(false);
    return;
  }

  const reveladas = revelarCasilla(nuevoTablero, fila, columna);
  const nuevasReveladas = casillasReveladas + reveladas;
  setCasillasReveladas(nuevasReveladas);
  setTablero(nuevoTablero);

  const totalSeguras = tamaño * tamaño - minas;
  if (nuevasReveladas >= totalSeguras) {
    setJuegoTerminado(true);
    setJuegoGanado(true);
    setTemporizadorActivo(false);
    await actualizarStatsEnServidor(true);
  }
}, [juegoTerminado, tablero, primerClick, colocarMinas, tamaño, minas, casillasReveladas, revelarCasilla, actualizarStatsEnServidor]);


  const renderizarTablero = () => {
    return tablero.map((fila, indiceFila) => (
      <div key={indiceFila} className="fila">
        {fila.map((casilla, indiceColumna) => {
          let contenido = "";
          let clase = "casilla";

          if (casilla.revelada) {
            clase += " revelada";
            if (casilla.tieneMina) {
              contenido = "💣";
              clase += " mina";
            } else if (casilla.minasCercanas > 0) {
              contenido = casilla.minasCercanas;
              clase += ` numero-${casilla.minasCercanas}`;
            }
          } else if (casilla.marcada) {
            contenido = "🚩";
            clase += " marcada";
          }

          return (
            <div
              key={indiceColumna}
              className={clase}
              onClick={() => manejarClick(indiceFila, indiceColumna)}
              onContextMenu={(e) =>
                manejarClickDerecho(e, indiceFila, indiceColumna)
              }
            >
              {contenido}
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="buscaminas-container">
      <h2>Buscaminas</h2>

      <div className="info-juego">
        <p>Dificultad: {dificultad}</p>
        <p>Tiempo: {tiempo}s</p>
      </div>

      <div className="controles">
        <button onClick={reiniciarJuego}>Reiniciar Juego</button>
        <div className="configuracion">
          <h4>Dificultad:</h4>
          <button onClick={() => cambiarConfiguracion(10, 15, "easy")}>
            Fácil (10x10, 15 minas)
          </button>
          <button onClick={() => cambiarConfiguracion(15, 40, "normal")}>
            Intermedio (15x15, 40 minas)
          </button>
          <button onClick={() => cambiarConfiguracion(20, 80, "hard")}>
            Difícil (20x20, 80 minas)
          </button>
        </div>
      </div>

      {juegoTerminado && (
        <div className="mensaje-final">
          {juegoGanado ? (
            <div className="ganaste">¡Ganaste! 🎉</div>
          ) : (
            <div className="perdiste">¡Perdiste! 💥</div>
          )}
        </div>
      )}

      <div
        className="tablero"
        style={{ gridTemplateColumns: `repeat(${tamaño}, 30px)` }}
      >
        {renderizarTablero()}
      </div>

      <div className="instrucciones">
        <h4>Instrucciones:</h4>
        <ul>
          <li>Haz clic izquierdo para revelar una casilla</li>
          <li>Haz clic derecho para marcar/desmarcar una mina</li>
          <li>Si revelas una mina, pierdes</li>
          <li>Ganas cuando revelas todas las casillas sin minas</li>
        </ul>
      </div>
    </div>
  );
};

export default Buscaminas;

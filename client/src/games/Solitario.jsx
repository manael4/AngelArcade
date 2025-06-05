import React, { useState, useEffect } from "react";

const esColorRojo = (palo) => palo === "Corazones" || palo === "Diamantes";

const valorNumerico = (valor) => {
  if (valor === "A") return 1;
  if (valor === "J") return 11;
  if (valor === "Q") return 12;
  if (valor === "K") return 13;
  return parseInt(valor);
};

class Carta {
  constructor(palo, valor) {
    this.palo = palo;
    this.valor = valor;
    this.id = `${valor}-${palo}-${Math.random()}`;
    this.bocaArriba = false;
    this.imagen = this.generarImagen();
  }

  voltear() {
    this.bocaArriba = !this.bocaArriba;
  }

  toString() {
    return `${this.valor} de ${this.palo}`;
  }

  generarImagen() {
    return `/images/cartas/${this.valor}_${this.palo}.png`;
  }
}

const palos = ["Corazones", "Diamantes", "Treboles", "Picas"];
const valores = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function crearBaraja() {
  const baraja = [];
  for (const palo of palos) {
    for (const valor of valores) {
      baraja.push(new Carta(palo, valor));
    }
  }
  return baraja.sort(() => Math.random() - 0.5);
}

export default function Solitario() {
  const [tablero, setTablero] = useState([[], [], [], [], [], [], []]);
  const [mazoRobo, setMazoRobo] = useState([]);
  const [descarte, setDescarte] = useState([]);
  const [fundaciones, setFundaciones] = useState({
    Corazones: [],
    Diamantes: [],
    Treboles: [],
    Picas: [],
  });
  const [seleccionada, setSeleccionada] = useState(null);
  const [ganado, setGanado] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [mejorTiempo, setMejorTiempo] = useState(
    parseInt(localStorage.getItem("mejorTiempo")) || null
  );
  const [userId, setUserId] = useState(null);
  const [statsCargadas, setStatsCargadas] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) setUserId(user.id);
  }, []);

  useEffect(() => {
    if (userId && !statsCargadas) {
      fetch(`http://localhost:3001/api/statsSolitario/${userId}`)
        .then((res) => {
          if (res.ok) return res.json();
          if (res.status === 404) throw new Error("No existe");
        })
        .then((data) => {
          setMejorTiempo(data.mejorTiempo ?? null);
          setStatsCargadas(true);
        })
        .catch(() => {
          fetch(`http://localhost:3001/api/statsSolitario/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              gamesPlayed: 0,
              wins: 0,
              bestTime: null,
              avgTime: null,
            }),
          }).then(() => setStatsCargadas(true));
        });
    }
  }, [userId, statsCargadas]);

  useEffect(() => {
    const nuevaBaraja = crearBaraja();
    const nuevoTablero = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const carta = nuevaBaraja.pop();
        if (j === i) carta.voltear();
        nuevoTablero[i].push(carta);
      }
    }

    setTablero(nuevoTablero);
    setMazoRobo(nuevaBaraja);
  }, []);

  useEffect(() => {
    const completadas = Object.values(fundaciones).every(
      (f) => f.length === 13
    );
    if (completadas) {
      setGanado(true);
      if (!mejorTiempo || tiempo < mejorTiempo) {
        setMejorTiempo(tiempo);
        localStorage.setItem("mejorTiempo", tiempo.toString());
      }

      if (userId) {
        fetch(`http://localhost:3001/api/statsSolitario/${userId}`, {
          method: "GET",
        })
          .then((res) => res.json())
          .then((stats) => {
            const partidas = stats.gamesPlayed + 1;
            const victorias = stats.wins + 1;
            const mejor =
              !stats.mejorTiempo || tiempo < stats.mejorTiempo
                ? tiempo
                : stats.mejorTiempo;
            const nuevaMedia = Math.round(
              (stats.tiempoMedio * stats.victorias + tiempo) / victorias
            );

            fetch(`http://localhost:3001/api/statsSolitario/${userId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                gamesPlayed: partidas,
                wins: victorias,
                bestTime: mejor,
                avgTime: nuevaMedia,
              }),
            });
          });
      }
    }
  }, [fundaciones, mejorTiempo, tiempo, userId]);

  useEffect(() => {
    if (!ganado) {
      const intervalo = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(intervalo);
    }
  }, [ganado]);

  const manejarDragStart = (e, columnaIndice, cartaIndice) => {
    const carta = tablero[columnaIndice][cartaIndice];
    if (carta && carta.bocaArriba) {
      setSeleccionada({ columna: columnaIndice, indice: cartaIndice });
    }
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
  };

  const manejarDrop = (e, columnaDestino) => {
    e.preventDefault();
    if (!seleccionada) return;
    const { columna, indice } = seleccionada;
    moverCarta(columna, indice, columnaDestino);
  };

  const moverCarta = (columnaOrigen, indiceCarta, columnaDestino) => {
    const origen = [...tablero[columnaOrigen]];
    const destino = [...tablero[columnaDestino]];
    const carta = origen[indiceCarta];

    if (!carta.bocaArriba) return;

    if (destino.length === 0 && carta.valor === "K") {
      destino.push(...origen.splice(indiceCarta));
    } else {
      const cartaSuperior = destino[destino.length - 1];
      if (
        cartaSuperior &&
        esColorRojo(carta.palo) !== esColorRojo(cartaSuperior.palo) &&
        valorNumerico(carta.valor) === valorNumerico(cartaSuperior.valor) - 1
      ) {
        destino.push(...origen.splice(indiceCarta));
      } else {
        return;
      }
    }

    if (origen.length > 0 && !origen[origen.length - 1].bocaArriba) {
      origen[origen.length - 1].voltear();
    }

    const nuevoTablero = [...tablero];
    nuevoTablero[columnaOrigen] = origen;
    nuevoTablero[columnaDestino] = destino;
    setTablero(nuevoTablero);
    setSeleccionada(null);
  };

  const robarCarta = () => {
    const mazo = [...mazoRobo];
    if (mazo.length === 0) {
      const recicladas = [...descarte.reverse()].map((c) => {
        const nueva = new Carta(c.palo, c.valor);
        nueva.bocaArriba = true;
        return nueva;
      });
      setMazoRobo(recicladas);
      setDescarte([]);
    } else {
      const carta = mazo.pop();
      carta.bocaArriba = true;
      setMazoRobo(mazo);
      setDescarte([...descarte, carta]);
    }
  };

  const manejarClicCarta = (columnaIndice, cartaIndice) => {
    const carta = tablero[columnaIndice][cartaIndice];
    if (!carta.bocaArriba) return;
    if (cartaIndice !== tablero[columnaIndice].length - 1) return;
    moverCartaAFundacion(carta.palo, columnaIndice, cartaIndice);
  };

  const moverCartaAFundacion = (paloDestino, columnaIndice, cartaIndice) => {
    const carta = tablero[columnaIndice][cartaIndice];
    if (!carta.bocaArriba) return;

    const fundacion = fundaciones[paloDestino];
    const cartaSuperior = fundacion[fundacion.length - 1];

    if (
      (fundacion.length === 0 && carta.valor === "A") ||
      (cartaSuperior &&
        valorNumerico(carta.valor) === valorNumerico(cartaSuperior.valor) + 1 &&
        carta.palo === cartaSuperior.palo)
    ) {
      const nuevaFundacion = [...fundacion, carta];
      const nuevoTablero = [...tablero];
      nuevoTablero[columnaIndice].splice(cartaIndice, 1);
      if (
        nuevoTablero[columnaIndice].length > 0 &&
        !nuevoTablero[columnaIndice][nuevoTablero[columnaIndice].length - 1]
          .bocaArriba
      ) {
        nuevoTablero[columnaIndice][
          nuevoTablero[columnaIndice].length - 1
        ].voltear();
      }

      setFundaciones({ ...fundaciones, [paloDestino]: nuevaFundacion });
      setTablero(nuevoTablero);
    }
  };

  const moverDescarteAutomaticamente = () => {
    const carta = descarte[descarte.length - 1];
    if (!carta) return;

    const fundacion = fundaciones[carta.palo];
    const cartaSuperior = fundacion[fundacion.length - 1];

    if (
      (fundacion.length === 0 && carta.valor === "A") ||
      (cartaSuperior &&
        valorNumerico(carta.valor) === valorNumerico(cartaSuperior.valor) + 1 &&
        carta.palo === cartaSuperior.palo)
    ) {
      const nuevaFundacion = [...fundacion, carta];
      setFundaciones({ ...fundaciones, [carta.palo]: nuevaFundacion });
      setDescarte(descarte.slice(0, -1));
      return;
    }

    for (let i = 0; i < tablero.length; i++) {
      const columna = tablero[i];
      const ultima = columna[columna.length - 1];
      if (
        (columna.length === 0 && carta.valor === "K") ||
        (ultima &&
          esColorRojo(carta.palo) !== esColorRojo(ultima.palo) &&
          valorNumerico(carta.valor) === valorNumerico(ultima.valor) - 1)
      ) {
        const nuevoTablero = [...tablero];
        nuevoTablero[i] = [...columna, carta];
        setTablero(nuevoTablero);
        setDescarte(descarte.slice(0, -1));
        return;
      }
    }
  };

  const reiniciarJuego = () => {
    setTiempo(0);
    setGanado(false);
    const nuevaBaraja = crearBaraja();
    const nuevoTablero = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const carta = nuevaBaraja.pop();
        if (j === i) carta.voltear();
        nuevoTablero[i].push(carta);
      }
    }

    setTablero(nuevoTablero);
    setMazoRobo(nuevaBaraja);
    setDescarte([]);
    setFundaciones({
      Corazones: [],
      Diamantes: [],
      Treboles: [],
      Picas: [],
    });

    if (userId) {
      fetch(`http://localhost:3001/api/statsSolitario/${userId}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((stats) => {
          fetch(`http://localhost:3001/api/statsSolitario/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gamesPlayed: stats.gamesPlayed + 1,
              wins: stats.wins,
              bestTime: stats.bestTime,
            }),
          });
        });
    }
  };

  return (
    <div className="solitario_contenedor">
      <h2>Solitario</h2>
      {ganado && <p className="solitario_mensaje">¡Has ganado!</p>}
      <p className="solitario_temporizador">Tiempo: {tiempo}s</p>
      {mejorTiempo !== null && (
        <p className="solitario_mejor">Mejor tiempo: {mejorTiempo}s</p>
      )}
      <button className="solitario_reiniciar" onClick={reiniciarJuego}>
        Reiniciar Juego
      </button>
      <div className="solitario_superior">
        <div className="solitario_mazos">
          <div
            className="solitario_mazo"
            onClick={robarCarta}
            title={
              mazoRobo.length > 0
                ? "Haz clic para robar una carta"
                : descarte.length > 0
                ? "Haz clic para reciclar el descarte"
                : "No hay cartas para robar"
            }
          >
            {mazoRobo.length > 0 ? "Mazo" : "Vacío"}
          </div>
          <div className="solitario_descarte">
            {descarte.length > 0 && (
              <div
                className="solitario_carta solitario_arriba"
                onClick={moverDescarteAutomaticamente}
              >
                <img
                  src={descarte[descarte.length - 1].imagen}
                  alt={descarte[descarte.length - 1].toString()}
                />
              </div>
            )}
          </div>
        </div>
        <div className="solitario_fundaciones">
          {palos.map((palo) => (
            <div key={palo} className="solitario_fundacion">
              {fundaciones[palo].length > 0 ? (
                <img
                  src={fundaciones[palo][fundaciones[palo].length - 1].imagen}
                  alt={fundaciones[palo][
                    fundaciones[palo].length - 1
                  ].toString()}
                  className="solitario_fundacion_carta"
                />
              ) : (
                <span>{palo}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="solitario_tablero">
        {tablero.map((columna, i) => (
          <div
            key={i}
            className="solitario_columna"
            onDragOver={manejarDragOver}
            onDrop={(e) => manejarDrop(e, i)}
          >
            {columna.map((carta, j) => (
              <div
                key={carta.id}
                className={`solitario_carta ${
                  carta.bocaArriba ? "" : "solitario_carta_reversa"
                }`}
                draggable={carta.bocaArriba}
                onDragStart={(e) => manejarDragStart(e, i, j)}
                onClick={() => manejarClicCarta(i, j)}
              >
                <img
                  src={
                    carta.bocaArriba
                      ? carta.imagen
                      : "/images/cartas/reversa.png"
                  }
                  alt={carta.toString()}
                  className={
                    fundaciones[carta.palo].includes(carta)
                      ? "solitario_fundacion_carta"
                      : ""
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

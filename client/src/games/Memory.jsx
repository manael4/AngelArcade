import { useEffect, useState, useCallback } from 'react';

const emojis = ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐨', '🦝', '🐸', '🐺', '🦁', '🐯', '🐻‍❄️', '🐷', '🐮', '🐵', '🐔'];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Memory = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [userId, setUserId] = useState(null);

  const startGame = useCallback(() => {
    if (!userId) {
      console.warn('No hay userId definido. No se puede iniciar el juego.');
      return;
    }

    const duplicated = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      emoji,
    }));
    const shuffled = shuffleArray(duplicated);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setDisabled(false);
    setStartTime(Date.now());
    setGameFinished(false);

    fetch(`/api/statsMemory/${userId}/game`, { method: 'PATCH' })
      .then((res) => res.json())
      .catch((err) => console.error('Error al iniciar la partida:', err));
  }, [userId]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setUserId(parsed.id);
        } else {
          console.warn('Usuario sin id en localStorage.');
        }
      } else {
        console.warn('No hay usuario en localStorage.');
      }
    } catch (err) {
      console.error('Error leyendo usuario desde localStorage:', err);
    }
  }, []);

  useEffect(() => {
    if (userId) startGame();
  }, [userId, startGame]);

  useEffect(() => {
    if (matched.length === emojis.length && userId && startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setGameFinished(true);

      fetch(`/api/statsMemory/${userId}/bestScore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bestScore: elapsed }),
      }).catch((err) => console.error('Error al actualizar bestScore:', err));
    }
  }, [matched, startTime, userId]);

  const handleClick = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(cards[index].emoji)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.emoji === secondCard.emoji) {
        setMatched((prev) => [...prev, firstCard.emoji]);

        if (userId) {
          fetch(`/api/statsMemory/${userId}/pair`, { method: 'PATCH' })
            .then((res) => res.json())
            .catch((err) => console.error('Error al registrar pareja:', err));
        }
      }

      setDisabled(true);
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  return (
    <div className="memory_container">
      <h2>Juego de Memoria</h2>
      <div className="memory_grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.emoji);
          return (
            <div
              key={card.id}
              className={`memory_card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleClick(index)}
            >
              <div className="memory_card-inner">
                <div className="memory_card-front">❓</div>
                <div className="memory_card-back">{card.emoji}</div>
              </div>
            </div>
          );
        })}
      </div>
      {gameFinished && (
        <div className="memory_victory-message">
          <h2>¡Has ganado!</h2>
          <button onClick={startGame}>Volver a jugar</button>
        </div>
      )}
    </div>
  );
};

export default Memory;

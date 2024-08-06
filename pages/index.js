import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/Game.module.css';

const Game = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [hint, setHint] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const MAX_HINTS = 4;

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await axios.get('https://countriesnow.space/api/v0.1/countries/flag/images');
      setCountries(response.data.data);
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      selectRandomCountry();
    }
  }, [countries]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          handleTimerEnd();
          return 15;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [selectedCountry]);

  const selectRandomCountry = () => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    setSelectedCountry(countries[randomIndex]);
    setTimer(15);
    setHint('');
    setHintIndex(0);
    setHintsUsed(0);
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === selectedCountry.name.toLowerCase()) {
      setScore(prevScore => Math.max(prevScore + 10, 0));
      setTimer(prevTimer => prevTimer + 15);
      selectRandomCountry();
    } else {
      setScore(prevScore => Math.max(prevScore - 1, 0));
    }
    setGuess('');
  };

  const handleTimerEnd = () => {
    selectRandomCountry();
  };

  const handlePlayerNameChange = (event) => {
    setPlayerName(event.target.value);
  };

  const handleSaveScore = () => {
    if (playerName.trim()) {
      const newPlayers = [...players, { name: playerName, score }];
      setPlayers(newPlayers);
      localStorage.setItem('players', JSON.stringify(newPlayers));
      setPlayerName('');
      setScore(0);
    }
  };

  const handleDeleteScore = (name) => {
    const updatedPlayers = players.filter(player => player.name !== name);
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
  };

  const handleHint = () => {
    if (hintIndex < selectedCountry.name.length && hintsUsed < MAX_HINTS) {
      setHint(selectedCountry.name.slice(0, hintIndex + 1));
      setHintIndex(hintIndex + 1);
      setHintsUsed(hintsUsed + 1);
      setTimer(prevTimer => Math.max(prevTimer - 2, 0)); // Restar tiempo en vez de puntos
    }

    if (hintsUsed >= MAX_HINTS) {
      alert('No more hints available. You can\'t guess now.');
      setGuess('');
      selectRandomCountry();
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimer(15);
    setGuess('');
    setHint('');
    setHintIndex(0);
    setHintsUsed(0);
    selectRandomCountry();
  };

  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem('players'));
    if (storedPlayers) {
      setPlayers(storedPlayers);
    }
  }, []);

  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  return (
    <div className={styles.container}>
      <h1>Guess the Flag</h1>
      {selectedCountry && (
        <div className={styles.gameContainer}>
          <img src={selectedCountry.flag} alt="Country flag" className={styles.flag} />
          <div className={styles.inputContainer}>
            <input 
              type="text" 
              value={guess} 
              onChange={(e) => setGuess(e.target.value)} 
              placeholder="Guess the country" 
              className={styles.input}
              disabled={hintsUsed >= MAX_HINTS}
            />
            <button onClick={handleGuess} className={styles.button} disabled={hintsUsed >= MAX_HINTS}>Guess</button>
            <button onClick={handleHint} className={styles.button} disabled={hintsUsed >= MAX_HINTS}>Hint</button>
            {hint && (
              <div className={styles.hintBox}>
                <p>Hint: {hint}</p>
              </div>
            )}
          </div>
          <p>Score: {score}</p>
          <p>Timer: {timer}</p>
          <div className={styles.nameInputContainer}>
            <input 
              type="text" 
              value={playerName} 
              onChange={handlePlayerNameChange} 
              placeholder="Enter your name" 
              className={styles.input}
            />
            <div className={styles.buttonContainer}>
              <button onClick={handleSaveScore} className={styles.button}>Save Score</button>
              <button onClick={resetGame} className={styles.button}>Restart Game</button>
            </div>
          </div>
        </div>
      )}
      <h2 className={styles.subtitle}>Top Scores</h2>
      <div className={styles.leaderboard}>
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => (
            <div key={index} className={styles.leader}>
              <span className={styles.leaderName}>{player.name}</span>
              <span className={styles.leaderScore}>{player.score}</span>
              <button className={styles.deleteButton} onClick={() => handleDeleteScore(player.name)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No scores yet!</p>
        )}
      </div>
    </div>
  );
};

export default Game;

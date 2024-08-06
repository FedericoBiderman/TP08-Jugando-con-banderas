import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

const Home = () => {
  const router = useRouter();

  const startGame = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenido a Guess the Flag!</h1>
      <p className={styles.description}>¿Puedes adivinar de qué país es cada bandera?</p>
      <button onClick={startGame} className={styles.button}>Comenzar Juego</button>
    </div>
  );
};

export default Home;

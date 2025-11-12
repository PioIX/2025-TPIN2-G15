'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/config.module.css';

export default function ConfigPage() {
  const router = useRouter();
  const [players, setPlayers] = useState(4); // Default 4 players
  const [safe, setSafe] = useState(true); // Default safe enabled

  const handleStartGame = () => {
    // Pasamos las configuraciones como parámetros en la URL
    router.push(`/home/play/local/classic/game?players=${players}&safe=${safe}`);
  };

  return (
    <div className={styles.configContainer}>
      <h1>Configuración del Juego</h1>
      <div className={styles.option}>
        <label htmlFor="players">Número de Jugadores:</label>
        <select
          id="players"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
        >
          <option value={2}>2 Jugadores</option>
          <option value={3}>3 Jugadores</option>
          <option value={4}>4 Jugadores</option>
        </select>
      </div>
      
      <div className={styles.option}>
        <label htmlFor="safe">Casillas Seguras:</label>
        <input
          type="checkbox"
          id="safe"
          checked={safe}
          onChange={(e) => setSafe(e.target.checked)}
        />
      </div>
      
      <button onClick={handleStartGame} className={styles.startButton}>
        Comenzar Juego
      </button>
    </div>
  );
}

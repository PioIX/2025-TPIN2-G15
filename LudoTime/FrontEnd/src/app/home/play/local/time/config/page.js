'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Play } from 'lucide-react';
import styles from '@/app/styles/config.module.css';

export default function ConfigPage() {
  const router = useRouter();
  const [players, setPlayers] = useState(4);
  const [safe, setSafe] = useState(true);

  const handleStartGame = () => {
    router.push(`/home/play/local/time/game?players=${players}&safe=${safe}`);
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.configCard}>
        <h1 className={styles.title}>Configuración del Juego</h1>
        
        <div className={styles.optionsGroup}>
          <div className={styles.option}>
            <div className={styles.optionHeader}>
              <Users size={28} className={styles.icon} />
              <label htmlFor="players" className={styles.label}>Número de Jugadores</label>
            </div>
            <div className={styles.selectWrapper}>
              <select
                id="players"
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className={styles.select}
              >
                <option value={2}>2 Jugadores</option>
                <option value={3}>3 Jugadores</option>
                <option value={4}>4 Jugadores</option>
              </select>
            </div>
          </div>
          
          <div className={styles.option}>
            <div className={styles.optionHeader}>
              <Shield size={28} className={styles.icon} />
              <label htmlFor="safe" className={styles.label}>Casillas Seguras</label>
            </div>
            <div className={styles.toggleWrapper}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="safe"
                  checked={safe}
                  onChange={(e) => setSafe(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.toggleLabel}>{safe ? 'Activadas' : 'Desactivadas'}</span>
            </div>
          </div>
        </div>
        
        <button onClick={handleStartGame} className={styles.startButton}>
          <Play size={24} />
          Comenzar Juego
        </button>

        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>Configuración Actual:</p>
          <p className={styles.infoText}>• {players} jugadores participarán</p>
          <p className={styles.infoText}>• Casillas seguras: {safe ? 'Sí (★)' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
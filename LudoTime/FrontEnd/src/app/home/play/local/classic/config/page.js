"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/styles/config.module.css";

export default function ConfigClassic() {
    const [players, setPlayers] = useState(4);
    const [safe, setSafe] = useState(true);
    const [names, setNames] = useState([
        "Jugador 1",
        "Jugador 2",
        "Jugador 3",
        "Jugador 4",
    ]);

    const q = new URLSearchParams({
        players: String(players),
        safe: String(safe),
        n1: names[0],
        n2: names[1],
        n3: names[2],
        n4: names[3],
    }).toString();

    return (
        <main className={styles.wrap}>
            <section className={styles.card}>
                <h1 className={styles.title}>Configurar partida (Clásico)</h1>

                <div className={styles.row}>
                    <label className={styles.label}>Cantidad de jugadores</label>
                    <select
                        className={styles.select}
                        value={players}
                        onChange={(e) => setPlayers(parseInt(e.target.value, 10))}
                    >
                        <option value={2}>2 jugadores</option>
                        <option value={3}>3 jugadores</option>
                        <option value={4}>4 jugadores</option>
                    </select>
                </div>

                <div className={styles.row}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={safe}
                            onChange={(e) => setSafe(e.target.checked)}
                        />
                        <span>Casillas seguras (⭐)</span>
                    </label>
                </div>

                <div className={styles.grid}>
                    {Array.from({ length: players }).map((_, i) => (
                        <div key={i} className={styles.inputGroup}>
                            <label className={styles.small}>Jugador {i + 1}</label>
                            <input
                                className={styles.input}
                                value={names[i]}
                                onChange={(e) => {
                                    const next = [...names];
                                    next[i] = e.target.value;
                                    setNames(next);
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <Link className={styles.btnPrimary} href={`/home/play/local/classic/game?${q}`}>
                        Empezar
                    </Link>
                </div>
            </section>
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../../styles/stats.module.css";
import HamburgerMenu from "@/app/components/Hamburger-menu";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);

  const menuItems = [
    { text: "Inicio", href: "../../../../home" },
    { text: "Perfil", href: "../../../../navhambar/profile" },
    { text: "Reglas", href: "../../../../navhambar/rules" },
    { text: "Cerrar sesión", href: "../../../../navhambar/logout" },
  ];

  useEffect(() => {
    const storedStats = localStorage.getItem("ludoStats");
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, []);

  const volver = () => {
    router.push("/home");
  };

  const resetear = () => {
    localStorage.removeItem("ludoStats");
    setStats(null);
  };

  const calcularPorcentaje = (wins, total) => {
    if (!total || total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const obtenerMaximo = () => {
    if (!stats) return null;
    const valores = Object.values(stats.wins);
    const max = Math.max(...valores);
    return valores.indexOf(max);
  };

  const jugadorTop = obtenerMaximo();

  return (
    <main className={styles.container}>
      <HamburgerMenu items={menuItems} />

      <div className={styles.board}>
        <h1 className={styles.title}>Estadísticas</h1>

        {!stats ? (
          <p>No hay estadísticas todavía.</p>
        ) : (
          <>
            <div className={styles.total}>
              Total de partidas: {stats.gamesPlayed}
            </div>

            {jugadorTop !== null && (
              <div className={styles.topPlayer}>
                🏆 Jugador con más victorias:{" "}
                {jugadorTop === 0
                  ? "🟢 Jugador 1"
                  : jugadorTop === 1
                  ? "🟡 Jugador 2"
                  : jugadorTop === 2
                  ? "🔵 Jugador 3"
                  : "🔴 Jugador 4"}
              </div>
            )}

            {/* 🔥 RANKING ORDENADO */}
            {Object.entries(stats.wins)
              .map(([id, wins]) => ({
                id: Number(id),
                wins,
              }))
              .sort((a, b) => b.wins - a.wins)
              .map((player, index) => {
                const porcentaje = calcularPorcentaje(
                  player.wins,
                  stats.gamesPlayed
                );

                const medal =
                  index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : "4°";

                return (
                  <div key={player.id} className={styles.playerBlock}>
                    <div className={styles.playerName}>
                      {medal}{" "}
                      {player.id === 0
                        ? "🟢 Jugador 1"
                        : player.id === 1
                        ? "🟡 Jugador 2"
                        : player.id === 2
                        ? "🔵 Jugador 3"
                        : "🔴 Jugador 4"}{" "}
                      – {player.wins} victorias ({porcentaje}%)
                    </div>

                    <div className={styles.barContainer}>
                      <div
                        className={`${styles.bar} ${
                          player.id === 0
                            ? styles.green
                            : player.id === 1
                            ? styles.yellow
                            : player.id === 2
                            ? styles.blue
                            : styles.red
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

            <div className={styles.buttons}>
              <button
                className={`${styles.btn} ${styles.reset}`}
                onClick={resetear}
              >
                Resetear
              </button>

              <button
                className={`${styles.btn} ${styles.back}`}
                onClick={volver}
              >
                Volver
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
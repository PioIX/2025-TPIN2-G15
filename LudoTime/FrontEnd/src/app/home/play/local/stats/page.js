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
      setStats(JSON.parse(storedStats)); // lo convierte de texto a objeto
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
    if (!total || total === 0) { // si total es nulo, undefined o igual a 0
      return 0
    }
    return Math.round((wins / total) * 100); //redondea y calcula el porcentaje (entre wins y el total de partidas)
  };

  // CALCULA EL JUGADOR CON MAS VICTORIAS
  const obtenerMaximo = () => {
    if (!stats) {
      return null
    }
    const valores = Object.values(stats.wins); // agarra los valores/victorias de (stats.win) y se los guarda a valores
    const max = Math.max(...valores); // devuelve el numero mas grande entre las wins
    return valores.indexOf(max); // busca en que posicion esta el jugador con mas wins
  };

  const jugadorTop = obtenerMaximo(); //guarda el id del jugador con mas victorias

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

            {/* MUESTRA CUAL ES EL JUGADOR CON MAS VICTORIAS */}
            {jugadorTop !== null && (
              <div className={styles.topPlayer}>
                🏆 Jugador con más victorias: 
                  {jugadorTop === 0
                  ? "🟢 Jugador 1"
                  : jugadorTop === 1
                  ? "🟡 Jugador 2"
                  : jugadorTop === 2
                  ? "🔵 Jugador 3"
                  : "🔴 Jugador 4"}
              </div>
            )}

            {/* ORDENAMOS EL RANKING DE MAS A MENOS VICTORIAS */}
            {Object.entries(stats.wins) // convierte el objeto en array
              .map(([id, wins]) => ({ // recorre un array y devuelve otro (se usa array porque los arrays se pueden ordenar, los objetos no)
                id: Number(id),
                wins,
              }))
              .sort((a, b) => b.wins - a.wins) // ORDENA EL ARRAY SEGUN CUAL ES MAYOR
              .map((player, index) => { //RECORREMOS EL ARRAY Y REALIZAMOS EL PORCENTAJE DE LAS STATS DE CADA JUGADOR
                const porcentaje = calcularPorcentaje(
                  player.wins,
                  stats.gamesPlayed
                );
                
                {/* SEGUN LA POSICION (index) CADA JUGADOR RECIBE UNA MEDALLA (SALVO EL 4to) */}
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
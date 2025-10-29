"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/scores.module.css"; // Asegúrate de que la ruta sea correcta
import HamburgerMenu from "../../components/Hamburger-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // p.ej. http://localhost:4000

// Fallback: datos de ejemplo para que la página funcione aunque no haya API
const FALLBACK_SCORES = [
  { player: "Max",    ludo: 1240, time: 310, math: 470, trophies: 6 },
  { player: "Feli",   ludo: 1180, time: 295, math: 510, trophies: 7 },
  { player: "Thiago", ludo: 990,  time: 355, math: 420, trophies: 4 },
  { player: "Eze",    ludo: 1050, time: 280, math: 390, trophies: 3 },
  { player: "Nico",   ludo: 1110, time: 265, math: 405, trophies: 5 },
  { player: "Lau",    ludo: 980,  time: 340, math: 360, trophies: 2 },
  { player: "Sofi",   ludo: 1155, time: 305, math: 415, trophies: 5 },
  { player: "Mati",   ludo: 920,  time: 330, math: 375, trophies: 3 },
  { player: "Bruno",  ludo: 860,  time: 300, math: 345, trophies: 2 },
  { player: "Ani",    ludo: 1010, time: 297, math: 410, trophies: 4 },
];

export default function ScoresPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      try {
        // 1) intenta API externa (backend propio)
        if (API_URL) {
          const res = await fetch(`${API_URL}/scores`, { cache: "no-store" });
          if (!res.ok) throw new Error("Bad status");
          const data = await res.json();
          if (!ignore && Array.isArray(data)) {
            setRows(data);
            setStatus("ok");
            return;
          }
        }
        // 2) intenta API interna (ruta /api/scores si la agregás)
        const local = await fetch("/api/scores", { cache: "no-store" });
        if (local.ok) {
          const data = await local.json();
          if (!ignore && Array.isArray(data)) {
            setRows(data);
            setStatus("ok");
            return;
          }
        }

        // 3) fallback de ejemplo
        if (!ignore) {
          setRows(FALLBACK_SCORES);
          setStatus("ok");
        }
      } catch {
        if (!ignore) {
          setRows(FALLBACK_SCORES);
          setStatus("error");
        }
      }
    }

    load();
    return () => (ignore = true);
  }, []);

  // Orden: Total desc, luego trofeos desc
  const sorted = useMemo(() => {
    const calcTotal = (r) =>
      (Number(r.ludo) || 0) + (Number(r.time) || 0) + (Number(r.math) || 0);

    return [...rows]
      .map((r) => ({ ...r, total: calcTotal(r) }))
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return (Number(b.trophies) || 0) - (Number(a.trophies) || 0);
      })
      .slice(0, 10);
  }, [rows]);

  const menuItems = [
        { text: "Inicio", href: "completar" },
        { text: "Perfil", href: "completar" },
        { text: "Ayuda", href: "completar" },
        { text: "Configuración", href: "completar" },
        { text: "Cerrar sesión", href: "completar" },
    ];


  return (
    <div className={styles.container}>
      {/* El background negro translúcido + patrón de dados se maneja en el CSS */}
      <HamburgerMenu items={menuItems} />
      <div className={styles.board}>
        <header className={styles.header}>
          <span>Puesto</span>
          <span>Jugador</span>
          <span>Ludo</span>
          <span>Time</span>
          <span>Math</span>
          <span>Trofeos</span>
        </header>

        <div className={styles.rows}>
          {status === "loading" &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk-${i}`} className={`${styles.row} ${styles.skel}`} />
            ))}

          {status !== "loading" &&
            sorted.map((r, idx) => (
              <div key={`${r.player}-${idx}`} className={styles.row}>
                <span className={styles.rank}>{idx + 1}</span>
                <span className={styles.player}>{r.player}</span>
                <span>{r.ludo}</span>
                <span>{r.time}</span>
                <span>{r.math}</span>
                <span>{r.trophies}</span>
              </div>
            ))}
        </div>

        {status === "error" && (
          <p className={styles.hint}>
            Mostrando datos de ejemplo (no se pudo contactar al servidor).
          </p>
        )}
      </div>
    </div>
  );
}

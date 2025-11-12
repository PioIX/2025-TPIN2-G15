"use client";

import Image from "next/image";
import styles from "../../../../styles/lobby.module.css";
import HamburgerMenu from "../../../../components/Hamburger-menu";
import { io } from "socket.io-client";

export default function ClassicLobby() {

    const socket = io();
    
    const modeTitle = "Clásico";

    // placeholders visuales
    const maxPlayers = 4;
    const players = ["username01", "-", "-", "-"];

    const menuItems = [
        { text: "Inicio", href: "/home" },
        { text: "Perfil", href: "/navhambar/profile" },
        { text: "Ayuda", href: "/navhambar/help" },
        { text: "Configuración", href: "/navhambar/settings" },
        { text: "Cerrar sesión", href: "/navhambar/log out" },
    ];

    return (
        <main className={styles.screen}>
            <HamburgerMenu items={menuItems} />
            <div className={styles.bg} />
            <div className={styles.tint} />

            <section className={styles.card}>
                <div className={styles.logoHolder}>
                    <Image src="/assets/mainLogo.png" alt="LudoTime" fill sizes="420px" className={styles.logoImg} priority />
                </div>

                <h2 className={styles.mode}>{modeTitle}</h2>

                <div className={styles.counter}>
                    <span>{players.filter(p => p !== "-").length}/{maxPlayers}</span>
                </div>

                <div className={styles.list}>
                    {players.map((p, i) => (
                        <div className={styles.slot} key={i}>
                            <span className={p === "-" ? styles.empty : ""}>{p}</span>
                        </div>
                    ))}
                </div>

                <p className={styles.status}>esperando jugadores…</p>
                <button className={styles.cta}>Invitar jugadores</button>
            </section>
        </main>
    );
}

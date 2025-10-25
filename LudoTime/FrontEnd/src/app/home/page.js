"use client"

import styles from '../styles/home.module.css'
import HamburgerMenu from "../components/Hamburger-menu";

export default function Home() {

    /* falta completar las direcciones href de cada item hamburger menu */
    const menuItems = [
        { text: "Inicio", href: "completar" },
        { text: "Perfil", href: "completar" },
        { text: "Ayuda", href: "completar" },
        { text: "Configuración", href: "completar" },
        { text: "Cerrar sesión", href: "completar" },
    ];

    return (
        <body className={styles.body}>
            <HamburgerMenu items={menuItems} />

            <main>
                <div className={styles.container}>
                    <h1 className={styles.title}>Bienvenido a LudoTime!</h1>
                    <button className={styles.playbtn} /*onClick */>JUGAR</button><br/>
                    <button className={styles.shopbtn} /*onClick */>TIENDA</button><br/>
                    <button className={styles.scoresbtn} /*onClick */>PUNTAJES GLOBALES</button>
                </div>
            </main>
        </body>
    )
}

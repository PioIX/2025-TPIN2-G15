"use client"

import styles from "../../../styles/tutorial.module.css"
import HamburgerMenu from "../../../components/Hamburger-menu";

export default function TutoPage() {

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
                    <div className={styles.card}>
                        <h1>¿CÓMO JUGAR?</h1>
                        <p>Para jugar al Ludo, cada jugador comienza con 4 fichas en su zona segura. El objetivo es llevar todas tus fichas a la meta antes que los demás. En cada turno, lanzas el dado y avanzas una ficha según el número obtenido. Si caes en una casilla ocupada por otro jugador, su ficha regresa a la zona segura. El primer jugador en llegar con todas sus fichas a la meta gana.</p>
                    </div>
                    <div className={styles.imgdiv}>
                        {/*<Image src=""/>*/}
                    </div>
                </div>
            </main>
        </body>
    )
}

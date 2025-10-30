"use client"

import styles from "../../../styles/tutorial.module.css"
import HamburgerMenu from "../../../components/Hamburger-menu";

export default function TutoPage() {

    const menuItems = [
        { text: "Inicio", href: "../../../home" },
        { text: "Perfil", href: "../../../navhambar/profile" },
        { text: "Ayuda", href: "../../../navhambar/help" },
        { text: "Configuración", href: "../../../navhambar/settings" },
        { text: "Cerrar sesión", href:"../../../navhambar/log out" },
    ];


    return (
        <body className={styles.body}>
            <HamburgerMenu items={menuItems}/>
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

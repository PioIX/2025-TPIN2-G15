"use client"

import styles from "../../../styles/online.module.css";
import HamburgerMenu from "../../../components/Hamburger-menu";

export default function OnlinePage() {

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
                    <button className={`${styles.card} ${styles.classicbtn}`}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>CLASSIC</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.card} ${styles.mathbtn}`}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>MATH</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.card} ${styles.timebtn}`}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>TIME</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>
                </div>
            </main>
        </body>
    )
}

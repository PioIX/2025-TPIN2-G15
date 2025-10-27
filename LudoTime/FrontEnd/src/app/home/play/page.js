"use client"

import { useRouter } from "next/navigation";
import styles from "../../styles/play.module.css"
import HamburgerMenu from "../../components/Hamburger-menu";

export default function PlayPage() {
    const router = useRouter();

    /* falta completar las direcciones href de cada item hamburger menu */
    const menuItems = [
        { text: "Inicio", href: "completar" },
        { text: "Perfil", href: "completar" },
        { text: "Ayuda", href: "completar" },
        { text: "Configuración", href: "completar" },
        { text: "Cerrar sesión", href: "completar" },
    ];

    const irALocal = () => {
        router.push("/home/play/local");
    };

    const irAOnline = () => {
        router.push("/home/play/online");
    };

    const irATutorial = () => {
        router.push("/home/play/tutorial");
    };

    return (
        <body className={styles.body}>
            <HamburgerMenu items={menuItems} />
            <main>
                <div className={styles.container}>
                    <button className={`${styles.localbtn} ${styles.card}`} onClick={irALocal}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>LOCAL</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.onlinebtn} ${styles.card}`} onClick={irAOnline}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>ONLINE</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.tutobtn} ${styles.card}`} onClick={irATutorial}>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>TUTO</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>
                </div>
            </main>
        </body>
    )
}
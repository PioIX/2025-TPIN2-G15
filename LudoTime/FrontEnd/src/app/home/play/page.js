"use client"

import { useRouter } from "next/navigation";
import styles from "../../styles/play.module.css"
import HamburgerMenu from "../../components/Hamburger-menu";

export default function PlayPage() {
    const router = useRouter();

    const menuItems = [
        { text: "Inicio", href: "../../home" },
        { text: "Perfil", href: "../../navhambar/profile" },
        { text: "Ayuda", href: "../../navhambar/help" },
        { text: "Configuración", href: "../../navhambar/settings" },
        { text: "Cerrar sesión", href:"../../navhambar/log out" },
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
"use client"

import { useRouter } from "next/navigation";
import styles from "../../../styles/local.module.css"
import HamburgerMenu from "../../../components/Hamburger-menu";

export default function LocalPage() {
    const router = useRouter();

    const menuItems = [
        { text: "Inicio", href: "../../../home" },
        { text: "Perfil", href: "../../../navhambar/profile" },
        { text: "Ayuda", href: "../../../navhambar/help" },
        { text: "Configuración", href: "../../../navhambar/settings" },
        { text: "Cerrar sesión", href: "../../../navhambar/log out" },
    ];

    return (
        <div className={styles.body}>
            <HamburgerMenu items={menuItems} />
            <main>
                <div className={styles.container}>
                    <button
                        className={`${styles.card} ${styles.classicbtn}`}
                        onClick={() => router.push("/home/play/local/classic")}
                    >
                        <div className={styles.overlay}></div>
                        <div className={styles.content}>
                            <span className={styles.title}>CLASSIC</span>
                            <span className={styles.desc}>El Ludo de toda la vida. Para los más clásicos y puristas!</span>
                        </div>
                    </button>

                    <button
                        className={`${styles.card} ${styles.mathbtn}`}
                        onClick={() => router.push("/home/play/local/math")}
                    >
                        <div className={styles.overlay}></div>
                        <div className={styles.content}>
                            <span className={styles.title}>MATH</span>
                            <span className={styles.desc}>Dedicado a matemáticos puros. ¡Acá gana más la mente que la suerte!</span>
                        </div>
                    </button>

                    <button
                        className={`${styles.card} ${styles.timebtn}`}
                        onClick={() => router.push("/home/play/local/time")}
                    >
                        <div className={styles.overlay}></div>
                        <div className={styles.content}>
                            <span className={styles.title}>TIME</span>
                            <span className={styles.desc}>El modo predeterminado de LUDOTIME!</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    )
}

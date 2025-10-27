"use client"

import { useRouter } from "next/navigation";
import styles from "../../../styles/local.module.css"
import HamburgerMenu from "../../../components/Hamburger-menu";

export default function LocalPage() {
    const router = useRouter();

    /* falta completar las direcciones href de cada item hamburger menu */
    const menuItems = [
        { text: "Inicio", href: "completar" },
        { text: "Perfil", href: "completar" },
        { text: "Ayuda", href: "completar" },
        { text: "Configuración", href: "completar" },
        { text: "Cerrar sesión", href: "completar" },
    ];

    /* 
    const irALocal = () => {
        router.push("/home/play/local");
    };

    const irAOnline = () => {
        router.push("/home/play/online");
    };

    const irATutorial = () => {
        router.push("/home/play/tutorial");
    };
    */

    return (
        <body className={styles.body}>
            <HamburgerMenu items={menuItems} />
            <main>
                <div className={styles.container}>
                    <button className={`${styles.card} ${styles.classicbtn}`} /*onClick={}*/>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>CLASSIC</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.card} ${styles.mathbtn}`} /*onClick={}*/>
                        <div className={styles.overlay}></div> {/* NO BORRAR SIRVE PARA DIFUMINAR EL BOTON*/}
                        <div className={styles.content}>
                            <span className={styles.title}>MATH</span>
                            <span className={styles.desc}>AGREGAR DESCRIPCION CLARA DESPUES</span>
                        </div>
                    </button>

                    <button className={`${styles.card} ${styles.timebtn}`} /*onClick={}*/>
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

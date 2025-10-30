"use client"

import { useRouter } from "next/navigation";
import styles from '../styles/home.module.css'
import HamburgerMenu from "../components/Hamburger-menu";

export default function Home() {
    const router = useRouter();
    
    const menuItems = [
        { text: "Inicio", href: "../home" },
        { text: "Perfil", href: "../navhambar/profile" },
        { text: "Ayuda", href: "../navhambar/help" },
        { text: "Configuración", href: "../navhambar/settings" },
        { text: "Cerrar sesión", href:"../navhambar/log out" },
    ];

    const irAJugar = () => {
        router.push("/home/play");
    };

    const irATienda = () => {
        router.push("/home/shop");
    };

    const irAPuntajes = () => {
        router.push("/home/scores");
    };

    return (
        <main className={styles.body}>
            <HamburgerMenu items={menuItems} />
            <div className={styles.container}>
                <h1 className={styles.title}>Bienvenido a LudoTime!</h1>
                <button className={styles.playbtn} onClick={irAJugar}>JUGAR</button><br/>
                <button className={styles.shopbtn} onClick={irATienda}>TIENDA</button><br/>
                <button className={styles.scoresbtn} onClick={irAPuntajes}>PUNTAJES GLOBALES</button>
            </div>
        </main>
    )
}

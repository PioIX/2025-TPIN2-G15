"use client"

import { useRouter } from "next/navigation";
import styles from '../styles/home.module.css'
import HamburgerMenu from "../components/Hamburger-menu";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
    const router = useRouter();
    
    const menuItems = [
        { text: "Inicio", href: "../home" },
        { text: "Perfil", href: "../navhambar/profile" },
        { text: "Reglas", href: "../navhambar/rules" },
        { text: "Cerrar sesión", href:"../navhambar/logout" },
    ];

    const irAJugar = () => {
        router.push("/home/play");
    };

    const irATienda = () => {
        router.push("/home/shop");
    };

    // const irAPuntajes = () => {
    //     router.push("/home/scores");
    // };



    //todo esto es para que salga el nombre del usuario en la pantalla de inicio
    const [nombre, setNombre] = useState("");

    useEffect(() => {
      try {
        // Buscar en localStorage primero
        let userJson = window.localStorage.getItem("lt_user");
        
        // Si no está en localStorage, buscar en sessionStorage
        if (!userJson) {
          userJson = window.sessionStorage.getItem("lt_user");
        }

        if (userJson) {
          const user = JSON.parse(userJson);
          setNombre(user.nombre || user.name || ""); // por si el campo se llama 'name' o 'nombre'
        }
      } catch (error) {
        console.error("Error al obtener el nombre:", error);
      }
    }, []);






    return (
        <main className={styles.body}>
            <HamburgerMenu items={menuItems} />
            <div className={styles.container}>
                <h1 className={styles.title}>¡Bienvenido, {nombre || "usuario"}!</h1>
                <button className={styles.playbtn} onClick={irAJugar}>JUGAR</button><br/>
                <button className={styles.shopbtn} onClick={irATienda}>TIENDA</button><br/>
                
                {/* ESTO ES PORQUE NO LO HICIMOS FUNCIONAL */}
                {/*<button className={styles.scoresbtn} onClick={irAPuntajes}>PUNTAJES GLOBALES</button>*/}
                
            </div>
            <div className={styles.imgdiv}>
                <Image src="/assets/classicimage.png"
                alt="Tablero de ludo"
                width={550}
                height={550}
                className={styles["spinning-img"]} //me estoy hartando de poner todo en ingles
                />
                <Image src="/assets/mainLogo.png"
                alt="Logo de LudoTime"
                width={725}
                height={150}
                className={styles.logo}
                />
            </div>
        </main>
    )
}

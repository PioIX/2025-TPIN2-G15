"use client";

import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";
/*import logo from "/public/assets/ludotime-logo.png";
import fondo from "/public//assets/fondo-dados.png";*/

export default function LoginPage() {
  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${fondo.src})` }}
    >
      <div className={styles.card}>
        <Image src={logo} alt="LudoTime" className={styles.logo} />
        <h2 className={styles.title}>Login</h2>

        <form className={styles.form}>
          <input
            type="email"
            placeholder="Ingrese su correo electrónico..."
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Ingrese su contraseña..."
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

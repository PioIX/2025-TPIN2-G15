"use client";

import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";
import logo from "../../../public/assets/mainLogo.png";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Image
        src={logo}
        alt="LudoTime"
        className={styles.logo}
        priority
      />

      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Ingrese su correo electrónico..."
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Ingrese una contraseña..."
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Iniciar Sesion
          </button>
        </form>
      </div>
    </div>
  );
}
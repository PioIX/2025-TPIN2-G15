"use client";

import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";
import logo from "../../../public/assets/mainLogo.png";

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <Image
        src={logo}
        alt="LudoTime"
        className={styles.logo}
        priority
      />

      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Ingrese su nombre de usuario..."
            className={styles.input}
            required
          />
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
            Siguiente
          </button>
        </form>
      </div>
    </div>
  );
}

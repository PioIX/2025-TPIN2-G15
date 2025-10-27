"use client";

import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

export default function LoginPage() {
  return (
    <main className={styles.screen}>
      <div className={styles.bg} />
      <div className={styles.tint} />

      <section className={styles.cardWrap}>
        <div className={styles.logoHolder}>
          <Image
            src="/assets/mainLogo.png"
            alt="LudoTime"
            fill
            sizes="320px"
            priority
            className={styles.logoImg}
          />
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Login</h1>

          <input
            className={styles.input}
            type="email"
            placeholder="Ingrese su correo electrónico..."
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Ingrese un contraseña..."
          />

          <button className={styles.cta}>Iniciar Sesion</button>

          <label className={styles.rememberRow}>
            <input type="checkbox" />
            <span>Recordame...</span>
          </label>
        </div>
      </section>
    </main>
  );
}

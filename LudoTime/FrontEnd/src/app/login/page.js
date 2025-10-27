"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMsg(null);

      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMsg(data.msg || "Error de autenticación");
        return;
      }

      setMsg("¡Bienvenido!");
      router.push("/home");
    } catch (e) {
      setMsg("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.bg} />
      <div className={styles.tint} />

      <section className={styles.cardWrap}>
        <div className={styles.logoHolder}>
          <Image
            src="/assets/ludotime.png"
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
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Ingrese un contraseña..."
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button className={styles.cta} onClick={handleLogin} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesion"}
          </button>

          <label className={styles.rememberRow}>
            <input type="checkbox" />
            <span>Recordame...</span>
          </label>

          {msg && (
            <p style={{ textAlign: "center", marginTop: 10, color: "#1b0431" }}>
              {msg}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setMsg(null);

      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.msg || "Error al registrar");
        return;
      }
      setMsg("✅ Usuario creado con éxito");
      setNombre("");
      setCorreo("");
      setContrasena("");
      // redirigir a /login si querés
      // router.push("/login")
    } catch (e) {
      setMsg("Error de red");
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
          <Image src="/assets/mainLogo.png" alt="LudoTime" fill sizes="320px" priority className={styles.logoImg} />
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Register</h1>

          <input className={styles.input} type="text" placeholder="Ingrese su nombre de usuario..."
            value={nombre} onChange={(e) => setNombre(e.target.value)} />

          <input className={styles.input} type="email" placeholder="Ingrese su correo electrónico..."
            value={correo} onChange={(e) => setCorreo(e.target.value)} />

          <input className={styles.input} type="password" placeholder="Ingrese un contraseña..."
            value={contrasena} onChange={(e) => setContrasena(e.target.value)} />

          <button className={styles.cta} onClick={handleRegister} disabled={loading}>
            {loading ? "Creando..." : "Siguiente"}
          </button>

          <label className={styles.rememberRow}>
            <input type="checkbox" />
            <span>Recordame...</span>
          </label>

          {msg && (
            <p style={{ textAlign: "center", marginTop: 10, color: "#1b0431" }}>{msg}</p>
          )}
        </div>
      </section>
    </main>
  );
}

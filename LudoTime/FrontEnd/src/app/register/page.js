"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const KEY_REMEMBER_EMAIL = "lt_remember_email";
const KEY_REMEMBER_FLAG = "lt_remember_flag";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    try {
      const flag = window.localStorage.getItem(KEY_REMEMBER_FLAG) === "1";
      setRemember(flag);
      if (flag) {
        const saved = window.localStorage.getItem(KEY_REMEMBER_EMAIL) || "";
        if (saved) setCorreo(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (remember) {
        window.localStorage.setItem(KEY_REMEMBER_EMAIL, correo || "");
      }
    } catch {}
  }, [correo, remember]);

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
      if (!res.ok || !data.ok) {
        setMsg(data.msg || "Error al registrar");
        return;
      }

      try {
        window.localStorage.setItem(KEY_REMEMBER_FLAG, remember ? "1" : "0");
        if (remember) window.localStorage.setItem(KEY_REMEMBER_EMAIL, correo || "");
        else window.localStorage.removeItem(KEY_REMEMBER_EMAIL);
      } catch {}

      setMsg("Usuario creado con éxito");
      setNombre("");
      setCorreo("");
      setContrasena("");

      // pequeño redirect automático
      setTimeout(() => { window.location.href = "/login"; }, 1200);
    } catch {
      setMsg("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.bg}/>
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
          <h1 className={styles.title}>Register</h1>

          <input
            className={styles.input}
            type="text"
            placeholder="Ingrese su nombre de usuario..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

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
            placeholder="Ingrese una contraseña..."
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button className={styles.cta} onClick={handleRegister} disabled={loading}>
            {loading ? "Creando..." : "Siguiente"}
          </button>

          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => {
                const checked = e.target.checked;
                setRemember(checked);
                try {
                  window.localStorage.setItem(KEY_REMEMBER_FLAG, checked ? "1" : "0");
                  if (!checked) window.localStorage.removeItem(KEY_REMEMBER_EMAIL);
                  else window.localStorage.setItem(KEY_REMEMBER_EMAIL, correo || "");
                } catch {}
              }}
            />
            <span>Recordame...</span>
          </label>

          <p className={styles.swapText}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className={styles.swapLink}>Inicia sesión</Link>
          </p>

          {msg && <p className={styles.msg}>{msg}</p>}
        </div>
      </section>
    </main>
  );
}
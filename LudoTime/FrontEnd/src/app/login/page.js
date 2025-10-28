"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const KEY_USER = "lt_user";
const KEY_REMEMBER_EMAIL = "lt_remember_email";
const KEY_REMEMBER_FLAG = "lt_remember_flag";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    try {
      const rememberFlag =
        typeof window !== "undefined" &&
        window.localStorage.getItem(KEY_REMEMBER_FLAG) === "1";
      setRemember(rememberFlag);

      if (rememberFlag) {
        const rememberedEmail =
          window.localStorage.getItem(KEY_REMEMBER_EMAIL) || "";
        if (rememberedEmail) setCorreo(rememberedEmail);
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

      window.localStorage.removeItem(KEY_USER);
      window.sessionStorage.removeItem(KEY_USER);

      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem(KEY_USER, JSON.stringify(data.user));

      window.localStorage.setItem(KEY_REMEMBER_FLAG, remember ? "1" : "0");
      if (remember)
        window.localStorage.setItem(KEY_REMEMBER_EMAIL, correo || "");
      else window.localStorage.removeItem(KEY_REMEMBER_EMAIL);

      setMsg("Login exitoso");
      router.push("/home");
    } catch {
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

          {/* NUEVO TEXTO DE ENLACE */}
          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "15px",
              color: "#1b0431",
            }}
          >
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              style={{ textDecoration: "underline", fontWeight: "600" }}
            >
              Regístrate
            </Link>
          </p>

          {msg && (
            <p
              style={{ textAlign: "center", marginTop: 10, color: "#1b0431" }}
            >
              {msg}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

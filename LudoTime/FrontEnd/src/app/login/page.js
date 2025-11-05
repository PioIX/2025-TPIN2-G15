"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/LoginRegister.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// claves de storage (mantenemos consistencia con Register)
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

  // estado inicial del remember y correo guardado
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

  // si cambia correo y remember está activo, persistimos
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

      const url = API_URL + "/api/login";
      console.log("Login URL:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.msg || "Error de autenticación");
        return;
      }

      // limpiar restos y guardar sesión según remember
      try {
        window.localStorage.removeItem(KEY_USER);
        window.sessionStorage.removeItem(KEY_USER);
        const storage = remember ? window.localStorage : window.sessionStorage;
        storage.setItem(KEY_USER, JSON.stringify(data.user));
        window.localStorage.setItem(KEY_REMEMBER_FLAG, remember ? "1" : "0");
        if (remember) window.localStorage.setItem(KEY_REMEMBER_EMAIL, correo || "");
        else window.localStorage.removeItem(KEY_REMEMBER_EMAIL);
      } catch {}

      router.push("/home");
    } catch {
      setMsg("Error de red. Intenta de nuevo.");
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
            placeholder="Ingrese una contraseña..."
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button className={styles.cta} onClick={handleLogin} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
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
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className={styles.swapLink}>Regístrate</Link>
          </p>

          {msg && <p className={styles.msg}>{msg}</p>}
        </div>
      </section>
    </main>
  );
}
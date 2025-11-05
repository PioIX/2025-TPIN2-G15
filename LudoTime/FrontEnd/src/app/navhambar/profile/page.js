"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/app/styles/profile.module.css";
import HamburgerMenu from "../../components/Hamburger-menu";

const KEY_USER = "lt_user";
const KEY_REMEMBER_EMAIL = "lt_remember_email";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { text: "Inicio", href: "../../home" },
        { text: "Perfil", href: "../profile" },
        { text: "Ayuda", href: "../help" },
        { text: "Configuración", href: "../settings" },
        { text: "Cerrar sesión", href:"../log out" },
    ];

    // Cargar datos del usuario si existe sesión
    useEffect(() => {
        try {
            const raw =
                window.localStorage.getItem(KEY_USER) ??
                window.sessionStorage.getItem(KEY_USER);

            if (raw) {
                const parsed = JSON.parse(raw);
                setUser(parsed);
            } else {
                const remembered = window.localStorage.getItem(KEY_REMEMBER_EMAIL);
                setUser({
                    nombre: "[Nombre del usuario]",
                    correo: remembered || "[Correo de Usuario]",
                });
            }
        } catch { }
        setLoading(false);
    }, []);

    const maskedPass = useMemo(() => "•".repeat(10), []);

    const handleLogout = () => {
        try {
            window.localStorage.removeItem(KEY_USER);
            window.sessionStorage.removeItem(KEY_USER);
        } catch { }
        router.push("/login");
    };

    if (loading) {
        return (
            <main className={styles.screen}>
                <div className={styles.bg}/>
                <div className={styles.tint} />
                <header className={styles.topBar}>
                    <h2 className={styles.topTitle}>Perfil de usuario</h2>
                </header>
                <section className={styles.wrap}>
                    <p className={styles.lineBig}>Cargando perfil…</p>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.screen}>
            <HamburgerMenu items={menuItems} />
            <div className={styles.bg}/>
            <div className={styles.tint} />

            <header className={styles.topBar}>
                <h2 className={styles.topTitle}>Perfil de usuario</h2>
            </header>

            <section className={styles.wrap}>
                <div className={styles.logoHolder}>
                    <Image
                        src="/assets/mainLogo.png"
                        alt="LudoTime"
                        fill
                        sizes="320px"
                        className={styles.logoImg}
                        priority
                    />
                </div>

                {/* USER */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.hrLeft} />
                        <h3 className={styles.sectionTitle}>USER:</h3>
                        <span className={styles.hrRight} />
                    </div>

                    <p className={styles.lineBig}>{user?.nombre || "[Nombre del usuario]"}</p>
                    <button className={styles.action} onClick={() => alert("TODO: cambiar nombre")}>
                        cambiar nombre
                    </button>

                    <p className={styles.lineBig}>{user?.correo || "[Correo de Usuario]"}</p>
                    <button className={styles.action} onClick={() => alert("TODO: cambiar correo")}>
                        cambiar correo
                    </button>
                </div>

                {/* CONTRASEÑA */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.hrLeft} />
                        <h3 className={styles.sectionTitle}>CONTRASEÑA:</h3>
                        <span className={styles.hrRight} />
                    </div>

                    <p className={styles.lineBig}>{maskedPass}</p>
                    <button className={styles.action} onClick={() => alert("TODO: cambiar contraseña")}>
                        cambiar contraseña
                    </button>
                </div>

                {/* Cerrar sesión */}
                <div className={styles.logoutBlock}>
                    <h4 className={styles.logoutTitle}>CERRAR SESION</h4>
                    <button className={styles.logoutBtn} aria-label="Cerrar sesión" onClick={handleLogout} />
                </div>
            </section>
        </main>
    );
}


"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/app/styles/logout.module.css";

const KEY_USER = "lt_user";
const KEY_REMEMBER_EMAIL = "lt_remember_email";
const KEY_REMEMBER_FLAG = "lt_remember_flag";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Limpiar automáticamente después de 10 segundos
        const timer = setTimeout(() => {
            handleLogout();
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        try {
            window.localStorage.removeItem(KEY_USER);
            window.sessionStorage.removeItem(KEY_USER);
            // Mantener el email recordado si existía
            // window.localStorage.removeItem(KEY_REMEMBER_EMAIL);
            // window.localStorage.removeItem(KEY_REMEMBER_FLAG);
        } catch {}
        
        router.push("/login");
    };

    const handleCancel = () => {
        router.push("/home");
    };

    return (
        <main className={styles.screen}>
            <div className={styles.bg} />
            <div className={styles.tint} />

            <section className={styles.card}>
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

                <div className={styles.content}>
                    <h1 className={styles.title}>¿Cerrar sesión?</h1>
                    <p className={styles.message}>
                        Estás a punto de cerrar tu sesión en LudoTime
                    </p>

                    <div className={styles.buttons}>
                        <button 
                            className={styles.confirmBtn}
                            onClick={handleLogout}
                        >
                            Sí, cerrar sesión
                        </button>
                        <button 
                            className={styles.cancelBtn}
                            onClick={handleCancel}
                        >
                            Cancelar
                        </button>
                    </div>

                    <p className={styles.countdown}>
                        Cerrando sesión automáticamente en 10 segundos...
                    </p>
                </div>
            </section>
        </main>
    );
}

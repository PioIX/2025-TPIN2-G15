"use client";

import Image from "next/image";
import styles from "@/app/styles/shop.module.css";
import HamburgerMenu from "../../components/Hamburger-menu";


export default function ShopPage() {
    const menuItems = [
        { text: "Inicio", href: "completar" },
        { text: "Perfil", href: "completar" },
        { text: "Ayuda", href: "completar" },
        { text: "Configuración", href: "completar" },
        { text: "Cerrar sesión", href: "completar" },
    ];
  return (
    <main className={styles.screen}>
        <HamburgerMenu items={menuItems} />
        <div className={styles.tint} />

        <header className={styles.topBar}>
          <h2 className={styles.topTitle}>TIENDA</h2>
        </header>

        <section className={styles.panel}>
          <h1 className={styles.sectionTitle}>
            ARTICULOS
            <span className={styles.underline} />
          </h1>

          <div className={styles.content}>
            <aside className={styles.leftRail}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.iconSlot}>
                  <Image
                    src="/assets/matheimage.png"
                    alt={`icono ${i}`}
                    fill
                    className={styles.iconImg}
                    sizes="64px"
                  />
                </div>
              ))}
            </aside>

            <div className={styles.divider} />

            <div className={styles.stage}>
              <p className={styles.helper}>
                Selecciona el tipo de<br />artículo en la interfaz de la<br />izquierda
              </p>
            </div>
          </div>
        </section>

    </main>
  );
}

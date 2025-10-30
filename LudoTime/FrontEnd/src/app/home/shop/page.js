"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/app/styles/shop.module.css";
import HamburgerMenu from "../../components/Hamburger-menu";

const CATEGORIES = [
  { key: "dados",   label: "DADOS",   icon: "/assets/shopItems/dados/OverviewDados.png" },
  { key: "fondos",  label: "FONDOS",  icon: "/assets/shopItems/fondos/OverviewFondos.png" },
  { key: "tablero", label: "TABLERO", icon: "/assets/shopItems/tableros/OverviewTablero.png" },
  { key: "fichas",  label: "FICHAS",  icon: "/assets/shopItems/fichas/OverviewFichas.png" },
];


// Mock/ejemplo
const ITEMS = {
  dados: [
    "/assets/dados/d1.png",
    "/assets/dados/d2.png",
    "/assets/dados/d3.png",
    "/assets/dados/d4.png",
    "/assets/dados/d5.png",
    "/assets/dados/d6.png",
  ],
  fondos: [
    "/assets/fondos/f1.png",
    "/assets/fondos/f2.png",
    "/assets/fondos/f3.png",
    "/assets/fondos/f4.png",
    "/assets/fondos/f5.png",
    "/assets/fondos/f6.png",
  ],
  tablero: [
    "/assets/tablero/t1.png",
    "/assets/tablero/t2.png",
    "/assets/tablero/t3.png",
    "/assets/tablero/t4.png",
  ],
  fichas: [
    "/assets/fichas/c1.png",
    "/assets/fichas/c2.png",
    "/assets/fichas/c3.png",
    "/assets/fichas/c4.png",
    "/assets/fichas/c5.png",
    "/assets/fichas/c6.png",
  ],
};

export default function ShopPage() {
  const menuItems = [
    { text: "Inicio", href: "completar" },
    { text: "Perfil", href: "completar" },
    { text: "Ayuda", href: "completar" },
    { text: "Configuración", href: "completar" },
    { text: "Cerrar sesión", href: "completar" },
  ];

  const [active, setActive] = useState("dados");

  const activeLabel = useMemo(
    () => CATEGORIES.find(c => c.key === active)?.label ?? "ARTICULOS",
    [active]
  );

  const items = useMemo(() => ITEMS[active] ?? [], [active]);

  return (
    <main className={styles.screen}>
      <HamburgerMenu items={menuItems} />
      <div className={styles.tint} />

      <header className={styles.topBar}>
        <h2 className={styles.topTitle}>TIENDA</h2>
      </header>

      <section className={styles.panel}>
        <h1 className={styles.sectionTitle}>
          {activeLabel}
          <span className={styles.underline} />
        </h1>

        <div className={styles.content}>
          <aside className={styles.leftRail} aria-label="Categorías de tienda">
            {CATEGORIES.map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => setActive(key)}
                className={`${styles.iconSlot} ${active === key ? styles.iconActive : ""}`}
              >
                <Image
                  src={icon}
                  alt={label}
                  fill
                  className={styles.iconImg}
                  sizes="76px"
                />
              </button>
            ))}
          </aside>

          <div className={styles.divider} />

          <div className={styles.stage}>
            {items.length ? (
              <ul className={styles.itemsGrid}>
                {items.map((src, i) => (
                  <li key={src + i} className={styles.itemCard}>
                    <Image
                      src={src}
                      alt={`Item ${i + 1} de ${activeLabel}`}
                      fill
                      sizes="140px"
                      className={styles.itemImg}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.helper}>
                Selecciona el tipo de<br />artículo en la interfaz de la<br />izquierda
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

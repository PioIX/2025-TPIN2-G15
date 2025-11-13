"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/app/styles/shop.module.css";
import HamburgerMenu from "../../components/Hamburger-menu";

const CATEGORIES = [
  { key: "fondos",  label: "FONDOS",  icon: "/assets/shopItems/fondos/OverviewFondos.png" },
  { key: "tablero", label: "TABLERO", icon: "/assets/shopItems/tableros/OverviewTablero.png" },
  { key: "fichas",  label: "FICHAS",  icon: "/assets/shopItems/fichas/OverviewFichas.png" },
];

// Items con precios - El primero de cada categoría es GRATIS (precio: 0)
const ITEMS = {
  fondos: [
    { src: "/assets/fondos/f1.png", price: 0, name: "Fondo Básico" },
    { src: "/assets/fondos/f2.png", price: 80, name: "Fondo Bosque" },
    { src: "/assets/fondos/f3.png", price: 100, name: "Fondo Océano" },
    { src: "/assets/fondos/f4.png", price: 120, name: "Fondo Espacio" },
    { src: "/assets/fondos/f5.png", price: 180, name: "Fondo Galaxia" },
    { src: "/assets/fondos/f6.png", price: 250, name: "Fondo Épico" },
  ],
  tablero: [
    { src: "/assets/tablero/t1.png", price: 0, name: "Tablero Original" },
    { src: "/assets/tablero/t2.png", price: 200, name: "Tablero Real" },
    { src: "/assets/tablero/t3.png", price: 300, name: "Tablero Premium" },
    { src: "/assets/tablero/t4.png", price: 500, name: "Tablero Elite" },
  ],
  fichas: [
    { src: "/assets/fichas/c1.png", price: 0, name: "Fichas Clásicas" },
    { src: "/assets/fichas/c2.png", price: 60, name: "Fichas Metal" },
    { src: "/assets/fichas/c3.png", price: 90, name: "Fichas Neón" },
    { src: "/assets/fichas/c4.png", price: 120, name: "Fichas Cristal" },
    { src: "/assets/fichas/c5.png", price: 180, name: "Fichas Oro" },
    { src: "/assets/fichas/c6.png", price: 250, name: "Fichas Legendarias" },
  ],
};

export default function ShopPage() {
  const menuItems = [
    { text: "Inicio", href: "../../home" },
    { text: "Perfil", href: "../../navhambar/profile" },
    { text: "Ayuda", href: "../../navhambar/help" },
    { text: "Configuración", href: "../../navhambar/settings" },
    { text: "Cerrar sesión", href: "../../navhambar/log out" },
  ];

  const [active, setActive] = useState("fondos");
  const [userLodux, setUserLodux] = useState(500); // Monedas iniciales del usuario
  const [purchased, setPurchased] = useState(new Set(["fondos-0", "tablero-0", "fichas-0"])); // Items gratuitos ya desbloqueados

  const activeLabel = useMemo(
    () => CATEGORIES.find(c => c.key === active)?.label ?? "ARTICULOS",
    [active]
  );

  const items = useMemo(() => ITEMS[active] ?? [], [active]);

  const handlePurchase = (itemKey, price) => {
    if (purchased.has(itemKey)) {
      alert("¡Ya compraste este artículo!");
      return;
    }

    if (price === 0) {
      setPurchased(prev => new Set([...prev, itemKey]));
      alert("¡Artículo gratis desbloqueado!");
      return;
    }

    if (userLodux < price) {
      alert(`No tienes suficientes Lodux. Necesitas ${price} Lodux pero solo tienes ${userLodux}.`);
      return;
    }

    setUserLodux(prev => prev - price);
    setPurchased(prev => new Set([...prev, itemKey]));
    alert(`¡Artículo comprado por ${price} Lodux!`);
  };

  return (
    <main className={styles.screen}>
      <HamburgerMenu items={menuItems} />
      <div className={styles.tint} />
      
      <header className={styles.topBar}>
        <h2 className={styles.topTitle}>TIENDA</h2>
      </header>

      {/* Contador de Lodux */}
      <div className={styles.loduxCounter}>
        <Image 
          src="/assets/Lodux.png" 
          alt="Lodux" 
          width={32} 
          height={32}
          className={styles.loduxIcon}
        />
        <span className={styles.loduxAmount}>{userLodux}</span>
      </div>

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
                {items.map((item, i) => {
                  const itemKey = `${active}-${i}`;
                  const isPurchased = purchased.has(itemKey);
                  const isFree = item.price === 0;

                  return (
                    <li key={itemKey} className={styles.itemCard}>
                      <div className={styles.itemImageContainer}>
                        <Image
                          src={item.src}
                          alt={`${item.name}`}
                          fill
                          sizes="140px"
                          className={styles.itemImg}
                        />
                      </div>
                      
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        {isPurchased ? (
                          <span className={styles.ownedBadge}>✓ TUYO</span>
                        ) : (
                          <button
                            onClick={() => handlePurchase(itemKey, item.price)}
                            className={`${styles.buyButton} ${isFree ? styles.freeButton : ""}`}
                          >
                            {isFree ? (
                              "GRATIS"
                            ) : (
                              <>
                                <Image 
                                  src="/assets/Lodux.png" 
                                  alt="Lodux" 
                                  width={16} 
                                  height={16}
                                  className={styles.buttonLodux}
                                />
                                {item.price}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
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
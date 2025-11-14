"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/app/styles/shop.module.css";
import HamburgerMenu from "../../components/Hamburger-menu";

const CATEGORIES = [
  { key: "fondos",  label: "FONDOS",  icon: "/assets/shopItems/fondos/OverviewFondos.png" },
  { key: "tablero", label: "TABLERO", icon: "/assets/shopItems/tableros/OverviewTablero.png" },
  { key: "fichas",  label: "FICHAS",  icon: "/assets/shopItems/fichas/OverviewFichas.png" },
];

// URL del API - ajusta según tu configuración
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ShopPage() {
  
  const menuItems = [
    { text: "Inicio", href: "../../home" },
    { text: "Perfil", href: "../../navhambar/profile" },
    { text: "Ayuda", href: "../../navhambar/help" },
    { text: "Configuración", href: "../../navhambar/settings" },
    { text: "Cerrar sesión", href:"../../navhambar/logout" },
  ];

  const [active, setActive] = useState("fondos");
  const [items, setItems] = useState([]);
  const [lodux, setLodux] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [message, setMessage] = useState(null);

  // Obtener ID del usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (e) {
        console.error("Error al parsear datos del usuario:", e);
      }
    }
  }, []);

  // Cargar items y saldo cuando tenemos el userId
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener items
        const itemsRes = await fetch(`${API_URL}/api/shop/items/${userId}`);
        const itemsData = await itemsRes.json();
        
        // Obtener saldo
        const balanceRes = await fetch(`${API_URL}/api/shop/balance/${userId}`);
        const balanceData = await balanceRes.json();

        if (itemsData.ok) setItems(itemsData.items);
        if (balanceData.ok) setLodux(balanceData.lodux);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showMessage("Error al cargar la tienda", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const activeLabel = useMemo(
    () => CATEGORIES.find(c => c.key === active)?.label ?? "ARTICULOS",
    [active]
  );

  // Filtrar items por categoría activa
  const filteredItems = useMemo(() => {
    return items.filter(item => item.categoria === active);
  }, [items, active]);

  // Función para mostrar mensajes
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Función para comprar un item
  const handlePurchase = async (itemId, precio, titulo) => {
    if (!userId) {
      showMessage("Debes iniciar sesión", "error");
      return;
    }

    if (lodux < precio) {
      showMessage(`No tienes suficientes lodux. Necesitas ${precio - lodux} más`, "error");
      return;
    }

    setPurchaseLoading(itemId);

    try {
      const response = await fetch(`${API_URL}/api/shop/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, itemId }),
      });

      const data = await response.json();

      if (data.ok) {
        showMessage(`¡${titulo} comprado con éxito!`, "success");
        setLodux(data.nuevoSaldo);
        
        // Actualizar el estado del item como comprado
        setItems(prevItems =>
          prevItems.map(item =>
            item.idItem === itemId ? { ...item, comprado: 1 } : item
          )
        );
      } else {
        showMessage(data.msg || "Error al comprar", "error");
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      showMessage("Error de conexión", "error");
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <main className={styles.screen}>
      <HamburgerMenu items={menuItems} />
      <div className={styles.tint} />

      <header className={styles.topBar}>
        <h2 className={styles.topTitle}>TIENDA</h2>
        <div className={styles.loduxCounter}>
          <span className={styles.loduxIcon}>💰</span>
          <span className={styles.loduxAmount}>{loading ? "..." : lodux}</span>
          <span className={styles.loduxLabel}>Lodux</span>
        </div>
      </header>

      {/* Mensaje de notificación */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

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
            {loading ? (
              <p className={styles.helper}>Cargando...</p>
            ) : filteredItems.length ? (
              <ul className={styles.itemsGrid}>
                {filteredItems.map((item) => (
                  <li key={item.idItem} className={styles.itemCard}>
                    <div className={styles.itemImageContainer}>
                      {/* Aquí deberías usar la imagen real del item basada en item.clave */}
                      <div className={styles.itemPlaceholder}>
                        {item.titulo}
                      </div>
                    </div>
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemTitle}>{item.titulo}</h3>
                      <div className={styles.itemFooter}>
                        <span className={styles.itemPrice}>
                          💰 {item.precio}
                        </span>
                        {item.comprado ? (
                          <span className={styles.ownedBadge}>✓ Comprado</span>
                        ) : (
                          <button
                            className={styles.buyButton}
                            onClick={() => handlePurchase(item.idItem, item.precio, item.titulo)}
                            disabled={purchaseLoading === item.idItem || lodux < item.precio}
                          >
                            {purchaseLoading === item.idItem ? "..." : "Comprar"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.helper}>
                No hay artículos disponibles en esta categoría
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
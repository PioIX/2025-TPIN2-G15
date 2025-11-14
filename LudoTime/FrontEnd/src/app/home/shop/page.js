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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Mapeo de claves de BD a nombres de carpetas Pack
const PACK_NAME_MAP = {
  // Packs de fichas
  'ficha_insectos': 'Bichos',
  'ficha_brainrot': 'Brainrot',
  'ficha_emoji': 'Emojis',
  'ficha_escudos': 'Furbo',
  'ficha_paises': 'Paises',
  'ficha_planeta': 'Planetas',
  'ficha_poker': 'Poker',
  'ficha_clasicas': 'OverviewFichas',
  
  // Fondos - usando la carpeta Comprables
  'fondo_acuatico': 'FondoAcuatico',
  'fondo_oceanico': 'FondoAcuatico',  // Alias por si en BD está como oceanico
  'fondo_espacial': 'FondoEspacial',
  'fondo_futurista': 'FondoFuturista',
  'fondo_nocturno': 'FondoNocturno',
  
  // Tableros
  'tablero_clasico': 'Clasico',
  'tablero_medieval': 'Medieval',
  'tablero_cyberpunk': 'Cyberpunk',
  'tablero_tropical': 'Tropical',
  'tablero_galactico': 'Galactico',
};

// Imagen individual para el círculo de preview
const CIRCLE_IMAGE_MAP = {
  // Fichas
  'ficha_insectos': 'FichaBichoAmarillo.png',
  'ficha_brainrot': 'FichaBrainrotAmarillo.png',
  'ficha_emoji': 'FichaEmojiAmarillo.png',
  'ficha_escudos': 'FichaFurboAmarillo.png',
  'ficha_paises': 'FichaPaisAmarillo.png',
  'ficha_planeta': 'FichaPlanetaAmarillo.png',
  'ficha_poker': 'FichaPokerAmarilla.png',
  'ficha_clasicas': 'OverviewFichas.png',
  
  // Fondos - miniaturas circulares
  'fondo_acuatico': 'FondoAcuatico.png',
  'fondo_espacial': 'FondoEspacial.png',
  'fondo_futurista': 'FondoFuturista.png',
  'fondo_nocturno': 'FondoNocturno.png',
};

// Imagen completa para el modal
const MODAL_IMAGE_MAP = {
  // Fichas
  'ficha_insectos': 'HoverviewBichosImage.png',
  'ficha_brainrot': 'HoverviewBrainrotsPack.png',
  'ficha_emoji': 'HoverviewEmojisImage.png',
  'ficha_escudos': 'HoverviewFurboImage.png',
  'ficha_paises': 'HoverviewPaisesImage.png',
  'ficha_planeta': 'HoverviewPlanetasImage.png',
  'ficha_poker': 'HoverviewPokerImage.png',
  'ficha_clasicas': 'OverviewFichas.png',
  
  // Fondos - imágenes completas para el modal
  'fondo_acuatico': 'FondoAcuatico.png',
  'fondo_espacial': 'FondoEspacial.png',
  'fondo_futurista': 'FondoFuturista.png',
  'fondo_nocturno': 'FondoNocturno.png',
};

export default function ShopPage() {
  
  const menuItems = [
    { text: "Inicio", href: "../../home" },
    { text: "Perfil", href: "../../navhambar/profile" },
    { text: "Ayuda", href: "../../navhambar/help" },
    { text: "Cerrar sesión", href:"../../navhambar/logout" },
  ];

  const [active, setActive] = useState("fondos");
  const [items, setItems] = useState([]);
  const [lodux, setLodux] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("lt_user") || sessionStorage.getItem("lt_user");
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (e) {
        console.error("Error al parsear datos del usuario:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const itemsRes = await fetch(`${API_URL}/api/shop/items/${userId}`);
        const itemsData = await itemsRes.json();
        
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

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.categoria === active)
      .sort((a, b) => a.precio - b.precio);
  }, [items, active]);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Función para obtener la ruta de la imagen del círculo
  const getCircleImagePath = (item) => {
    const packName = PACK_NAME_MAP[item.clave];
    const circleImage = CIRCLE_IMAGE_MAP[item.clave];
    
    // Para fichas clásicas
    if (item.clave === 'ficha_clasicas') {
      return `/assets/shopItems/${item.categoria}/OverviewFichas.png`;
    }
    
    // Para fondos, usar la carpeta Comprables
    if (item.categoria === 'fondos' && circleImage) {
      return `/assets/shopItems/${item.categoria}/Comprables/${circleImage}`;
    }
    
    // Para fichas con packs
    if (packName && circleImage && item.categoria === 'fichas') {
      return `/assets/shopItems/${item.categoria}/${packName}Pack/${circleImage}`;
    }
    
    // Fallback
    return `/assets/shopItems/${item.categoria}/${item.clave}.png`;
  };

  // Función para obtener la ruta de la imagen del modal
  const getModalImagePath = (item) => {
    const packName = PACK_NAME_MAP[item.clave];
    const modalImage = MODAL_IMAGE_MAP[item.clave];
    
    // Para fichas clásicas
    if (item.clave === 'ficha_clasicas') {
      return `/assets/shopItems/${item.categoria}/OverviewFichas.png`;
    }
    
    // Para fondos, usar la carpeta Comprables
    if (item.categoria === 'fondos' && modalImage) {
      return `/assets/shopItems/${item.categoria}/Comprables/${modalImage}`;
    }
    
    // Para fichas con packs
    if (packName && modalImage && item.categoria === 'fichas') {
      return `/assets/shopItems/${item.categoria}/${packName}Pack/${modalImage}`;
    }
    
    // Fallback
    return `/assets/shopItems/${item.categoria}/${item.clave}.png`;
  };

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
        
        setItems(prevItems =>
          prevItems.map(item =>
            item.idItem === itemId ? { ...item, comprado: 1 } : item
          )
        );
        
        setSelectedItem(null);
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

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
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
                    <div 
                      className={styles.itemImageContainer}
                      onClick={() => openModal(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.itemPlaceholder}>
                        <Image
                          src={getCircleImagePath(item)}
                          alt={item.titulo}
                          fill
                          className={styles.itemPreviewImg}
                          onError={(e) => {
                            const target = e.target;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('span')) {
                              const span = document.createElement('span');
                              span.textContent = item.titulo;
                              span.style.fontSize = '12px';
                              span.style.textAlign = 'center';
                              parent.appendChild(span);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemTitle}>{item.titulo}</h3>
                      <div className={styles.itemFooter}>
                        <span className={styles.itemPrice}>
                          💰 {item.precio}
                        </span>
                        {item.comprado ? (
                          <span className={styles.ownedBadge}>¡Es tuyo!</span>
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

      {/* MODAL */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              ✕
            </button>
            
            <div className={styles.modalImageContainer}>
              <Image
                src={getModalImagePath(selectedItem)}
                alt={selectedItem.titulo}
                fill
                className={styles.modalImage}
                onError={(e) => {
                  const target = e.target;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('div')) {
                    const div = document.createElement('div');
                    div.className = styles.modalPlaceholder;
                    div.textContent = selectedItem.titulo;
                    parent.appendChild(div);
                  }
                }}
              />
            </div>

            <div className={styles.modalInfo}>
              <h2 className={styles.modalTitle}>{selectedItem.titulo}</h2>
              <p className={styles.modalPrice}>💰 {selectedItem.precio} Lodux</p>
              
              {selectedItem.comprado ? (
                <div className={styles.modalOwned}>¡Ya lo tienes!</div>
              ) : (
                <button
                  className={styles.modalBuyButton}
                  onClick={() => handlePurchase(selectedItem.idItem, selectedItem.precio, selectedItem.titulo)}
                  disabled={purchaseLoading === selectedItem.idItem || lodux < selectedItem.precio}
                >
                  {purchaseLoading === selectedItem.idItem ? "Comprando..." : "Comprar Ahora"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
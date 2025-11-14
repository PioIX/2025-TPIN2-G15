"use client";
import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HamburgerMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [lodux, setLodux] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar en localStorage y sessionStorage con la clave correcta
    const userData = localStorage.getItem("lt_user") || sessionStorage.getItem("lt_user");
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Usuario");
        
        if (user.id) {
          fetchLodux(user.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error al parsear usuario:", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [open]);

  const fetchLodux = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/balance/${userId}`);
      const data = await response.json();
      if (data.ok) {
        setLodux(data.lodux);
      }
    } catch (error) {
      console.error("Error al obtener lodux:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar "Configuración"
  const filteredItems = items.filter(item => 
    !item.text.toLowerCase().includes("configuración") &&
    !item.text.toLowerCase().includes("configuracion")
  );

  return (
    <>
      <header className={styles.header}>
        <button
          onClick={() => setOpen(!open)}
          className={`${styles["c-hamburger"]} ${styles["c-hamburger--htx"]} ${
            open ? styles["is-active"] : ""
          }`}
        >
          <span>toggle menu</span>
        </button>
        
        <nav className={`${styles["sub-menu"]} ${open ? styles["oppenned"] : ""}`}>
          <ul className={styles["list-unstyled"]}>
            {filteredItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.text}</a>
              </li>
            ))}
          </ul>

          <div className={styles["menu-footer"]}>
            <h3 className={styles["menu-greeting"]}>¡Hola {userName}!</h3>
            <div className={styles["menu-lodux"]}>
              <span className={styles["lodux-icon"]}>💰</span>
              <span className={styles["lodux-amount"]}>
                {loading ? "..." : lodux}
              </span>
              <span className={styles["lodux-label"]}>Lodux</span>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
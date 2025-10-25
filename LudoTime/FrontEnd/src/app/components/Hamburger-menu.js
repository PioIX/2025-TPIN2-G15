"use client";
import { useState } from "react";
import styles from "../styles/home.module.css";

export default function HamburgerMenu({ items = []}) {
  const [open, setOpen] = useState(false);

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
            {items.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}

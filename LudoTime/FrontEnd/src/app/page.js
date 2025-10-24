"use client";
import styles from "./page.module.css";
import Head from "next/head";

export default function renderdementira() {
  const handleClick = () => {
    window.location.href = "/login";
  };

  return (    
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.overlay}>
        <button className={styles.rectangle}>Clickea para continuar</button>
      </div>
    </div>
  );
}

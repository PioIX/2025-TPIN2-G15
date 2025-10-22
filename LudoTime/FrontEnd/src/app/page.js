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
        <div className={styles.rectangle}>
          <p>Clickea para continuar</p>
        </div>
      </div>
    </div>
  );
}

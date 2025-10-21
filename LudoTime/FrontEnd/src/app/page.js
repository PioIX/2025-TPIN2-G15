"use client";
import styles from "./page.module.css";

export default function renderdementira() {
  const handleClick = () => {
    window.location.href = "/login";
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>LudoTime</h1>
        <div className={styles.rectangle}>
          <p>Clickea para continuar</p>
        </div>
      </div>
    </div>
  );
}

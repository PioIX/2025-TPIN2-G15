"use client";
import styles from "./page.module.css";
import Image from "next/image";

export default function renderdementira() {
  const handleClick = () => {
    window.location.href = "/login";
  };

  return (    
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.overlay}>
        <Image
          src="/assets/mainLogo.png"
          alt="LudoTime"
          width={820}
          height={120}
          priority
          className={styles.logo}
          draggable={false}
        />
        <button className={styles.rectangle}>Clickea para continuar</button>
      </div>
    </div>
  );
}

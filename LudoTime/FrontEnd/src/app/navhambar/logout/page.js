"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import styles from "../../styles/logout.module.css"

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('../../');
    }, 5000);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.bg}/>
      <div className={styles.content}>
        <h1 className={styles.title}>Cerrando sesión...</h1>
        <p className={styles.message}>Te hemos desconectado correctamente.</p>
        <p className={styles.redirect}>Serás redirigido a la página de inicio en unos segundos.</p>
      </div>
    </div>
  );
}

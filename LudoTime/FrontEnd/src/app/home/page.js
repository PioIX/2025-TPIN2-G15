"use client"

import styles from '../styles/home.module.css'

export default function Home() {
    return (
        <body className={styles.body}>
            <header>

            </header>
            <main>
                <div className={styles.container}>
                    <h1 className={styles.title}>Bienvenido a LudoTime!</h1>
                    <button className={styles.playbtn} /*onClick */>JUGAR</button><br/>
                    <button className={styles.shopbtn} /*onClick */>TIENDA</button><br/>
                    <button className={styles.scoresbtn} /*onClick */>PUNTAJES GLOBALES</button>
                </div>
            </main>
        </body>
    )
}

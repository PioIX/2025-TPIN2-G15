"use client"

import styles from "../../styles/play.module.css"

export default function PlayPage() {
    return (
        <body>
            <main>
                <div className={styles.container}>
                    <button className={styles.localbtn} /*onClick */>LOCAL</button>
                    <button className={styles.onlinebtn} /*onClick */>ONLINE</button>
                    <button className={styles.tutobtn} /*onClick */>TUTORIAL</button>
                </div>
            </main>
        </body>
    )
}
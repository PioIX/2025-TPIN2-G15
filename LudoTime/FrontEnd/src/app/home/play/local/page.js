"use client"

import styles from "../../../styles/local.module.css"

export default function LocalPage() {
    return (
        <body>
            <main>
                <div className={styles.container}>
                    <button className={styles.classicbtn} /*onClick */>CLASSIC</button>
                    <button className={styles.mathbtn} /*onClick */>MATH</button>
                    <button className={styles.timebtn} /*onClick */>TIME</button>
                </div>
            </main>
        </body>
    )
}
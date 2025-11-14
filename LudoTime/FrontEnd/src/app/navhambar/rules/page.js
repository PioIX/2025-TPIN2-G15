"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/app/styles/rules.module.css";

export default function RulesPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <main className={styles.screen}>
            <div className={styles.bg} />
            <div className={styles.tint} />
            
            <section className={styles.card}>
                <div className={styles.logoHolder}>
                    <Image
                        src="/assets/mainLogo.png"
                        alt="LudoTime"
                        fill
                        sizes="320px"
                        className={styles.logoImg}
                        priority
                    />
                </div>

                <div className={styles.content}>
                    <h1 className={styles.title}>Cómo jugar</h1>

                    <div className={styles.rulesContainer}>
                        {/* Objetivo del juego */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>🎯 Objetivo</h2>
                            <p className={styles.ruleText}>
                                Ser el primero en llevar las 4 fichas de tu color desde la base hasta el centro del tablero.
                            </p>
                        </div>

                        {/* Inicio del juego */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>🎲 Inicio del juego</h2>
                            <p className={styles.ruleText}>
                                • Cada jugador tiene 4 fichas del mismo color en su base
                            </p>
                            <p className={styles.ruleText}>
                                • Para sacar una ficha de la base debes sacar un <strong>6</strong> en el dado
                            </p>
                            <p className={styles.ruleText}>
                                • Si sacas 6, tiras de nuevo automáticamente
                            </p>
                        </div>

                        {/* Movimiento */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>➡️ Movimiento</h2>
                            <p className={styles.ruleText}>
                                • Mueve tus fichas según el número que salga en el dado
                            </p>
                            <p className={styles.ruleText}>
                                • Las fichas se mueven en sentido horario alrededor del tablero
                            </p>
                            <p className={styles.ruleText}>
                                • Solo puedes mover una ficha por turno
                            </p>
                        </div>

                        {/* Capturar fichas */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>⚔️ Capturar fichas</h2>
                            <p className={styles.ruleText}>
                                • Si caes en una casilla ocupada por una ficha enemiga, la capturas
                            </p>
                            <p className={styles.ruleText}>
                                • La ficha capturada vuelve a su base
                            </p>
                            <p className={styles.ruleText}>
                                • Si capturas una ficha, tiras de nuevo
                            </p>
                            <p className={styles.ruleText}>
                                • Las casillas con <strong>estrellas (★)</strong> son seguras: no puedes capturar ni ser capturado ahí
                            </p>
                        </div>

                        {/* Reglas especiales */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>⭐ Reglas especiales</h2>
                            <p className={styles.ruleText}>
                                • Si sacas <strong>tres 6 seguidos</strong>, pierdes el turno
                            </p>
                            <p className={styles.ruleText}>
                                • Si no tienes movimientos válidos, pierdes el turno automáticamente
                            </p>
                            <p className={styles.ruleText}>
                                • Las casillas de salida (coloreadas) también son seguras
                            </p>
                        </div>

                        {/* Llegada al centro */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>🏁 Llegada al centro</h2>
                            <p className={styles.ruleText}>
                                • Después de dar la vuelta completa, tus fichas entran al camino final de tu color
                            </p>
                            <p className={styles.ruleText}>
                                • Debes llegar <strong>exactamente</strong> al centro (no puedes pasarte)
                            </p>
                            <p className={styles.ruleText}>
                                • El primer jugador en meter las 4 fichas al centro gana
                            </p>
                        </div>

                        {/* Consejos */}
                        <div className={styles.ruleSection}>
                            <h2 className={styles.sectionTitle}>💡 Consejos</h2>
                            <p className={styles.ruleText}>
                                • Intenta mantener fichas en casillas seguras cuando sea posible
                            </p>
                            <p className={styles.ruleText}>
                                • Captura fichas enemigas para retrasar a tus oponentes
                            </p>
                            <p className={styles.ruleText}>
                                • No saques todas tus fichas a la vez si no es necesario
                            </p>
                        </div>
                    </div>

                    <button 
                        className={styles.backBtn}
                        onClick={handleBack}
                    >
                        Volver
                    </button>
                </div>
            </section>
        </main>
    );
}
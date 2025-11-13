"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "../../../../styles/lobby.module.css";
import HamburgerMenu from "../../../../components/Hamburger-menu";
import { useGameSocket } from "../../../../hooks/useSocket";

export default function ClassicLobby() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room'); // Por si vienen de un link de invitación
    
    // TODO: Obtener del contexto de autenticación
    const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
    const [userName] = useState('Jugador ' + Math.floor(Math.random() * 1000));
    
    const {
        isConnected,
        error,
        roomId,
        players,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        invitePlayers
    } = useGameSocket(userId, userName);

    const [showInviteLink, setShowInviteLink] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    const modeTitle = "Clásico";
    const maxPlayers = 4;

    // Crear sala automáticamente al cargar
    useEffect(() => {
        if (isConnected && !roomId) {
            if (roomCode) {
                // Si vienen con código, unirse a esa sala
                joinRoom(roomCode);
            } else {
                // Si no, crear nueva sala
                createRoom('classic');
            }
        }
    }, [isConnected]);

    // Formatear lista de jugadores para mostrar
    const playerSlots = Array(maxPlayers).fill('-').map((_, i) => {
        return players[i]?.userName || '-';
    });

    const handleInvite = () => {
        const link = invitePlayers();
        if (link) {
            setInviteLink(link);
            setShowInviteLink(true);
            // Copiar al portapapeles
            alert('¡Link copiado al portapapeles!');
        }
    };

    const handleStartGame = () => {
        if (players.length >= 2) { // Mínimo 2 jugadores
            startGame();
            // El servidor emitirá 'game-start' y puedes redirigir
            router.push(`/game/${roomId}`);
        } else {
            alert('Se necesitan al menos 2 jugadores para comenzar');
        }
    };

    const handleLeave = () => {
        leaveRoom();
        router.push('/home');
    };

    const menuItems = [
        { text: "Inicio", href: "/home" },
        { text: "Perfil", href: "/navhambar/profile" },
        { text: "Ayuda", href: "/navhambar/help" },
        { text: "Configuración", href: "/navhambar/settings" },
        { text: "Cerrar sesión", href: "/navhambar/log out" },
    ];

    return (
        <main className={styles.screen}>
            <HamburgerMenu items={menuItems} />
            <div className={styles.bg} />
            <div className={styles.tint} />

            <section className={styles.card}>
                <div className={styles.logoHolder}>
                    <Image 
                        src="/assets/mainLogo.png" 
                        alt="LudoTime" 
                        fill 
                        sizes="420px" 
                        className={styles.logoImg} 
                        priority 
                    />
                </div>

                <h2 className={styles.mode}>{modeTitle}</h2>

                {/* Indicador de conexión */}
                <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px',
                    fontSize: '12px',
                    color: isConnected ? '#4ade80' : '#f87171'
                }}>
                    {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </div>

                {/* Código de sala */}
                {roomId && (
                    <div style={{ fontSize: '14px', marginTop: '10px', color: '#888' }}>
                        Código de sala: <strong>{roomId.slice(0, 6).toUpperCase()}</strong>
                    </div>
                )}

                <div className={styles.counter}>
                    <span>{players.length}/{maxPlayers}</span>
                </div>

                <div className={styles.list}>
                    {playerSlots.map((p, i) => (
                        <div className={styles.slot} key={i}>
                            <span className={p === "-" ? styles.empty : ""}>
                                {p === "-" ? "Esperando..." : p}
                            </span>
                        </div>
                    ))}
                </div>

                <p className={styles.status}>
                    {players.length < 2 
                        ? "esperando jugadores…" 
                        : "¡Listos para comenzar!"}
                </p>

                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
                    <button className={styles.cta} onClick={handleInvite}>
                        Invitar jugadores
                    </button>
                    
                    {players.length >= 2 && (
                        <button 
                            className={styles.cta} 
                            onClick={handleStartGame}
                            style={{ background: '#4ade80' }}
                        >
                            Iniciar juego
                        </button>
                    )}

                    <button 
                        className={styles.cta} 
                        onClick={handleLeave}
                        style={{ background: '#f87171' }}
                    >
                        Salir
                    </button>
                </div>

                {showInviteLink && (
                    <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '8px',
                        fontSize: '12px'
                    }}>
                        <p>Comparte este link:</p>
                        <code style={{ 
                            display: 'block', 
                            padding: '5px', 
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            marginTop: '5px',
                            wordBreak: 'break-all'
                        }}>
                            {inviteLink}
                        </code>
                    </div>
                )}

                {error && (
                    <div style={{ 
                        marginTop: '10px', 
                        color: '#f87171',
                        fontSize: '12px'
                    }}>
                        Error: {error}
                    </div>
                )}
            </section>
        </main>
    );
}
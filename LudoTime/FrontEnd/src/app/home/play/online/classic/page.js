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

    // Callback para redirigir cuando el juego inicia
    const handleGameStart = (data) => {
        console.log('🎮 Redirigiendo al juego:', data);
        router.push(`/home/play/online/classic/game?room=${data.roomId}&players=${data.players.length}`);
    };

    const {
        isConnected,
        error,
        roomId,
        players,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame
    } = useGameSocket(userId, userName, handleGameStart);

    const [showInviteLink, setShowInviteLink] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    const modeTitle = "Clásico";
    const maxPlayers = 4;

    // Crear sala o unirse según el parámetro de URL
    useEffect(() => {
        if (isConnected && !roomId && roomCode) {
            // Si vienen con código en la URL, unirse a esa sala
            joinRoom(roomCode);
        }
        // Si no hay roomCode en la URL, el usuario debe elegir crear o unirse manualmente
    }, [isConnected, roomCode, roomId]);

    const handleJoinWithCode = () => {
        if (joinCode.trim().length >= 9) {
            // Convertir el código a formato de roomId
            const fullRoomId = 'room-' + joinCode.toLowerCase();
            console.log('🔑 Código ingresado:', joinCode);
            console.log('🔑 RoomId construido:', fullRoomId);
            joinRoom(fullRoomId);
        } else {
            alert('Por favor ingresa un código válido de 9 caracteres');
        }
    };

    // Formatear lista de jugadores para mostrar
    const playerSlots = Array(maxPlayers).fill('-').map((_, i) => {
        return players[i]?.userName || '-';
    });

    const handleInvite = () => {
        if (roomId) {
            // Generar código simple de 9 caracteres
            // roomId tiene formato "room-XXXXXXXXX", extraemos los 9 caracteres después de "room-"
            const code = roomId.substring(5).toUpperCase();
            console.log('📋 RoomId completo:', roomId);
            console.log('📋 Código extraído:', code);
            console.log('📋 Longitud del código:', code.length);

            setInviteLink(code);
            setShowInviteLink(true);

            // Copiar al portapapeles
            navigator.clipboard.writeText(code).then(() => {
                alert('¡Código copiado al portapapeles! Compártelo con tus amigos: ' + code);
            }).catch(() => {
                alert('Código de sala: ' + code);
            });
        }
    };

    const handleStartGame = () => {
        if (players.length >= 2) { // Mínimo 2 jugadores
            startGame();
            // No redirigir aquí, esperar el evento 'game-start' del servidor
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

                {/* Mostrar opciones si no hay roomId */}
                {!roomId && !showJoinInput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '20px' }}>
                        <button
                            className={styles.cta}
                            onClick={() => createRoom('classic')}
                            style={{ background: '#4ade80' }}
                        >
                            Crear nueva sala
                        </button>
                        <button
                            className={styles.cta}
                            onClick={() => setShowJoinInput(true)}
                            style={{ background: '#3b82f6' }}
                        >
                            Unirse con código
                        </button>
                    </div>
                )}

                {/* Mostrar input para ingresar código */}
                {!roomId && showJoinInput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '20px' }}>
                        <input
                            type="text"
                            placeholder="Código de 9 caracteres"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={9}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid #444',
                                background: '#222',
                                color: '#fff',
                                fontSize: '16px',
                                textAlign: 'center',
                                letterSpacing: '2px'
                            }}
                        />
                        <button
                            className={styles.cta}
                            onClick={handleJoinWithCode}
                            style={{ background: '#3b82f6' }}
                        >
                            Unirse a sala
                        </button>
                        <button
                            className={styles.cta}
                            onClick={() => setShowJoinInput(false)}
                            style={{ background: '#6b7280' }}
                        >
                            Volver
                        </button>
                    </div>
                )}

                {/* Mostrar botones normales si ya está en una sala */}
                {roomId && (
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
                        <button className={styles.cta} onClick={handleInvite}>
                            Copiar código de invitación
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
                )}

                {showInviteLink && (
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '2px solid #4ade80'
                    }}>
                        <p style={{ marginBottom: '10px', color: '#4ade80', fontWeight: 'bold' }}>
                            Comparte este código con tus amigos:
                        </p>
                        <code style={{
                            display: 'block',
                            padding: '15px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            letterSpacing: '4px',
                            color: '#4ade80'
                        }}>
                            {inviteLink}
                        </code>
                        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                            Tus amigos deben ingresar este código cuando entren al modo Classic Online
                        </p>
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

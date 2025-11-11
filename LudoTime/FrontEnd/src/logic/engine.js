// ===== engine.js =====
// El “director de orquesta”. Acá conecto reglas + jugadores + turnos.
// Este archivo NO sabe nada de React ni del DOM.

import { PIECES_PER_PLAYER } from "./constants.js";
import { createPiece, rollDice, canMovePiece, applyMove } from "./rules.js";

export class GameEngine {
    // enabledColors: ["red","blue", ...] según los jugadores que agrego en el lobby local
    constructor(enabledColors) {
        this.players = enabledColors.map(color => ({
            color,
            pieces: Array.from({ length: PIECES_PER_PLAYER }, createPiece),
        }));

        this.turnIndex = 0;        // a quién le toca
        this.sixesRow = 0;         // cuento 6 seguidos (3 → penaliza)
        this.state = "rolling";    // "rolling" | "selecting" | "moving" | "finished"
        this.lastRoll = null;
    }

    get currentPlayer() {
        return this.players[this.turnIndex];
    }

    /** Quién está parado en esta casilla del anillo (o null). */
    occupancyAt(trackIndex) {
        for (const p of this.players) {
            for (let i = 0; i < p.pieces.length; i++) {
                const pc = p.pieces[i];
                if (pc.posType === "track" && pc.trackIndex === trackIndex) {
                    return { color: p.color, pieceId: i };
                }
            }
        }
        return null;
    }

    /** Mando una ficha rival a base (lo usa applyMove cuando capturo). */
    sendToBase = (color, pieceId) => {
        const p = this.players.find(pl => pl.color === color);
        const pc = p.pieces[pieceId];
        pc.posType = "base";
        pc.trackIndex = null;
        pc.homeStep = null;
    };

    /** Tiro el dado. La UI muestra el número y me deja elegir ficha. */
    roll() {
        if (this.state !== "rolling") return null;
        const n = rollDice();
        this.lastRoll = n;
        this.state = "selecting";
        return n;
    }

    /** ¿Esta ficha del jugador actual puede moverse con la última tirada? */
    legalMove(pieceId) {
        const player = this.currentPlayer;
        const piece = player.pieces[pieceId];
        return canMovePiece(piece, player.color, this.lastRoll, idx => this.occupancyAt(idx));
    }

    /** Intento mover la ficha seleccionada. Devuelve un evento para animar. */
    move(pieceId) {
        const player = this.currentPlayer;
        const piece = player.pieces[pieceId];

        if (!canMovePiece(piece, player.color, this.lastRoll, idx => this.occupancyAt(idx))) {
            return { error: "Movimiento no permitido" };
        }

        const result = applyMove(
            piece,
            player.color,
            this.lastRoll,
            idx => this.occupancyAt(idx),
            this.sendToBase
        );

        // ¿ganó?
        if (player.pieces.every(pc => pc.posType === "goal")) {
            this.state = "finished";
            return { ...result, winner: player.color };
        }

        // manejo extra-turno por 6, captura o meta (solo 6 acá; captura/meta lo podés detectar por result.kind)
        let extra = false;
        if (this.lastRoll === 6) {
            this.sixesRow += 1;
            if (this.sixesRow < 3) {
                extra = true;
            } else {
                // 3 seis seguidos → chau turno
                this.sixesRow = 0;
                extra = false;
            }
        } else {
            this.sixesRow = 0;
        }

        // listo el movimiento, vuelvo a “rolling” y paso turno si no hay extra
        this.state = "rolling";
        if (!extra) {
            this.turnIndex = (this.turnIndex + 1) % this.players.length;
        }
        return { ...result, extraTurn: extra };
    }
}

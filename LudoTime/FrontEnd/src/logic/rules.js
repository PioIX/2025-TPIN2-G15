// ===== rules.js =====
// Acá no dibujo nada. Solo digo qué se puede y qué no, y cómo se actualiza el estado.

import {
    BOARD_LEN,
    HOME_LEN,
    HOME_ENTRY_INDEX,
    SAFE_INDICES,
    START_INDEX,
    wrap,
} from "./constants.js";

/** Dado clásico 1..6. El de TIME puede reutilizar esto. */
export const rollDice = () => Math.floor(Math.random() * 6) + 1;

/** Estructura base de una ficha. */
export const createPiece = () => ({
    // "base": en casa; "track": en anillo; "home": en pasillo final; "goal": llegó
    posType: "base",
    trackIndex: null, // 0..51 cuando estoy en anillo
    homeStep: null,   // 0..HOME_LEN-1 cuando estoy en pasillo
});

/**
 * ¿Esta ficha puede moverse con este dado?
 * occupancy(idx) me dice si hay alguien parado en la casilla del anillo.
 */
export function canMovePiece(piece, color, dice, occupancy) {
    if (piece.posType === "goal") return false; // ya terminó

    // 1) salir de base: necesito 6 y que la salida no esté ocupada por una mía
    if (piece.posType === "base") {
        if (dice !== 6) return false;
        const start = START_INDEX[color];
        const occ = occupancy(start);
        return !occ || occ.color !== color; // si hay propia, no salgo; si hay rival, es segura, tampoco
    }

    // 2) estoy en el anillo común
    if (piece.posType === "track") {
        const from = piece.trackIndex;
        const entry = HOME_ENTRY_INDEX[color];
        // cuántas casillas faltan para llegar a mi "puerta"
        const distToEntry = (entry - from + BOARD_LEN) % BOARD_LEN;

        if (dice <= distToEntry) {
            // Caigo dentro del anillo. Verifico ocupación.
            const target = wrap(from + dice);
            const occ = occupancy(target);
            if (occ && occ.color === color) return false;       // no me subo a un compañero
            if (occ && SAFE_INDICES.has(target)) return false;  // ni capturo en seguro
            return true;
        } else {
            // Me paso de la puerta → entro a mi pasillo
            const stepsInHome = dice - distToEntry - 1; // -1 por el primer paso es homeStep 0
            return stepsInHome < HOME_LEN; // si me paso de la meta, no va
        }
    }

    // 3) en el pasillo final: necesito no pasarme del último
    if (piece.posType === "home") {
        const next = piece.homeStep + dice;
        return next < HOME_LEN; // exacto a meta se maneja en applyMove
    }

    return false;
}

/**
 * Aplico el movimiento. Acá actualizo el estado y tiro eventos útiles para la UI.
 * sendToBase(color, pieceId) me devuelve una rival a base si la capturo.
 */
export function applyMove(piece, color, dice, occupancy, sendToBase) {
    // Salgo de base
    if (piece.posType === "base") {
        piece.posType = "track";
        piece.trackIndex = START_INDEX[color];
        return { kind: "enterTrack", to: piece.trackIndex };
    }

    // Me muevo por el anillo
    if (piece.posType === "track") {
        const from = piece.trackIndex;
        const entry = HOME_ENTRY_INDEX[color];
        const distToEntry = (entry - from + BOARD_LEN) % BOARD_LEN;

        if (dice <= distToEntry) {
            const target = wrap(from + dice);
            const occ = occupancy(target);
            piece.trackIndex = target;

            // Captura si hay rival y no es seguro
            if (occ && occ.color !== color && !SAFE_INDICES.has(target)) {
                sendToBase(occ.color, occ.pieceId);
                return { kind: "capture", to: target };
            }
            return { kind: "moveTrack", to: target };
        } else {
            // Entro a home
            const stepsInHome = dice - distToEntry - 1;
            piece.posType = "home";
            piece.trackIndex = null;
            piece.homeStep = stepsInHome;

            if (piece.homeStep === HOME_LEN - 1) {
                // justo a meta
                piece.posType = "goal";
                piece.homeStep = null;
                return { kind: "toGoal" };
            }
            return { kind: "enterHome", step: piece.homeStep };
        }
    }

    // Me muevo dentro del pasillo final
    if (piece.posType === "home") {
        piece.homeStep += dice;
        if (piece.homeStep === HOME_LEN - 1) {
            piece.posType = "goal";
            piece.homeStep = null;
            return { kind: "toGoal" };
        }
        return { kind: "moveHome", step: piece.homeStep };
    }

    return { kind: "noop" };
}

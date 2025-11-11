// ===== constants.js =====
// Todo lo "duro" del tablero vive acá. Si mañana cambio el layout, toco esto y no rompo reglas.

/** Colores en el orden en que recorremos el circuito (antihorario en mi diseño). */
export const COLORS = ["red", "blue", "yellow", "green"];

/** Largo del anillo común (las casillas por la pista de todos). */
export const BOARD_LEN = 52;

/** Largo de la recta final (las 6 casillas hacia el centro). */
export const HOME_LEN = 6;

/** Fichas por jugador. */
export const PIECES_PER_PLAYER = 4;

/**
 * Casilla de SALIDA de cada color dentro del anillo común.
 * Ojo: estos índices son lógicos (0..51). Más adelante los mapeo a celdas del grid.
 */
export const START_INDEX = {
    red: 0,
    blue: 13,
    yellow: 26,
    green: 39,
};

/**
 * Casilla "puerta" de cada color. Si la paso con mi tirada, entro a mi recta final.
 * Es la que está justo antes de meterme a mi pasillo de color.
 */
export const HOME_ENTRY_INDEX = {
    red: 50,
    blue: 11,
    yellow: 24,
    green: 37,
};

/**
 * Casillas seguras: estrellas + salidas (en seguro no capturo).
 * Si tu diseño cambia, actualizo este set y listo.
 */
export const SAFE_INDICES = new Set([
    0, 8, 13, 21, 26, 34, 39, 47, // estrellas típicas (ajustar si hace falta)
    // también cuento las salidas como seguras
    0, 13, 26, 39,
]);

/** Sumar posiciones dentro del anillo sin salirse. */
export const wrap = (i) => ((i % BOARD_LEN) + BOARD_LEN) % BOARD_LEN;

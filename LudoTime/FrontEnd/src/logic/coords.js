// ===== coords.js =====
// Tablero 15x15. (0,0) arriba-izquierda.  (fila, col) 0..14.
// Si cambio el diseño, muevo coordenadas acá y no rompo el resto.

// celdas del anillo común (52). Orden antihorario.
// OJO: esto es el layout típico de ludo 15x15 (cruz central 3 de ancho).
// Si alguna casilla te queda corrida con tu png, la ajusto rápido.
export const TRACK = [
    // Arranco en la salida roja (debajo del centro) y voy antihorario.
    // centro = (7,7). Pasillo rojo sube por col 7 desde fila 13→8, así que
    // la salida roja está en (13,7) y el primer paso hacia la derecha es (13,8).
    [13, 8], [13, 9], [13, 10], [13, 11], [12, 11], [11, 11], [10, 11], [9, 11], [8, 11],
    [8, 12], [8, 13], [7, 13], [6, 13], [5, 13], [4, 13], [4, 12], [4, 11], [4, 10], [4, 9],
    [4, 8], [3, 8], [2, 8], [1, 8], [1, 7],
    [1, 6], [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
    [8, 2], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [13, 2], [13, 3], [13, 4],
    [12, 4], [11, 4], [10, 4], [9, 4], [8, 4], [8, 5], [8, 6], [8, 7],
];
// por si me quiero indexar por id -> fila/col rápido
export const TRACK_MAP = TRACK.map(([r, c]) => ({ r, c }));

// puertas de cada color (última casilla del anillo antes de meterse al pasillo)
export const HOME_ENTRY_INDEX = {
    red: 51,      // viene subiendo por col 7 y “entra” hacia arriba
    blue: 12,     // derecha → entra a la izquierda
    yellow: 25,   // arriba → entra hacia abajo
    green: 38,    // izquierda → entra hacia la derecha
};

// celdas “seguras” (estrellas + salidas). Estas NO capturan.
export const SAFE_CELLS = new Set([
    // estrellas (ajusto a tu png estándar)
    `${3},6`, `${6},3`, `${11},12`, `${12},11`,
    `${6},11`, `${3},8`, `${11},6`, `${8},3`,
    // salidas
    `${13},7`, `${7},13`, `${1},7`, `${7},1`,
]);

// salidas (donde aparece la ficha con un 6)
export const START_OF = {
    red: [13, 7],
    blue: [7, 13],
    yellow: [1, 7],
    green: [7, 1],
};

// slots “base” (4 por color) para dibujar fichas en casa
export const BASE_SLOTS = {
    red: [[13, 3], [13, 5], [11, 3], [11, 5]],
    blue: [[11, 9], [11, 11], [13, 9], [13, 11]],
    yellow: [[1, 9], [1, 11], [3, 9], [3, 11]],
    green: [[3, 3], [3, 5], [1, 3], [1, 5]],
};

// pasillos (6 pasos) hacia meta por color
export const HOME_PATH = {
    // el step 0 es el primero que pisa al salir del anillo
    red: [[12, 7], [11, 7], [10, 7], [9, 7], [8, 7], [7, 7]],
    blue: [[7, 12], [7, 11], [7, 10], [7, 9], [7, 8], [7, 7]],
    yellow: [[2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]],
    green: [[7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]],
};

// Atajo para comparar coords -> string
export const key = (r, c) => `${r},${c}`;

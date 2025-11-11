// coords.js — “mis coordenadas del tablero hechas a mano”
// Nota: 15x15, origen (0,0) arriba-izquierda.

// util
export const key = (r, c) => `${r}:${c}`;

// 1) Anillo de 52 casillas (orden antihorario; ajustalo si querés otro orden)
export const TRACK_MAP = [];
(() => {
    // Caminito rectangular externo (bordes “pasables”)
    // Arriba: (6,0) -> (6,5)
    for (let c = 0; c <= 5; c++) TRACK_MAP.push({ r: 6, c });
    // Subo a (5,6) y voy hacia arriba
    for (let r = 5; r >= 0; r--) TRACK_MAP.push({ r, c: 6 });
    // Derecha: (0,7) -> (5,7)
    for (let r = 0; r <= 5; r++) TRACK_MAP.push({ r, c: 7 });
    // (6,8) -> (6,13)
    for (let c = 8; c <= 13; c++) TRACK_MAP.push({ r: 6, c });
    // (7,13) -> (13,13) hacia abajo
    for (let r = 7; r <= 13; r++) TRACK_MAP.push({ r, c: 13 });
    // (13,12) -> (13,8) izquierda
    for (let c = 12; c >= 8; c--) TRACK_MAP.push({ r: 13, c });
    // (12,7) -> (7,7) arriba
    for (let r = 12; r >= 7; r--) TRACK_MAP.push({ r, c: 7 });
    // (7,6) -> (13,6) abajo
    for (let r = 7; r <= 13; r++) TRACK_MAP.push({ r, c: 6 });
    // (13,5) -> (13,1) izquierda
    for (let c = 5; c >= 1; c--) TRACK_MAP.push({ r: 13, c });
    // (12,0) -> (7,0) arriba
    for (let r = 12; r >= 7; r--) TRACK_MAP.push({ r, c: 0 });
    // (7,1) -> (7,5) derecha
    for (let c = 1; c <= 5; c++) TRACK_MAP.push({ r: 7, c });
})();

// 2) Casillas de salida (donde caen las fichas al “sacar del hogar”)
export const START_OF = {
    green: [7, 1], // izquierda
    yellow: [1, 7], // arriba
    blue: [7, 13], // derecha
    red: [13, 7], // abajo
};

// 3) Pasillos al centro (5 pasos típicos, ajustá si tu diseño usa 6)
export const HOME_PATH = {
    green: [
        [7, 2],
        [7, 3],
        [7, 4],
        [7, 5],
        [7, 6],
    ],
    yellow: [
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
    ],
    blue: [
        [7, 12],
        [7, 11],
        [7, 10],
        [7, 9],
        [7, 8],
    ],
    red: [
        [12, 7],
        [11, 7],
        [10, 7],
        [9, 7],
        [8, 7],
    ],
};

// 4) Slots dentro de cada base (solo para pintar los 4 círculos si querés)
export const BASE_SLOTS = {
    green: [
        [2, 2],
        [2, 4],
        [4, 2],
        [4, 4],
    ],
    yellow: [
        [2, 10],
        [2, 12],
        [4, 10],
        [4, 12],
    ],
    blue: [
        [10, 10],
        [10, 12],
        [12, 10],
        [12, 12],
    ],
    red: [
        [10, 2],
        [10, 4],
        [12, 2],
        [12, 4],
    ],
};

// 5) Estrellas (seguros). Puse 8 típicos: ajustá a tu gusto.
export const SAFE_CELLS = new Set(
    [
        [1, 7],
        [7, 1],
        [13, 7],
        [7, 13], // previos a las salidas
        [3, 3],
        [3, 11],
        [11, 11],
        [11, 3], // diagonales
    ].map(([r, c]) => key(r, c))
);

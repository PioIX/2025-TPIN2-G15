"use client";

import Image from "next/image";
import css from "@/app/styles/board.module.css";
import { TRACK_MAP, START_OF, HOME_PATH, BASE_SLOTS, SAFE_CELLS, key } from "@/logic/coords";

// Componente visual. No hace reglas. Dibuja el tablero + lo que le pase el padre por props.
export default function Board({
    pieces = [],           // [{color, id, pos:{ type:"base"|"track"|"home"|"goal", trackIndex?, homeStep? }}]
    onCellClick,           // (cellInfo) => void   (para pruebas, opcional)
    showSafe = true,
    showArrows = true,
    overlayCounters = { red: 0, blue: 0, yellow: 0, green: 0 }, // cuántas en meta
}) {
    // 15x15
    const rows = 15, cols = 15;

    // mapa rápido de qué hay en cada celda del anillo (para apilar fichas visualmente)
    const stack = new Map(); // key -> [{color,id}]
    pieces.forEach(p => {
        if (p.pos?.type === "track") {
            const { r, c } = TRACK_MAP[p.pos.trackIndex];
            const k = key(r, c);
            if (!stack.has(k)) stack.set(k, []);
            stack.get(k).push({ color: p.color, id: p.id });
        }
    });

    // helpers para saber si (r,c) pertenece a alguna zona
    const isStart = (r, c) => Object.values(START_OF).some(([sr, sc]) => sr === r && sc === c);
    const isHome = (r, c) =>
        Object.values(HOME_PATH).some(path => path.some(([hr, hc]) => hr === r && hc === c));

    const renderCell = (r, c) => {
        const k = key(r, c);

        // coloreo bloques de “hogar” grandes (4 cuadrantes)
        const homeColor =
            (r >= 9 && c <= 5) ? "red" :
                (r <= 5 && c >= 9) ? "yellow" :
                    (r >= 9 && c >= 9) ? "blue" :
                        (r <= 5 && c <= 5) ? "green" : null;

        const isCenter = r === 7 && c === 7;

        // ¿es pasillo?
        let laneColor = null;
        for (const [color, path] of Object.entries(HOME_PATH)) {
            if (path.some(([rr, cc]) => rr === r && cc === c)) {
                laneColor = color;
                break;
            }
        }

        // ¿es pista común?
        const trackIdx = TRACK_MAP.findIndex(({ r: rr, c: cc }) => rr === r && cc === c);

        const classes = [css.cell];
        if (homeColor) classes.push(css[`home_${homeColor}`]);
        if (isCenter) classes.push(css.center);
        if (laneColor) classes.push(css[`lane_${laneColor}`]);
        if (trackIdx !== -1) classes.push(css.track);
        if (isStart(r, c)) classes.push(css.start);
        if (showSafe && SAFE_CELLS.has(k)) classes.push(css.safe);

        // fichas apiladas en anillo
        const pile = stack.get(k) || [];

        return (
            <div
                key={k}
                className={classes.join(" ")}
                onClick={() => onCellClick?.({ r, c, trackIdx })}
            >
                {/* contador en meta (lo pinto alrededor del centro) */}
                {isCenter && (
                    <div className={css.centerCounters}>
                        {["red", "blue", "yellow", "green"].map(color => (
                            <span key={color} className={css[`dot_${color}`]}>
                                {overlayCounters[color] || 0}
                            </span>
                        ))}
                    </div>
                )}

                {showSafe && SAFE_CELLS.has(k) && (
                    <div className={css.safeIcon}>
                        <Image
                            src="/assets/game/board/Yipeee.png"   // <- tu archivo
                            alt="safe"
                            fill
                            sizes="36px"
                            priority={false}
                            className={css.safeImg}
                        />
                    </div>
                )}


                {/* fichas en esta celda del anillo */}
                {pile.length > 0 && (
                    <div className={css.pile}>
                        {pile.map(p => (
                            <span key={p.id} className={css[`chip_${p.color}`]} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    console.log("Estoy siendo recibido")

    return (
        <div className={css.board}>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className={css.row}>
                    {Array.from({ length: cols }).map((__, c) => renderCell(r, c))}
                </div>
            ))}
        </div>
    );
}

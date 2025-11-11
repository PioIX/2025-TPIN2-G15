"use client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/app/components/Board"), {
    ssr: false,
    loading: () => (
        <div style={{ padding: 24, color: "#fff" }}>Cargando tablero…</div>
    ),
});

export default function GameClassic() {
    const params = useSearchParams();

    const players = parseInt(params.get("players") || "4", 10);
    const safe = (params.get("safe") || "true") === "true";
    const names = [
        params.get("n1") || "Jugador 1",
        params.get("n2") || "Jugador 2",
        params.get("n3") || "Jugador 3",
        params.get("n4") || "Jugador 4",
    ].slice(0, players);

    return <Board players={players} safe={safe} names={names} />;
}

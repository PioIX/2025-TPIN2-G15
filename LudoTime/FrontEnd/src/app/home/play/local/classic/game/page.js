"use client";
import { useSearchParams } from "next/navigation";
import Board from "@/app/components/Board";  // Asegúrate de que Board está en la carpeta correcta

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

    // Inicializa las piezas (todas las fichas de los jugadores están en "base")
    const pieces = [
        { color: "red", id: "p1", pos: { type: "base", trackIndex: 0 } },
        { color: "green", id: "p2", pos: { type: "base", trackIndex: 1 } },
        { color: "blue", id: "p3", pos: { type: "base", trackIndex: 2 } },
        { color: "yellow", id: "p4", pos: { type: "base", trackIndex: 3 } },
    ].slice(0, players);  // Asegúrate de que solo se asignen el número correcto de piezas

    // Verificar en la consola que las piezas estén correctamente inicializadas
    console.log(pieces);

    return <Board pieces={pieces} showSafe={safe} overlayCounters={{ red: 0, blue: 0, yellow: 0, green: 0 }} />;
}

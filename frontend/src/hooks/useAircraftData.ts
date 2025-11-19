// src/hooks/useAircraftData.tsx
import { useState, useEffect } from "react";
import type { Aircraft } from "../types";

// --- LOGIKA URL DINAMIS ---
// Ambil URL backend dari Environment Variable Vercel
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Ubah http/https menjadi ws/wss secara otomatis
const WEBSOCKET_URL = API_BASE.replace(/^http/, 'ws'); 

export function useAircraftData() {
 const [aircraft, setAircraft] = useState<Map<string, Aircraft>>(new Map());

 useEffect(() => {
  const ws = new WebSocket(WEBSOCKET_URL);

  ws.onopen = () => {
   console.log("Terhubung ke WebSocket server");
  };

  ws.onmessage = (event) => {
   const raw = JSON.parse(event.data);

   // ---- NORMALISASI DATA (WAJIB ADA) ----
   const aircraftData: Aircraft[] = raw.map((ac: any) => ({
    callsign: ac.callsign ?? "UNKNOWN",
    lat: Number(ac.lat) || 0,
    lng: Number(ac.lng) || 0,
    altitude: Number(ac.altitude) || 0,
    speed: Number(ac.speed) || 0,
    heading: Number(ac.heading) || 0,
        // Pastikan 'tk' selalu ada, meskipun hanya string acak
    tk: ac.tk ?? `unknown-${Math.random()}`, 
   }));

   setAircraft(() => {
    const newMap = new Map<string, Aircraft>();
    for (const ac of aircraftData) {
          // --- PERBAIKAN ---
          // Gunakan 'tk' sebagai Kunci, bukan 'callsign'
     newMap.set(ac.tk, ac);
    }
    return newMap;
   });
  };

  ws.onclose = () => {
   console.log("Terputus dari WebSocket server");
  };

  ws.onerror = (error) => {
   console.error("WebSocket error:", error);
  };

  return () => ws.close();
 }, []);

 return Array.from(aircraft.values());
}
import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Polyline,
  useMap,
  LayersControl // Import LayersControl
} from "react-leaflet";
import { useAircraftData } from "../hooks/useAircraftData"; 
import type { Aircraft } from "../types"; 
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Konfigurasi ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PLAN_PROXY_URL = `${API_BASE}/plan?key=`;
const flightTrackStyle = { color: "#0078A8", weight: 4, opacity: 0.8 };
const projectionLineStyle = { color: "#555", weight: 2, opacity: 0.8, dashArray: "5, 10" };

// --- KONFIGURASI WARNA ---
const COLOR_AIR = "#0078A8";   // Biru
const COLOR_GROUND = "#16a34a"; // Hijau (Sesuai Permintaan)

// --- Helper Functions ---
function calculateDestination(lat: number, lng: number, bearing: number, distance: number): [number, number] {
  const R = 6371;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const brng = (bearing * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

// --- COMPONENT: MODERN SIDEBAR ---
interface SidebarProps {
  aircraftData: Aircraft[];
  selectedAircraft: Aircraft | null;
  onSearch: (term: string) => void;
  onCloseDetails: () => void;
  // Filter States
  showAir: boolean; setShowAir: (v: boolean) => void;
  showGround: boolean; setShowGround: (v: boolean) => void;
  minAlt: number; setMinAlt: (v: number) => void;
  minSpeed: number; setMinSpeed: (v: number) => void;
  // Shadow States
  shadowAir: boolean; setShadowAir: (v: boolean) => void;
  shadowGround: boolean; setShadowGround: (v: boolean) => void;
}

function AircraftSidebar({ 
  aircraftData, selectedAircraft, onSearch, onCloseDetails,
  showAir, setShowAir, showGround, setShowGround,
  minAlt, setMinAlt, minSpeed, setMinSpeed,
  shadowAir, setShadowAir, shadowGround, setShadowGround
}: SidebarProps) {
  
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hitung Statistik
  const airborneCount = aircraftData.filter(a => a.altitude > 0).length;
  const groundCount = aircraftData.length - airborneCount;
  const totalCount = aircraftData.length;

  useEffect(() => { if (selectedAircraft) setIsOpen(true); }, [selectedAircraft]);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 2000, display: "flex", pointerEvents: "none" }}>
      
      {/* Sidebar Panel */}
      <div style={{
        width: "360px", height: "96%", marginTop: "10px", marginLeft: "10px",
        backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)",
        borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
        pointerEvents: "auto", transition: "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        transform: isOpen ? "translateX(0)" : "translateX(-380px)", position: "relative", border: "1px solid rgba(255,255,255,0.5)"
      }}>

        {/* Toggle Button Sidebar */}
        <button onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "absolute", right: "-36px", top: "24px", width: "36px", height: "48px",
            backgroundColor: "white", borderTopRightRadius: "12px", borderBottomRightRadius: "12px",
            border: "1px solid #eee", borderLeft: "none", boxShadow: "6px 0 12px rgba(0,0,0,0.05)",
            cursor: "pointer", color: COLOR_AIR, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
           {isOpen ? "◀" : "▶"}
        </button>

        {/* Header Area */}
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>LIVE TRACKER</h2>
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Monitoring Traffic</span>
            <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", fontWeight: "700", color: "#0f172a" }}>
              {totalCount} Aircraft
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {!selectedAircraft ? (
            <>
              {/* Search Box */}
              <div style={{ marginBottom: "24px", position: "relative" }}>
                 <input 
                  type="text" placeholder="Search Callsign..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: "14px", fontWeight: "500", boxSizing: "border-box" }}
                />
                <button onClick={() => onSearch(searchTerm)} style={{ position: "absolute", right: "8px", top: "8px", bottom: "8px", background: COLOR_AIR, color: "white", border: "none", borderRadius: "8px", padding: "0 12px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>GO</button>
              </div>

              {/* BIG STAT CARDS (Filter Buttons) - Updated Colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "30px" }}>
                <StatCard 
                  label="In Air" 
                  count={airborneCount} 
                  active={showAir} 
                  color={COLOR_AIR} 
                  icon="✈️"
                  onClick={() => setShowAir(!showAir)} 
                />
                <StatCard 
                  label="On Ground" 
                  count={groundCount} 
                  active={showGround} 
                  color={COLOR_GROUND} 
                  icon="🚜"
                  onClick={() => setShowGround(!showGround)} 
                />
              </div>

              {/* VISUAL SETTINGS (Shadow Toggles) - Updated Colors */}
              <div style={{ marginBottom: "30px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <label style={sectionTitleStyle}>VISUAL EFFECTS</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <ToggleSwitch label="Air Glow Effect" checked={shadowAir} onChange={setShadowAir} color={COLOR_AIR} />
                  <ToggleSwitch label="Ground Glow Effect" checked={shadowGround} onChange={setShadowGround} color={COLOR_GROUND} />
                </div>
              </div>

              {/* ADVANCED FILTERS */}
              <div>
                <label style={sectionTitleStyle}>FLIGHT PARAMETERS</label>
                <FilterSlider label="Min Altitude" value={minAlt} unit="ft" max={40000} step={1000} onChange={setMinAlt} />
                <FilterSlider label="Min Speed" value={minSpeed} unit="kts" max={600} step={10} onChange={setMinSpeed} />
              </div>
            </>
          ) : (
            /* Detail View */
            <div>
              <button onClick={onCloseDetails} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: "600", padding: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "5px" }}>
                ← Back to Overview
              </button>
              <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", padding: "24px", borderRadius: "16px", marginBottom: "20px", border: "1px solid #cbd5e1" }}>
                <h1 style={{ margin: 0, fontSize: "36px", color: "#0f172a", fontWeight: "800", letterSpacing: "-1px" }}>{selectedAircraft.callsign}</h1>
                <div style={{ fontSize: "14px", color: "#64748b", marginTop: "5px", fontFamily: "monospace" }}>ID: {selectedAircraft.tk}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <DetailCard icon="🏔️" label="Altitude" value={selectedAircraft.altitude} unit="ft" />
                <DetailCard icon="🚀" label="Speed" value={selectedAircraft.speed} unit="kts" />
                <DetailCard icon="🧭" label="Heading" value={selectedAircraft.heading} unit="°" />
                <DetailCard icon="📍" label="Coords" value={`${selectedAircraft.lat.toFixed(2)}`} unit="lat" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLING COMPONENTS ---

const sectionTitleStyle = { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px", marginBottom: "12px", display: "block", textTransform: "uppercase" as const };

function StatCard({ label, count, active, color, icon, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px",
      backgroundColor: active ? color : "white",
      color: active ? "white" : "#64748b",
      border: `2px solid ${active ? color : "#e2e8f0"}`, borderRadius: "12px", cursor: "pointer",
      transition: "all 0.2s ease", boxShadow: active ? `0 8px 16px -4px ${color}66` : "none",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>{active ? "ON" : "OFF"}</span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: "800", lineHeight: "1" }}>{count}</div>
      <div style={{ fontSize: "12px", fontWeight: "600", marginTop: "4px", opacity: 0.9 }}>{label}</div>
    </button>
  );
}

function ToggleSwitch({ label, checked, onChange, color }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", fontWeight: "500", color: "#475569" }}>{label}</span>
      <div 
        onClick={() => onChange(!checked)}
        style={{
          width: "44px", height: "24px", borderRadius: "20px",
          backgroundColor: checked ? color : "#cbd5e1", cursor: "pointer",
          position: "relative", transition: "background 0.3s"
        }}
      >
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "white",
          position: "absolute", top: "3px", left: checked ? "23px" : "3px",
          transition: "left 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }} />
      </div>
    </div>
  );
}

function FilterSlider({ label, value, unit, max, step, onChange }: any) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#475569", fontWeight: "600" }}>
        <span>{label}</span>
        <span style={{ color: COLOR_AIR }}>{value} <small>{unit}</small></span>
      </div>
      <input type="range" min="0" max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: COLOR_AIR, cursor: "pointer", height: "6px", background: "#e2e8f0", borderRadius: "4px" }} />
    </div>
  );
}

function DetailCard({ icon, label, value, unit }: any) {
  return (
    <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>{value} <span style={{ fontSize: "11px" }}>{unit}</span></div>
    </div>
  );
}

function MapController({ center, zoomFn }: { center: [number, number] | null, zoomFn: (fn: any) => void }) {
  const map = useMap();
  useEffect(() => { zoomFn({ in: () => map.zoomIn(), out: () => map.zoomOut() }); }, [map, zoomFn]);
  useEffect(() => { if (center) map.flyTo(center, 10, { animate: true, duration: 1.5 }); }, [center, map]);
  return null;
}

// --- APP UTAMA ---
export function AircraftMap() {
  const aircraftData = useAircraftData();
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [flightTrack, setFlightTrack] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [zoomHandlers, setZoomHandlers] = useState({ in: () => {}, out: () => {} });

  // --- STATES UNTUK FILTER & VISUAL ---
  const [minAlt, setMinAlt] = useState(0);
  const [minSpeed, setMinSpeed] = useState(0);
  const [showAir, setShowAir] = useState(true);
  const [showGround, setShowGround] = useState(true);
  const [shadowAir, setShadowAir] = useState(true);
  const [shadowGround, setShadowGround] = useState(true);

  const filteredAircraft = aircraftData.filter(ac => {
    const isAir = ac.altitude > 0;
    const isGround = ac.altitude <= 0;
    if (isAir && !showAir) return false;
    if (isGround && !showGround) return false;
    if (ac.altitude < minAlt) return false;
    if (ac.speed < minSpeed) return false;
    return true;
  });

  const fetchRoute = async (tk: string) => {
    try {
      const response = await axios.get(`${PLAN_PROXY_URL}${tk}`);
      setFlightTrack(response.data);
    } catch (err) { setFlightTrack(null); }
  };

  const handleSelect = (ac: Aircraft) => {
    if (selectedAircraft?.tk === ac.tk) { handleClose(); return; }
    setSelectedAircraft(ac);
    setMapCenter([ac.lat, ac.lng]); 
    setFlightTrack(null); 
    if (ac.tk) fetchRoute(ac.tk);
  };

  const handleClose = () => {
    setSelectedAircraft(null); setFlightTrack(null); setMapCenter(null);
  };

  const handleSearch = (term: string) => {
    if (!term) return;
    const target = aircraftData.find(ac => ac.callsign.toLowerCase() === term.toLowerCase());
    if (target) handleSelect(target); else alert(`Not found.`);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", overflow: "hidden" }}>
      
      <AircraftSidebar 
        aircraftData={aircraftData}
        selectedAircraft={selectedAircraft}
        onSearch={handleSearch}
        onCloseDetails={handleClose}
        showAir={showAir} setShowAir={setShowAir}
        showGround={showGround} setShowGround={setShowGround}
        minAlt={minAlt} setMinAlt={setMinAlt}
        minSpeed={minSpeed} setMinSpeed={setMinSpeed}
        shadowAir={shadowAir} setShadowAir={setShadowAir}
        shadowGround={shadowGround} setShadowGround={setShadowGround}
      />

      <MapContainer center={[-27.4698, 153.0251]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        
        {/* --- LAYERS CONTROL (Map Selector) --- */}
        <LayersControl position="topright">
          
          {/* 1. OpenStreetMap World (Default) */}
          <LayersControl.BaseLayer checked name="OpenStreetMap World">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </LayersControl.BaseLayer>

          {/* 2. Satellite (Esri World Imagery) */}
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>

          {/* 3. HybridVFR Australia (Placeholder: OpenTopoMap) */}
          {/* Note: Real VFR charts are usually paid/proprietary URLs */}
          <LayersControl.BaseLayer name="HybridVFR Australia">
             <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="Placeholder for HybridVFR"
            />
          </LayersControl.BaseLayer>

          {/* 4. ERC Low Australia */}
          <LayersControl.BaseLayer name="ERC Low Australia">
             <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="Placeholder for ERC Low"
            />
          </LayersControl.BaseLayer>

           {/* 5. HybridVFR New Zealand */}
           <LayersControl.BaseLayer name="HybridVFR New Zealand">
             <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="Placeholder for NZ VFR"
            />
          </LayersControl.BaseLayer>

          {/* 6. ERC4 New Zealand */}
          <LayersControl.BaseLayer name="ERC4 New Zealand">
             <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="Placeholder for ERC4"
            />
          </LayersControl.BaseLayer>

        </LayersControl>
        
        <MapController center={mapCenter} zoomFn={setZoomHandlers} />
        
        <div style={{ position: "absolute", bottom: "30px", right: "30px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={zoomHandlers.in} style={{ width: "40px", height: "40px", background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "18px", cursor: "pointer" }}>+</button>
          <button onClick={zoomHandlers.out} style={{ width: "40px", height: "40px", background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "18px", cursor: "pointer" }}>-</button>
        </div>

        {filteredAircraft.map((ac) => {
          const headingVal = Number(ac.heading) || 0;
          const iconRotation = (headingVal + 180) % 360;
          const isSelected = selectedAircraft?.tk === ac.tk;
          const iconSize = isSelected ? 52 : 36;
          const isAir = ac.altitude > 0;

          // --- LOGIKA WARNA UPDATED (Ground Hijau) ---
          const color = isAir ? COLOR_AIR : COLOR_GROUND; 
          
          const enableShadow = isAir ? shadowAir : shadowGround;
          let dropShadow = 'none';
          
          if (isSelected) {
             dropShadow = `drop-shadow(0 0 15px ${color})`;
          } else if (enableShadow) {
             dropShadow = `drop-shadow(0 0 6px ${color})`;
          }

          const icon = L.divIcon({
            html: `
              <img src="/plane.png" style="
                width: ${iconSize}px; height: ${iconSize}px;
                transform: rotate(${iconRotation}deg);
                transform-origin: center; 
                pointer-events: none;
                filter: ${dropShadow}; 
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                opacity: ${enableShadow || isSelected ? 1 : 0.8}; 
              "/>`,
            className: "leaflet-plane-icon",
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2],
          });

          let projectionLine: [number, number][] | null = null;
          if (ac.speed > 20 && isAir) {
            const dist = (ac.speed * 1.852) / 20;
            projectionLine = [[ac.lat, ac.lng], calculateDestination(ac.lat, ac.lng, headingVal, dist)];
          }

          return (
            <React.Fragment key={ac.tk}>
              <Marker position={[ac.lat, ac.lng]} icon={icon} eventHandlers={{ click: () => handleSelect(ac) }}>
                 {!isSelected && <Popup offset={[0, -10]}>
                    <div style={{textAlign: 'center'}}>
                      <strong style={{color: color, fontSize: '14px'}}>{ac.callsign}</strong><br/>
                      <span style={{fontSize: '11px', color: '#666'}}>{isAir ? `${ac.altitude} ft` : 'On Ground'}</span>
                    </div>
                 </Popup>}
              </Marker>
              {projectionLine && <Polyline positions={projectionLine} pathOptions={projectionLineStyle} />}
            </React.Fragment>
          );
        })}

        {flightTrack && <GeoJSON data={flightTrack} style={flightTrackStyle} />}

        <style>{`
          .leaflet-plane-icon { background: transparent; border: none; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          /* Override Leaflet Layers Control Style */
          .leaflet-control-layers {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
            padding: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
          }
        `}</style>
      </MapContainer>
    </div>
  );
}
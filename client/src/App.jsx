import React, { useEffect, useState, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import io from "socket.io-client";
import Dashboard from "./Dashboard";
import { countryCoords } from "./countries";

const socket = io("http://localhost:4000", {
  transports: ["websocket", "polling"],
});

function App() {
  const globeEl = useRef();
  const [attacks, setAttacks] = useState([]);
  const [rings, setRings] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const stats = useMemo(() => {
    if (attacks.length === 0)
      return { topTarget: "", totalBandwidth: 0, topType: "..." };

    const totalBandwidth = attacks.reduce((acc, curr) => acc + curr.value, 0);
    const targetCounts = {};
    attacks.forEach((a) => {
      targetCounts[a.to] = (targetCounts[a.to] || 0) + 1;
    });
    const topTarget = Object.keys(targetCounts).reduce((a, b) =>
      targetCounts[a] > targetCounts[b] ? a : b
    );

    const typeCounts = {};
    attacks.forEach((a) => {
      typeCounts[a.name] = (typeCounts[a.name] || 0) + 1;
    });
    const topType = Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    );

    return { topTarget, totalBandwidth, topType };
  }, [attacks]);

  const handleFocus = (countryCode) => {
    const coords = countryCoords[countryCode];
    if (coords && globeEl.current) {
      globeEl.current.pointOfView(
        {
          lat: coords.lat,
          lng: coords.lng,
          altitude: 1.8,
        },
        2000
      );
    }
  };

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("attack_update", (data) => {
      setAttacks(data);
      const newRings = data.map((attack) => ({
        lat: attack.endLat,
        lng: attack.endLng,
        color: attack.color,
        maxR: 8,
        propagationSpeed: 3,
        repeatPeriod: 800,
      }));
      setRings(newRings);
    });

    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050510" }}>
      <div className="scanlines"></div>

      <div style={{ position: "absolute", top: 30, left: 30, zIndex: 1 }}>
        <h1
          style={{
            color: "cyan",
            textShadow: "0 0 15px cyan",
            fontSize: "3rem",
            margin: 0,
          }}
        >
          NETWATCH
        </h1>
        <p style={{ color: "#00aaaa", margin: 0, letterSpacing: "3px" }}>
          GLOBAL DDOS TRACKER
        </p>
      </div>

      <Dashboard
        stats={stats}
        recentAttacks={attacks.slice(0, 8)}
        isConnected={isConnected}
        onFocus={handleFocus}
      />

      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundOpacity={0}
        atmosphereColor="#00aaff"
        atmosphereAltitude={0.25}
        arcsData={attacks}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcStroke={0.8}
        ringsData={rings}
        ringColor="color"
        ringMaxRadius={8}
        ringPropagationSpeed={3}
        ringRepeatPeriod={800}
      />
    </div>
  );
}

export default App;

// client/src/Dashboard.js
import React from "react";

const Dashboard = ({ stats, recentAttacks, isConnected, onFocus }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "320px",
        background: "rgba(10, 10, 20, 0.85)", // Darker background
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 255, 255, 0.3)",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)", // Neon Glow
        borderRadius: "8px",
        padding: "20px",
        zIndex: 2,
      }}
    >
      {/* Header Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>
          THREAT INTELLIGENCE
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isConnected ? "#00ff00" : "red",
              boxShadow: isConnected ? "0 0 8px #00ff00" : "none",
            }}
          />
          <span
            style={{ fontSize: "12px", color: isConnected ? "#00ff00" : "red" }}
          >
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Interactive Stat: Top Target (Clickable!) */}
      <div
        style={{ marginBottom: "20px", cursor: "pointer", transition: "0.2s" }}
        onClick={() => onFocus(stats.topTarget)} // <--- CLICK TO ZOOM
        title="Click to locate on globe"
      >
        <small style={{ color: "#00aaaa", letterSpacing: "1px" }}>
          PRIMARY TARGET
        </small>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#ff4444",
            textShadow: "0 0 10px rgba(255,0,0,0.5)",
          }}
        >
          {stats.topTarget || "SCANNING..."}
          <span style={{ fontSize: "12px", color: "#666", marginLeft: "10px" }}>
            {" "}
            (Click to Focus)
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div>
          <small style={{ color: "#00aaaa" }}>BANDWIDTH</small>
          <div style={{ fontSize: "18px", color: "#fff" }}>
            {stats.totalBandwidth.toLocaleString()} Mbps
          </div>
        </div>
        <div>
          <small style={{ color: "#00aaaa" }}>VECTOR</small>
          <div style={{ fontSize: "18px", color: "#ffaa00" }}>
            {stats.topType}
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div>
        <small style={{ color: "#00aaaa", letterSpacing: "1px" }}>
          LIVE FEED
        </small>
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            marginTop: "10px",
            fontSize: "13px",
          }}
        >
          {recentAttacks.map((atk, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
              onClick={() => onFocus(atk.to)} // <--- CLICK ROW TO ZOOM
            >
              <span style={{ color: atk.color, fontWeight: "bold" }}>
                [{atk.name}]
              </span>
              <span style={{ color: "#ccc" }}>
                {atk.from} <span style={{ color: "#555" }}>➜</span>{" "}
                <span style={{ color: "#fff" }}>{atk.to}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

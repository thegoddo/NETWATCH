require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const countryCoords = require("./countries"); // Imports your new comprehensive list

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const CF_API_URL =
  "https://api.cloudflare.com/client/v4/radar/attacks/layer3/top/attacks";
const API_TOKEN = process.env.CLOUDFLARE_TOKEN;

async function fetchRealData() {
  try {
    if (!API_TOKEN) {
      console.error("❌ ERROR: Missing CLOUDFLARE_TOKEN in .env");
      return [];
    }

    console.log("📡 Contacting Cloudflare Radar...");

    const response = await axios.get(CF_API_URL, {
      params: {
        limit: 15,
        dateRange: "7d", // 7 days of data
        format: "json",
      },
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    // Cloudflare returns results in 'top_0'
    const pairs = response.data.result.top_0;

    if (!pairs || pairs.length === 0) {
      console.log("⚠️ API returned no data (Check dateRange?)");
      return [];
    }

    // MAP DATA TO ARCS
    const realAttacks = pairs
      .map((item, index) => {
        const sourceCode =
          item.originCountryAlpha2 || item.origin || item.source;
        const targetCode =
          item.targetCountryAlpha2 || item.target || item.destination;
        const volume = item.value;

        if (countryCoords[sourceCode] && countryCoords[targetCode]) {
          const start = countryCoords[sourceCode]; // Array [lat, lng]
          const end = countryCoords[targetCode]; // Array [lat, lng]

          const colors = ["#ff0000", "#ffaa00", "#aa00ff", "#00ffcc"];
          const types = ["UDP Flood", "Botnet", "Malware", "Phishing"];

          return {
            startLat: start[0], // Index 0 = Latitude
            startLng: start[1], // Index 1 = Longitude
            endLat: end[0],
            endLng: end[1],
            color: colors[index % colors.length],
            name: types[index % types.length],
            from: sourceCode,
            to: targetCode,
            value: Math.floor(volume),
          };
        } else {
          // Log missing countries so you can add them to countries.js later
          // We only log if sourceCode/targetCode actually exist but aren't in our list
          if (sourceCode && !countryCoords[sourceCode])
            console.log(`⚠️ Missing Coords for Source: ${sourceCode}`);
          if (targetCode && !countryCoords[targetCode])
            console.log(`⚠️ Missing Coords for Target: ${targetCode}`);
          return null;
        }
      })
      .filter((item) => item !== null); // Clean up nulls

    return realAttacks;
  } catch (error) {
    if (error.response) {
      console.error(
        "❌ CLOUDFLARE ERROR:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("❌ NETWORK ERROR:", error.message);
    }
    return [];
  }
}

let currentData = [];

// 1. Refresh Data from Cloudflare every 60 seconds
setInterval(async () => {
  const freshData = await fetchRealData();
  if (freshData.length > 0) currentData = freshData;
}, 60000);

// 2. Initial Fetch on Start
fetchRealData().then((data) => (currentData = data));

// 3. Push to Frontend every 3 seconds
setInterval(() => {
  if (currentData.length > 0) {
    console.log(`Broadcasting ${currentData.length} LIVE attack pairs...`);
    io.emit("attack_update", currentData);
  }
}, 3000);

server.listen(4000, () => console.log("SERVER RUNNING ON PORT 4000"));

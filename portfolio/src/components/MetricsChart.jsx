import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";

// ✅ Background Images
import sunnyImage from "../assets/Sunny.png";
import sunnyImage2 from "../assets/Sunny2.png";
import rainyImage from "../assets/Rain.png";
import rainyImage2 from "../assets/Rain2.png";

// ✅ Import Logos
import nasdaqLogo from "../assets/nasdaq_logo.jpeg";
import amazonLogo from "../assets/amazon_logo.png";
import appleLogo from "../assets/apple_logo.png";
import bitcoinLogo from "../assets/bitcoin_logo.png";
import ethereumLogo from "../assets/ethereum_logo.png";
import gasLogo from "../assets/gas_logo.png";
import goldLogo from "../assets/gold_logo.png";
import googleLogo from "../assets/google_logo.png";
import metaLogo from "../assets/meta_logo.png";
import microsoftLogo from "../assets/microsoft_logo.png";
import netflixLogo from "../assets/netflix_logo.png";
import nvidiaLogo from "../assets/nvidia_logo.png";
import oilLogo from "../assets/oil_logo.png";
import sp500Logo from "../assets/s_p_500_logo.png";
import silverLogo from "../assets/silver_logo.png";
import teslaLogo from "../assets/tesla_logo.png";

// ✅ Logo Map
const assetLogos = {
  "NASDAQ": nasdaqLogo,
  "Amazon": amazonLogo,
  "Apple": appleLogo,
  "Bitcoin": bitcoinLogo,
  "Ethereum": ethereumLogo,
  "Natural Gas": gasLogo,
  "Gold": goldLogo,
  "Google": googleLogo,
  "Meta": metaLogo,
  "Microsoft": microsoftLogo,
  "Netflix": netflixLogo,
  "Nvidia": nvidiaLogo,
  "Oil": oilLogo,
  "S&P 500": sp500Logo,
  "Silver": silverLogo,
  "Tesla": teslaLogo,
};

// ✅ Helper: Calculate Up/Down Streaks
function getStreak(data, index, key) {
  if (index <= 0) return 0;
  const direction = data[index][key] >= data[index - 1][key] ? "up" : "down";
  let streak = 1;
  for (let i = index - 1; i > 0; i--) {
    const prevDir = data[i][key] >= data[i - 1][key] ? "up" : "down";
    if (prevDir === direction) streak++;
    else break;
  }
  return direction === "up" ? streak : -streak;
}

// ✅ Helper: Choose Background
function pickBackground(streak) {
  const abs = Math.abs(streak);
  if (streak >= 0) return abs >= 2 ? sunnyImage2 : sunnyImage;
  return abs >= 2 ? rainyImage2 : rainyImage;
}

// ✅ Custom Legend with Logos
const CustomLegend = ({ payload }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      marginTop: "10px",
      alignItems: "center",
    }}
  >
    {payload?.map((entry) => {
      const color = entry?.color || entry?.payload?.stroke || "#fff";
      const raw = entry?.value ?? entry?.payload?.dataKey ?? "";
      const clean = String(raw)
        .replace(/_[^_]+$/, "")
        .replace(/_/g, " ");
      const logo = assetLogos[clean];

      return (
        <div
          key={raw}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color,
            fontWeight: "700",
            fontSize: "14px",
          }}
        >
          {logo && (
            <img
              src={logo}
              alt={`${clean} logo`}
              style={{
                width: 20,
                height: 20,
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          )}
          <span>{clean}</span>
        </div>
      );
    })}
  </div>
);

const MetricsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data }) => {
        const grouped = {};
        data.forEach((row) => {
          if (!row.Date || !row.Asset) return;
          if (!grouped[row.Date]) grouped[row.Date] = { date: row.Date };
          grouped[row.Date][row.Asset] = row.Price;
        });

        const result = Object.values(grouped).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const uniqueAssets = Array.from(new Set(data.map((r) => r.Asset)));

        setChartData(result);
        setAssets(uniqueAssets);
      },
    });
  }, []);

  // ✅ Background based on S&P 500 streak
  const indexToUse =
    hoveredIndex !== null ? hoveredIndex : chartData.length - 1;
  const streak =
    chartData.length > 1 && indexToUse >= 1
      ? getStreak(chartData, indexToUse, "S&P_500_Price")
      : 0;
  const bg = chartData.length >= 2 ? pickBackground(streak) : null;

  // ✅ Color palette fallback
  const colorPalette = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
    "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
    "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
    "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080",
  ];
  const getColor = (index) =>
    index < colorPalette.length
      ? colorPalette[index]
      : `hsl(${(index * 137.5) % 360}, 70%, 55%)`;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000",
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 300ms ease-in-out",
      }}
    >
      {/* Title */}
      <h1
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "2rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          zIndex: 10,
          textShadow: "0px 2px 6px rgba(0, 0, 0, 0.8)",
        }}
      >
        Market Climate
      </h1>

      <div
        style={{
          height: 68,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "92%",
            height: "85vh",
            maxHeight: 820,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            padding: 16,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onMouseMove={(state) =>
                setHoveredIndex(state?.isTooltipActive ? state.activeTooltipIndex : null)
              }
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#444" />
              <XAxis
                dataKey="date"
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
              />
              <YAxis
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
              />

              {/* ✅ Tooltip with Logos + Sorted Values */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const validEntries = payload.filter(
                      (entry) => entry.name && Number.isFinite(entry.value)
                    );
                    if (!validEntries.length) return null;

                    const sortedPayload = validEntries.sort(
                      (a, b) => b.value - a.value
                    );

                    return (
                      <div
                        style={{
                          backgroundColor: "#0b1220",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #94a3b8",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {sortedPayload.map((entry) => {
                          const cleanName = String(entry.name)
                            .replace(/_[^_]+$/, "")
                            .replace(/_/g, " ");
                          const logo = assetLogos[cleanName];

                          return (
                            <div
                              key={entry.name}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: entry.color,
                                marginBottom: 4,
                              }}
                            >
                              {logo && (
                                <img
                                  src={logo}
                                  alt={`${cleanName} logo`}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    objectFit: "contain",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span>
                                {cleanName}: ${entry.value.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend content={<CustomLegend />} />

              {assets.map((asset, i) => (
                <Line
                  key={asset}
                  type="monotone"
                  dataKey={asset}
                  stroke={getColor(i)}
                  strokeWidth={3}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;

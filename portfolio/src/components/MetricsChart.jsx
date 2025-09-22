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

// ✅ Logos (Bitcoin removed)
import nasdaqLogo from "../assets/nasdaq_logo.png";
import amazonLogo from "../assets/amazon_logo.png";
import appleLogo from "../assets/apple_logo.png";
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

const assetLogos = {
  "Nasdaq 100": nasdaqLogo,
  Amazon: amazonLogo,
  Apple: appleLogo,
  Ethereum: ethereumLogo,
  "Natural Gas": gasLogo,
  Gold: goldLogo,
  Google: googleLogo,
  Meta: metaLogo,
  Microsoft: microsoftLogo,
  Netflix: netflixLogo,
  Nvidia: nvidiaLogo,
  "Crude oil": oilLogo,
  "S&P 500": sp500Logo,
  Silver: silverLogo,
  Tesla: teslaLogo,
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

function pickBackground(streak) {
  const abs = Math.abs(streak);
  if (streak >= 0) return abs >= 2 ? sunnyImage2 : sunnyImage;
  return abs >= 2 ? rainyImage2 : rainyImage;
}

const colorPalette = [
  "rgb(234, 178, 86)",
  "rgb(186, 186, 186)",
  "rgb(235, 161, 68)",
  "rgb(120, 117, 116)",
  "rgb(137, 156, 230)",
  "rgb(241, 192, 79)",
  "rgb(92, 166, 114)",
  "rgb(73, 160, 245)",
  "rgb(246, 211, 74)",
  "rgb(72, 161, 220)",
  "rgb(93, 163, 92)",
  "rgb(210, 52, 42)",
  "rgb(152, 199, 64)",
  "rgb(127, 219, 211)",
  "rgb(241, 239, 236)",
  "rgb(217, 56, 51)",
];

const getColor = (index) =>
  index < colorPalette.length
    ? colorPalette[index]
    : `hsl(${(index * 137.5) % 360}, 70%, 55%)`;

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
    {payload?.map((entry, idx) => {
      const color = getColor(idx);
      const cleanName = String(entry.value)
        .replace(/_[^_]+$/, "")
        .replace(/_/g, " ");
      const logo = assetLogos[cleanName];

      return (
        <div
          key={`${entry.dataKey || entry.value}-${idx}`}
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
              alt={`${cleanName} logo`}
              style={{
                width: 20,
                height: 20,
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          )}
          <span>{cleanName}</span>
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
      dynamicTyping: false,
      complete: ({ data }) => {
        const grouped = {};
        data.forEach((row) => {
          if (!row.Date || !row.Asset) return;
          if (row.Asset === "Bitcoin_Price") return; // 🚫 skip Bitcoin

          const price = row.Price
            ? parseFloat(String(row.Price).replace(/,/g, ""))
            : null;

          if (!grouped[row.Date]) grouped[row.Date] = { date: row.Date };
          grouped[row.Date][row.Asset] = price;
        });

        const result = Object.values(grouped).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        const uniqueAssets = Array.from(new Set(data.map((r) => r.Asset)))
          .filter((asset) => asset !== "Bitcoin_Price")
          .sort();

        setChartData(result);
        setAssets(uniqueAssets);
      },
    });
  }, []);

  const indexToUse = hoveredIndex !== null ? hoveredIndex : chartData.length - 1;
  const streak =
    chartData.length > 1 && indexToUse >= 1
      ? getStreak(chartData, indexToUse, "S&P_500_Price")
      : 0;
  const bg = chartData.length >= 2 ? pickBackground(streak) : null;

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
                setHoveredIndex(
                  state?.isTooltipActive ? state.activeTooltipIndex : null
                )
              }
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#444" />
              <XAxis
                dataKey="date"
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
              />
              {/* ✅ Natural scaling — no domain override */}
              <YAxis
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
              />

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
                              key={`${entry.name}-${entry.value}`}
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
                  key={`line-${asset}`}
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

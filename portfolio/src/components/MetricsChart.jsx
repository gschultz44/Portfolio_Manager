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

// ✅ Background Images (used to visually indicate "market mood")
import sunnyImage from "../assets/Sunny.png";
import sunnyImage2 from "../assets/Sunny2.png";
import rainyImage from "../assets/Rain.png";
import rainyImage2 from "../assets/Rain2.png";

// ✅ Asset Logos (Bitcoin intentionally excluded)
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

// Map asset names to their respective logos for display in legend & tooltips
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

// ✅ Helper: Calculate consecutive up/down streaks for a given data series
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

// Pick background image depending on market streak length and direction
function pickBackground(streak) {
  const abs = Math.abs(streak);
  if (streak >= 0) return abs >= 2 ? sunnyImage2 : sunnyImage; // longer up streak = brighter sun
  return abs >= 2 ? rainyImage2 : rainyImage; // longer down streak = heavier rain
}


const colorPalette = [
  "rgb(234, 178, 86)",
  "rgb(186, 186, 186)",
  "rgb(121, 117, 117)",
  "rgb(107, 127, 223)",
  "rgb(243, 212, 102)",
  "rgb(241, 192, 79)",
  "rgb(73, 160, 246)",
  "rgb(154, 199, 63)",
  "rgb(93, 163, 91)",
  "rgb(210, 52, 42)",
  "rgb(152, 198, 63)",
  "rgb(242, 240, 238)",
  "rgb(210, 52, 42)",
];

const getColor = (index) =>
  index < colorPalette.length
    ? colorPalette[index]
    : `hsl(${(index * 137.5) % 360}, 70%, 55%)`;

// ✅ UTC date helpers
const fmtUTC = (ts) => {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ✅ Custom Legend with logos and asset names
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
  const [chartData, setChartData] = useState([]); // [{ dateTs, dateLabel, <assetA>: price, ... }, ...]
  const [assets, setAssets] = useState([]); // list of unique asset names
  const [hoveredIndex, setHoveredIndex] = useState(null); // which index is hovered for streak calc

  // Load & parse CSV data on component mount
  useEffect(() => {
    Papa.parse("/data_with_forecast.csv", {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: ({ data }) => {
        const grouped = {};
        const assetsSet = new Set();
        const excludeAssets = new Set(["Bitcoin_Price", "Nasdaq_100_Price", "S&P_500_Price"]);

        data.forEach((row) => {
          const rawDate = row.Date;
          const asset = row.Asset;
          if (!rawDate || !asset) return;
          if (excludeAssets.has(asset)) return;

          // Parse YYYY-MM-DD (or YYYY-MM-DD ...anything) → UTC midnight
          const m = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!m) return;
          const [_, yStr, moStr, dStr] = m;
          const y = Number(yStr),
            mo = Number(moStr),
            d = Number(dStr);
          const tsUTC = Date.UTC(y, mo - 1, d);
          const label = `${yStr}-${moStr}-${dStr}`;

          // Price
          const price = row.Price
            ? parseFloat(String(row.Price).replace(/,/g, ""))
            : null;

          // Group rows by day label
          if (!grouped[label]) grouped[label] = { dateLabel: label, dateTs: tsUTC };
          grouped[label][asset] = price;

          assetsSet.add(asset);
        });

        // Sort chronologically by timestamp
        const result = Object.values(grouped).sort((a, b) => a.dateTs - b.dateTs);

        // Unique asset list (filtered, sorted)
        const uniqueAssets = Array.from(assetsSet)
          .filter((a) => !excludeAssets.has(a))
          .sort();

        setChartData(result);
        setAssets(uniqueAssets);
      },
    });
  }, []);

  // Determine which index to use (hovered or latest)
  const indexToUse = hoveredIndex !== null ? hoveredIndex : chartData.length - 1;

  // Compute current market streak based on S&P 500 price (use the key that exists in your CSV)
  const streakKey = "S&P 500"; // adjust if your CSV uses a different exact name
  const streak =
    chartData.length > 1 &&
    indexToUse >= 1 &&
    chartData[0] &&
    Object.prototype.hasOwnProperty.call(chartData[0], streakKey)
      ? getStreak(chartData, indexToUse, streakKey)
      : 0;

  // Select background image based on streak direction and length
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
      {/* Title overlay */}
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

      {/* Semi-transparent top bar */}
      <div
        style={{
          height: 68,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Chart container */}
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
              {/* Grid and Axes */}
              <CartesianGrid strokeDasharray="4 4" stroke="#444" />

              {/* ✅ TIME-SCALE X AXIS (no time-of-day shown) */}
              <XAxis
                dataKey="dateTs"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) => fmtUTC(ts)}
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />

              {/* Y-axis uses natural scale */}
              <YAxis
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
              />

              {/* ✅ Tooltip with UTC date label and logos */}
              <Tooltip
                labelFormatter={(ts) => fmtUTC(ts)}
                content={({ active, payload, label }) => {
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
                        <div style={{ marginBottom: 6 }}>
                          {fmtUTC(label)}
                        </div>

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

              {/* Legend with custom logos */}
              <Legend content={<CustomLegend />} />

              {/* Render a line for each asset */}
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

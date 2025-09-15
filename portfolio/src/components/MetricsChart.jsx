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
import sunnyImage from "../assets/Sunny.png";
import sunnyImage2 from "../assets/Sunny2.png";
import rainyImage from "../assets/Rain.png";
import rainyImage2 from "../assets/Rain2.png";

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
        // Group rows by date
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

  // Use S&P_500_Price as reference for background streak
  const indexToUse =
    hoveredIndex !== null ? hoveredIndex : chartData.length - 1;
  const streak =
    chartData.length > 1 && indexToUse >= 1
      ? getStreak(chartData, indexToUse, "S&P_500_Price")
      : 0;

  const bg = chartData.length >= 2 ? pickBackground(streak) : null;

  const colorPalette = [
    "#60a5fa", "#f43f5e", "#22c55e", "#eab308", "#a855f7", "#14b8a6", "#f97316",
    "#d946ef", "#06b6d4", "#84cc16", "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#0ea5e9", "#facc15", "#f87171", "#34d399"
  ];
  
  function getColor(index) {
    if (index < colorPalette.length) return colorPalette[index];
    // Generate a new color dynamically if you have more assets than palette length
    const hue = (index * 137.5) % 360; // golden angle for color variety
    return `hsl(${hue}, 70%, 55%)`;
  }
  

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
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        style={{
                          backgroundColor: "#0b1220",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #94a3b8",
                        }}
                      >
          {payload.map((entry) => (
            <div key={entry.name} style={{ color: entry.color, fontWeight: "bold" }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  }}
/>

              <Legend wrapperStyle={{ color: "#fff" }} />
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

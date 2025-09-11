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
import sunnyImage from "../assets/sunny.jpeg";
import rainyImage from "../assets/rain.jpeg";

const MetricsChart = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Parse CSV and aggregate: monthly last close
  useEffect(() => {
    Papa.parse("/5yr_snp500.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data }) => {
        const daily = data.filter((d) => d.date && d.close);
        const byMonth = {};
        daily.forEach((row) => {
          const key = row.date.slice(0, 7); // YYYY-MM
          if (!byMonth[key] || row.date > byMonth[key].__lastDate) {
            byMonth[key] = { date: key, close: Number(row.close), __lastDate: row.date };
          }
        });
        const monthlyArr = Object.values(byMonth)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(({ date, close }) => ({ date, close }));
        setMonthlyData(monthlyArr);
      },
    });
  }, []);

  // Decide background image (hovered month vs latest month trend)
  let bg = null;
  if (hoveredIndex !== null && hoveredIndex > 0 && hoveredIndex < monthlyData.length) {
    const cur = monthlyData[hoveredIndex].close;
    const prev = monthlyData[hoveredIndex - 1].close;
    bg = cur >= prev ? sunnyImage : rainyImage;
  } else if (monthlyData.length >= 2) {
    const last = monthlyData[monthlyData.length - 1].close;
    const prev = monthlyData[monthlyData.length - 2].close;
    bg = last >= prev ? sunnyImage : rainyImage;
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000", // fallback
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 300ms ease-in-out",
      }}
    >
      {/* Top overlay bar (no text, just darkens background behind the 'header' zone) */}
      <div
        style={{
          height: 68,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Chart section */}
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
              data={monthlyData}
              onMouseMove={(state) => {
                if (state && state.isTooltipActive) {
                  setHoveredIndex(state.activeTooltipIndex ?? null);
                } else {
                  setHoveredIndex(null);
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#444" />
              <XAxis
                dataKey="date"
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                stroke="#e5e7eb"
                tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                tickLine={{ stroke: "#e5e7eb" }}
                allowDecimals
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b1220",
                  border: "1px solid #94a3b8",
                  color: "#fff",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#e5e7eb", fontWeight: 700 }}
                itemStyle={{ color: "#e5e7eb" }}
              />
              {/* Legend in white */}
              {/* </ResponsiveContainer>Legend wrapperStyle={{ color: "#fff", fontSize: 16, fontWeight: 700 }} /> */}
              <Line
                type="monotone"
                dataKey="close"
                //name="Close"
                stroke="#60a5fa"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, stroke: "#e5e7eb", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;

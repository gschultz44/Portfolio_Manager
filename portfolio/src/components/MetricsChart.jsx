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

const MetricsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse("/5yr_snp500.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        // Aggregate data by month
        const monthlyData = {};
        result.data.forEach((row) => {
          if (!row.date || !row.close) return;
          const month = row.date.slice(0, 7); // YYYY-MM
          if (!monthlyData[month]) {
            monthlyData[month] = { date: month, closeSum: 0, count: 0 };
          }
          monthlyData[month].closeSum += row.close;
          monthlyData[month].count += 1;
        });

        const cleanedData = Object.values(monthlyData).map((item) => ({
          date: item.date,
          close: item.closeSum / item.count,
        }));

        setData(cleanedData);
      },
    });
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "90%", height: "90%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#444" strokeWidth={1.5} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#fff"
              tick={{ fontSize: 16, fill: "#fff" }}
            />
            <YAxis
              stroke="#fff"
              tick={{ fontSize: 16, fill: "#fff" }}
              strokeWidth={2}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#fff", fontSize: 16 }} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#60a5fa"
              strokeWidth={4}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;




import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Papa from "papaparse";

const MetricsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/5yr_snp500.csv") // CSV in public folder
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const formattedData = results.data.map((row) => ({
              date: row.date,
              close: row.close,
            }));
            setData(formattedData);
          },
        });
      });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#0f0f0f", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <ResponsiveContainer width="90%" height="80%">
        <LineChart data={data}>
          <CartesianGrid stroke="#444" strokeWidth={2} />
          <XAxis 
            dataKey="date" 
            stroke="#fff" 
            tick={{ fill: "#fff", fontSize: 16, fontWeight: "bold" }} 
            axisLine={{ stroke: "#fff", strokeWidth: 2 }} 
          />
          <YAxis 
            stroke="#fff" 
            tick={{ fill: "#fff", fontSize: 16, fontWeight: "bold" }} 
            axisLine={{ stroke: "#fff", strokeWidth: 2 }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#222", border: "2px solid #888" }}
            labelStyle={{ color: "#fff", fontWeight: "bold" }}
            itemStyle={{ color: "#fff", fontWeight: "bold" }}
          />
          <Line type="monotone" dataKey="close" stroke="#7f00ff" strokeWidth={4} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;

import React, { useEffect, useMemo, useState } from "react";
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

// Optional: lightweight “about” blurbs (edit freely)
const assetAbout = {
  Apple:
    "Apple Inc. (NASDAQ: AAPL) is one of the most influential and widely held stocks in the world, often regarded as a cornerstone of major market indices like the S&P 500 and Nasdaq 100. Known for its consistent performance and strong financial fundamentals, Apple’s stock reflects the company’s ability to innovate, generate steady revenue, and maintain high profit margins across its product lines. Driven by iPhone sales, expanding services revenue, and strong brand loyalty, Apple has demonstrated resilience even amid market volatility. The company regularly returns value to shareholders through dividends and aggressive share buybacks, making it a favorite among both institutional and retail investors. Over time, Apple’s stock has become a benchmark for the broader technology sector, symbolizing stability, growth, and investor confidence in long-term innovation.",
  Amazon:
    "Amazon.com, Inc. (NASDAQ: AMZN) is a global leader in e-commerce and cloud computing, widely recognized as one of the most influential technology stocks in the market. Its stock performance reflects the company’s dominance in online retail, its strong logistics network, and its high-growth Amazon Web Services (AWS) division, which drives much of its profitability. Over the years, Amazon’s reinvestment strategy—focusing on innovation, infrastructure, and expansion into areas like artificial intelligence, streaming, and advertising—has contributed to sustained long-term growth. Though the stock has experienced volatility tied to macroeconomic trends and consumer spending cycles, Amazon remains a cornerstone of many investment portfolios due to its diversified business model, global reach, and continued leadership in digital transformation.",
  Google:
    "Alphabet Inc. (NASDAQ: GOOGL, GOOG), the parent company of Google, is one of the world’s most powerful technology firms and a major player in the stock market. Its stock performance reflects the company’s dominance in digital advertising, search, and online media through platforms like Google Search, YouTube, and Google Ads. Alphabet’s consistent revenue growth is driven by its massive global user base and expanding ecosystem of products and services, including Android, Google Cloud, and AI innovations. Investors view Alphabet as a long-term growth stock, benefiting from strong cash flow, diversified revenue streams, and continued investment in cutting-edge technologies such as artificial intelligence, self-driving cars (Waymo), and quantum computing. Despite occasional regulatory and market challenges, Alphabet’s stock remains a bellwether for the tech sector and a key component of major indices like the S&P 500 and Nasdaq 100.",
  Microsoft:
    "Microsoft Corporation (NASDAQ: MSFT) is one of the most valuable and stable technology stocks in the world, known for its consistent growth, diversified business model, and strong financial performance. The company’s stock has been driven by its leadership in cloud computing through Azure, steady revenue from software products like Windows and Microsoft Office, and expanding ventures in AI, gaming, and enterprise solutions. Microsoft’s strategic focus on recurring revenue through subscription models such as Microsoft 365 and its cloud-based services has strengthened its long-term profitability and resilience. The company also benefits from a strong balance sheet, regular dividend payments, and substantial share buybacks, making it a favorite among both growth and income investors. As a key component of the S&P 500 and Nasdaq 100, Microsoft’s stock serves as a benchmark for the broader technology sector and continues to reflect investor confidence in its innovation and global influence.",
  Tesla:
    "Tesla, Inc. (NASDAQ: TSLA) is one of the most closely watched and volatile stocks in the global market, known for redefining the automotive and energy industries through innovation and bold leadership. Its stock performance reflects both investor enthusiasm for the company’s pioneering role in electric vehicles (EVs) and the influence of its CEO, Elon Musk. Tesla’s rapid growth in vehicle production, expansion into global markets, and leadership in battery technology and autonomous driving have fueled significant long-term gains, even amid short-term fluctuations. Beyond cars, Tesla’s diversification into energy storage, solar products, and AI-driven technologies positions it as a multifaceted clean energy company. While often subject to sharp market reactions and valuation debates, Tesla’s stock remains a symbol of technological disruption, investor optimism, and the transition toward a sustainable energy future.",
  Nvidia:
    "NVIDIA Corporation (NASDAQ: NVDA) is one of the most influential and fastest-growing stocks in the technology sector, renowned for its leadership in graphics processing units (GPUs) and artificial intelligence (AI) computing. Once primarily focused on gaming hardware, NVIDIA has evolved into a powerhouse driving innovation across industries such as data centers, autonomous vehicles, and AI research. Its stock performance has surged in recent years, reflecting explosive demand for GPUs that power machine learning models, cloud infrastructure, and high-performance computing. NVIDIA’s strong margins, technological dominance, and expanding ecosystem have made it a cornerstone of the semiconductor industry and a key player in the AI revolution. Despite cyclical market pressures in the chip sector, NVIDIA’s consistent innovation and strategic positioning have cemented its reputation as a high-growth, transformative stock that continues to attract both institutional and retail investors.",
  Netflix:
    "Netflix, Inc. (NASDAQ: NFLX) is a leading global streaming entertainment company whose stock reflects both its pioneering role in the digital media industry and its adaptability in a highly competitive market. Originally a DVD-by-mail service, Netflix transformed into a streaming powerhouse, reshaping how audiences consume television and film. Its stock performance has been driven by strong subscriber growth, international expansion, and a commitment to original content, which has produced global hits across genres and languages. Although Netflix has faced periods of volatility due to rising competition from other streaming platforms and shifting consumer trends, it continues to demonstrate resilience through innovations like ad-supported tiers and gaming initiatives. As one of the key “FAANG” stocks, Netflix remains a major influence on the entertainment sector and a symbol of the ongoing evolution of digital content consumption.",
  Meta:
    "Meta Platforms, Inc. (NASDAQ: META), formerly known as Facebook, is one of the world’s largest social media and technology companies, and its stock reflects both its dominance in digital advertising and its ambitious pivot toward the metaverse. Meta’s core platforms — Facebook, Instagram, WhatsApp, and Messenger — generate massive user engagement and advertising revenue, forming the foundation of its financial strength. In recent years, the company has expanded its focus to include virtual and augmented reality through its Reality Labs division, investing heavily in technologies that aim to shape the future of digital interaction. Meta’s stock has experienced volatility tied to advertising trends, regulatory scrutiny, and investor reactions to its metaverse spending, but it has also rebounded strongly amid growing interest in AI integration and cost-efficiency measures. As a key component of the S&P 500 and Nasdaq 100, Meta remains a defining force in both social media innovation and next-generation computing.",
  Gold: "Gold (ticker: XAU/USD or tracked through ETFs like GLD) is one of the world’s oldest and most enduring investment assets, often viewed as a safe haven during times of economic uncertainty. Unlike stocks or bonds, gold does not generate income, but it holds intrinsic value and serves as a hedge against inflation, currency fluctuations, and market volatility. Its price tends to rise when investor confidence in financial markets declines or when central banks implement loose monetary policies. Gold is also influenced by global demand for jewelry, central bank reserves, and geopolitical tensions. While its short-term movements can be volatile, gold’s long-term stability and historical role as a store of value make it a core component of many diversified investment portfolios, appealing to both institutional and individual investors seeking security and balance.",
  Silver:
    "Silver (ticker: XAG/USD or tracked through ETFs like SLV) is a precious metal valued both as an investment asset and an essential industrial commodity. Its dual role gives silver a unique position in the global market—serving as both a store of value, like gold, and a key material in industries such as electronics, solar energy, and medical technology. Silver’s price is often more volatile than gold’s, as it is influenced not only by investor sentiment and inflation expectations but also by changes in industrial demand and global economic growth. Historically, silver has been viewed as a hedge against currency depreciation and inflation, and it often moves in tandem with gold during periods of financial uncertainty. Because of its affordability, high liquidity, and diverse applications, silver remains a popular choice for investors seeking exposure to precious metals with greater growth potential.",
  "Crude oil":
    "Crude oil (commonly traded under benchmarks like WTI and Brent) is one of the most vital and actively traded commodities in the world, serving as the backbone of global energy markets. Its price reflects a complex interplay of supply and demand dynamics, geopolitical tensions, production decisions by OPEC+, and macroeconomic trends. Crude oil is the primary input for fuels such as gasoline, diesel, and jet fuel, as well as for countless petrochemical products, making it essential to industrial activity and global trade. Prices often rise during periods of strong economic growth or supply disruptions and fall when demand weakens or production increases. Because of this volatility, crude oil is both a key economic indicator and a popular asset for investors and traders seeking to hedge against inflation or speculate on global energy trends. Despite growing investment in renewable energy, crude oil remains a cornerstone of the world economy and a major driver of financial markets.",
  "Natural Gas":
    "Natural gas (ticker: NG or tracked through ETFs like UNG) is a crucial energy commodity that plays a central role in global electricity generation, heating, and industrial production. Its price is highly sensitive to seasonal demand fluctuations, weather patterns, and changes in supply from major producers such as the United States, Russia, and Qatar. Unlike oil, natural gas is often traded regionally due to transportation limitations, though the rise of liquefied natural gas (LNG) has increasingly globalized the market. Investors view natural gas as both an essential energy source and a volatile trading asset, as prices can swing sharply in response to shifts in storage levels, production rates, and geopolitical events. With growing interest in cleaner energy alternatives, natural gas is often seen as a “bridge fuel” in the transition from coal and oil toward renewable energy, maintaining its importance in the evolving global energy landscape.",
  Ethereum:
    "Ethereum (ticker: ETH) is the world’s second-largest cryptocurrency by market capitalization and a cornerstone of the blockchain ecosystem. Unlike Bitcoin, which primarily functions as a store of value, Ethereum was designed as a decentralized computing platform that enables smart contracts and decentralized applications (dApps). Its native token, Ether, is used to pay transaction fees and power operations on the Ethereum network. The 2022 transition to a proof-of-stake consensus mechanism, known as “The Merge,” significantly reduced Ethereum’s energy consumption and positioned it for greater scalability through future upgrades. Ethereum’s price is driven by factors such as network activity, developer adoption, DeFi (decentralized finance) growth, and broader market sentiment toward cryptocurrencies. Despite volatility common in the crypto market, Ethereum remains a foundational digital asset—valued for its innovation, versatility, and potential to support the next generation of Web3 technologies.",
  "Nasdaq 100":
    "The Nasdaq-100 Index (ticker: NDX) is benchmark stock market index that tracks the performance of the 100 largest non-financial companies listed on the Nasdaq Stock Exchange. It is heavily weighted toward technology and innovation-driven sectors, including major firms such as Apple, Microsoft, Amazon, NVIDIA, and Alphabet. As a result, the Nasdaq-100 is often seen as a barometer for the broader tech industry and investor sentiment toward high-growth companies. The index’s performance tends to be influenced by trends in artificial intelligence, cloud computing, e-commerce, and digital services. It has historically outperformed more diversified indices like the S&P 500 during periods of tech expansion, though it can be more volatile during market downturns. Investors can gain exposure to the Nasdaq-100 through ETFs such as the Invesco QQQ Trust (QQQ), making it a popular choice for those seeking growth-oriented, innovation-focused market exposure.",
  "S&P 500":
    "The S&P 500 Index (Standard & Poor’s 500, ticker: SPX) is one of the most widely followed stock market benchmarks in the world, representing the performance of 500 of the largest publicly traded companies in the United States. It spans all major sectors of the economy, including technology, healthcare, finance, energy, and consumer goods, providing a comprehensive snapshot of the overall U.S. stock market and economy. The index is market-cap weighted, meaning that larger companies like Apple, Microsoft, Amazon, and NVIDIA have a greater influence on its movements. The S&P 500 is often used by investors as a measure of broad market health and as a benchmark for portfolio performance. Historically, it has delivered steady long-term growth, reflecting the resilience and innovation of the U.S. economy. Investors can gain exposure through index funds and ETFs such as the SPDR S&P 500 ETF (SPY), making it a cornerstone of both institutional and individual investment strategies.",
};

//  Helper: Calculate cons
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

// ---------- Custom Legend (clickable; passes real dataKey + displayName) ----------
const CustomLegend = ({ payload, onSelectAsset }) => (
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
      const rawKey = String(entry.value); // actual dataKey from chart
      const cleanName = rawKey.replace(/_[^_]+$/, "").replace(/_/g, " ");
      const logo = assetLogos[cleanName];

      return (
        <div
          key={`${entry.dataKey || entry.value}-${idx}`}
          role="button"
          tabIndex={0}
          onClick={() =>
            onSelectAsset?.({ dataKey: rawKey, displayName: cleanName })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectAsset?.({ dataKey: rawKey, displayName: cleanName });
            }
          }}
          title={`View ${cleanName} details`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color,
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
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

// ---------- Small stat card ----------
function StatCard({ label, value, fmt }) {
  const display =
    value == null
      ? "—"
      : fmt === "pct"
      ? `${(value >= 0 ? "+" : "")}${value.toFixed(2)}%`
      : fmt === "money"
      ? `$${Number(value).toLocaleString()}`
      : String(value);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 12,
        color: "white",
        minHeight: 78,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <div style={{ opacity: 0.8, fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{display}</div>
    </div>
  );
}

// ---------- Asset Detail Screen ----------
function AssetDetail({ assetKey, displayName, allData, onBack }) {
  const logo = assetLogos[displayName];

  // Compute quick stats (latest, 7d change, 30d change)
  const { latest, chg7, chg30 } = useMemo(() => {
    if (!allData?.length) return { latest: null, chg7: null, chg30: null };
    const priceSeries = allData
      .map((d) => ({ ts: d.dateTs, v: d[assetKey] }))
      .filter((x) => Number.isFinite(x.v));
    if (!priceSeries.length) return { latest: null, chg7: null, chg30: null };

    const last = priceSeries[priceSeries.length - 1].v;
    const idx7 = Math.max(priceSeries.length - 8, 0);
    const idx30 = Math.max(priceSeries.length - 31, 0);
    const v7 = priceSeries[idx7].v;
    const v30 = priceSeries[idx30].v;
    const pct = (a, b) => (b ? ((a - b) / b) * 100 : null);

    return { latest: last, chg7: pct(last, v7), chg30: pct(last, v30) };
  }, [allData, assetKey]);

  return (
    <div
      style={{
        width: "92%",
        height: "85vh",
        maxHeight: 860,
        background: "rgba(0,0,0,0.7)",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "white",
          padding: "4px 6px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        {logo && (
          <img
            src={logo}
            alt={`${displayName} logo`}
            style={{ width: 28, height: 28, borderRadius: 6 }}
          />
        )}
        <h2 style={{ margin: 0, fontSize: 22, letterSpacing: 0.4 }}>
          {displayName}
        </h2>
      </div>

      {/* About + Stats */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          color: "white",
        }}
      >
        <div
          style={{
            flex: "1 1 320px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 12,
            minWidth: 280,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>About</div>
          <div style={{ opacity: 0.9 }}>
            {assetAbout[displayName] ||
              "Single-asset detail view. Add your own company/asset profile here."}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
            gap: 12,
            flex: "2 1 420px",
            minWidth: 320,
          }}
        >
          <StatCard label="Latest Price" value={latest} fmt="money" />
          <StatCard label="7-Day Change" value={chg7} fmt="pct" />
          <StatCard label="30-Day Change" value={chg30} fmt="pct" />
        </div>
      </div>

      {/* Single-asset Chart */}
      <div style={{ flex: 1, minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={allData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#444" />
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
            <YAxis
              stroke="#e5e7eb"
              tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 700 }}
            />
            <Tooltip
              labelFormatter={(ts) => fmtUTC(ts)}
              formatter={(val) => [`$${Number(val).toLocaleString()}`, displayName]}
            />
            <Line
              type="monotone"
              dataKey={assetKey} // REAL data key from CSV (e.g., Apple_Price)
              stroke="rgb(73, 160, 246)"
              strokeWidth={3}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Main ----------
const MetricsChart = () => {
  const [chartData, setChartData] = useState([]); // [{ dateTs, dateLabel, <assetRawKey>: price, ... }, ...]
  const [assets, setAssets] = useState([]); // list of unique asset raw keys
  const [hoveredIndex, setHoveredIndex] = useState(null); // which index is hovered for streak calc
  const [showInfo, setShowInfo] = useState(false); // info bubble toggle

  // NEW: which asset's detail screen is open
  // { dataKey: "Apple_Price", displayName: "Apple" } or null
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load & parse CSV data on component mount
  useEffect(() => {
    Papa.parse("/data_with_forecast.csv", {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: ({ data }) => {
        const grouped = {};
        const assetsSet = new Set();
        const excludeAssets = new Set([
          "Bitcoin_Price",
          "Nasdaq_100_Price",
          "S&P_500_Price",
        ]);

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

          assetsSet.add(asset); // raw key as it appears in CSV (e.g., Apple_Price)
        });

        // Sort chronologically by timestamp
        const result = Object.values(grouped).sort((a, b) => a.dateTs - b.dateTs);

        // Unique asset raw keys (filtered, sorted)
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

  const isDetail = Boolean(selectedAsset);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000",
        backgroundImage: !isDetail && bg ? `url(${bg})` : "none",
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
        {isDetail ? "Asset Detail" : "Market Climate"}
      </h1>

      {/* Info Icon and Tooltip (overview only) */}
      {!isDetail && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 15,
            cursor: "pointer",
          }}
        >
          <span
            role="button"
            aria-label="Open market climate info"
            tabIndex={0}
            onClick={() => setShowInfo((s) => !s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowInfo((s) => !s);
              } else if (e.key === "Escape") {
                setShowInfo(false);
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.6)",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
              userSelect: "none",
              outline: "none",
            }}
          >
            ?
          </span>

          {showInfo && (
            <div
              style={{
                position: "absolute",
                top: 38,
                right: 0,
                width: 300,
                background: "rgba(0,0,0,0.88)",
                color: "white",
                padding: "12px 16px",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                fontSize: 14,
                lineHeight: 1.5,
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(2px)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>About Market Climate</strong>
                <button
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: 0 }}>
                  The <b>Market Climate</b> chart visualizes daily price trends for a variety
                  of assets, including major stocks, commodities, and cryptocurrencies. Each
                  colored line represents an asset’s performance over time, with corresponding
                  logos in the legend for easy identification. The chart’s background changes
                  between sunny and rainy themes depending on the recent streak of the
                  most popular stock, sunny for consecutive gains and rainy for consecutive
                  losses, providing a quick sense of overall market mood. Hovering over the
                  chart reveals a tooltip displaying each asset’s exact price for that date,
                  allowing for clear comparisons. The x-axis shows the date in UTC, while the
                  y-axis indicates price levels, making this visualization an engaging way to
                  view both detailed data and broader market trends at once.
                </p>

                <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
                  <li>Hover to see exact values and rankings for the day.</li>
                  <li>Legend logos match the line colors for each asset.</li>
                  <li>Dates are shown in UTC.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Semi-transparent top bar */}
      <div
        style={{
          height: 68,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Main screen container */}
      <div
        style={{
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* Detail Screen */}
        {selectedAsset ? (
          <AssetDetail
            assetKey={selectedAsset.dataKey}
            displayName={selectedAsset.displayName}
            allData={chartData}
            onBack={() => setSelectedAsset(null)}
          />
        ) : (
          // Overview Screen
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
                          <div style={{ marginBottom: 6 }}>{fmtUTC(label)}</div>

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

                {/* Legend with custom logos (now clickable) */}
                <Legend
                  content={(props) => (
                    <CustomLegend
                      {...props}
                      onSelectAsset={({ dataKey, displayName }) =>
                        setSelectedAsset({ dataKey, displayName })
                      }
                    />
                  )}
                />

                {/* Render a line for each asset (use RAW keys) */}
                {assets.map((assetKey, i) => (
                  <Line
                    key={`line-${assetKey}`}
                    type="monotone"
                    dataKey={assetKey} // raw key like "Apple_Price"
                    stroke={getColor(i)}
                    strokeWidth={3}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsChart;

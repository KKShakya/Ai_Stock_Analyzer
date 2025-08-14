"use client";
import { dummyStockData } from "@/data/dummyStockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MarketSentiment() {
  const { price, changePercent, ticker, chart, sentiment, tradeSignal } =
    dummyStockData;

  return (
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Market Sentiment</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            changePercent >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {changePercent >= 0 ? "Bullish" : "Bearish"}
        </span>
      </div>

      {/* Price */}
      <p className="text-xl font-semibold mb-3">
        {ticker}: ${price.toFixed(2)}{" "}
        <span
          className={`ml-2 font-semibold ${
            changePercent >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ({changePercent.toFixed(2)}%)
        </span>
      </p>

      {/* Chart */}
      <div className="w-full h-[240px] mb-4">
        <ResponsiveContainer>
          <LineChart data={chart}>
            <XAxis dataKey="date" />
            <YAxis domain={["dataMin - 20", "dataMax + 20"]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment & Trade Signal */}
      <div className="mt-auto">
        <p className="mb-1">
          Sentiment Score:{" "}
          <span
            className={`font-semibold ${
              sentiment.score >= 0.5 ? "text-green-700" : "text-red-700"
            }`}
          >
            {sentiment.score} ({sentiment.label})
          </span>
        </p>

        <p
          className={`text-lg font-bold ${
            tradeSignal === "BUY"
              ? "text-green-700"
              : tradeSignal === "SELL"
              ? "text-red-700"
              : "text-gray-700"
          }`}
        >
          Trade Signal: {tradeSignal}
        </p>
      </div>
    </div>
  );
}

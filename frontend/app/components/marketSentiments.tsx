"use client"
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
  const { price, changePercent, ticker, chart, sentiment, tradeSignal } = dummyStockData;

  return (
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg">
      <h3 className="text-lg font-medium mb-2">Market Sentiment</h3>

      <p className="text-xl font-semibold mb-2">
        {ticker}: ${price.toFixed(2)}{" "}
        <span
          className={`ml-2 font-semibold ${
            changePercent >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ({changePercent.toFixed(2)}%)
        </span>
      </p>

      <div className="w-full h-40 mb-4">
        <ResponsiveContainer>
          <LineChart data={chart}>
            <XAxis dataKey="date" />
            <YAxis domain={["dataMin - 20", "dataMax + 20"]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
        className={`text-xl font-bold ${
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
  );
}

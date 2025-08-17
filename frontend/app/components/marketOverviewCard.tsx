"use client";
import React from "react";

const dummyMarket = {
  timestamp: new Date().toISOString(),
  indices: [
    { name: "NIFTY 50", value: 24837.2, change: +74.4, changePct: +0.3 },
    { name: "BANKNIFTY", value: 52250.8, change: -122.7, changePct: -0.23 },
    { name: "SENSEX", value: 82204.1, change: +245.3, changePct: +0.31 },
    { name: "VIX", value: 13.2, change: -0.8, changePct: -5.7 }
  ]
};

export default function MarketOverviewCard() {
  return (
    <div className="rounded-lg shadow p-4 bg-white dark:bg-card space-y-2">
      <div className="font-semibold mb-2">Market Overview</div>
      <div className="flex gap-4 flex-wrap">
        {dummyMarket.indices.map((i) => (
          <div key={i.name} className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">{i.name}</span>
            <span className="font-bold">
              {i.value}
              <span className={`ml-2 ${i.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {i.change >= 0 ? "+" : ""}
                {i.change} ({i.changePct >= 0 ? "+" : ""}
                {i.changePct}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

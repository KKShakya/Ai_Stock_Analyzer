"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/metricCard";

export default function MarketOverview() {
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/market/overview")
      .then(res => res.json())
      .then(data => setMarketData(data))
      .catch(err => console.error("Market data fetch error:", err));
  }, []);

  if (!marketData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {marketData?.indices?.map(ix => (
        <MetricCard
          key={ix.name}
          title={ix.name}
          value={ix.value}
          change={ix.change}
          changePercent={ix.changePct}
          isPositive={ix.change >= 0}
        />
      ))}
    </div>
  );
}

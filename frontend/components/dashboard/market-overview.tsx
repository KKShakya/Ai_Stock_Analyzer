"use client"

import { useEffect, useState } from "react";
import MetricCard from "../ui/metricCard";

export default function MarketOverview() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/v1/market/overview");
      const data = await response.json();
      
      if (data.success) {
        setMarketData(data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch market data');
      }
    } catch (err) {
      setError(err.message);
      console.error("Market data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading market data: {error}</p>
        <button 
          onClick={fetchMarketData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
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

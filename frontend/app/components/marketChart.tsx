// components/MarketChartCard.tsx
"use client";
import { useState, useEffect } from "react";
import SectionCard from "@/components/ui/section-card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";



export default function MarketChartCard({ indices }) {
  const defaultIndexKey = indices?.[0]?.name || "NIFTY 50";
  const [selectedIndex, setSelectedIndex] = useState(defaultIndexKey);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get dummy data based on selected index
  useEffect(() => {
    if (!selectedIndex) return;
    
    setLoading(true);
    
   
    fetch(`http://localhost:8080/api/v1/market/chart?index=${encodeURIComponent(selectedIndex)}`)
      .then(res => res.json())
      .then(data => setChartData(data.prices ?? []))
      .catch(err => console.error('Chart data error:', err))
      .finally(() => setLoading(false));
    
  }, [selectedIndex]);

  // Fallback indices if none provided
  const availableIndices = indices && indices.length > 0 
    ? indices 
    : [
        { name: "NIFTY 50" },
        { name: "BANKNIFTY" },
        { name: "SENSEX" },
        { name: "VIX" }
      ];

  return (
    <SectionCard
      title="Market Chart"
      subtitle="Historical trends and analysis"
      icon={<TrendingUp className="h-5 w-5" />}
      actions={
        <Select value={selectedIndex} onValueChange={setSelectedIndex}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select Index" />
          </SelectTrigger>
          <SelectContent>
            {availableIndices.map(ix => (
              <SelectItem key={ix.name} value={ix.name}>
                {ix.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      className="h-[380px] min-h-[380px]"
    >
      <div className="flex flex-col h-full">
        {/* Chart Area */}
        <div className="flex-1 min-h-[260px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  className="opacity-30" 
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {chartData.length > 0 ? chartData[chartData.length - 1]?.close?.toLocaleString('en-IN') : '--'}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">
                +{chartData.length > 0 ? ((chartData[chartData.length - 1]?.close - chartData[0]?.close) || 0).toFixed(2) : '0'}
              </div>
              <div className="text-xs text-muted-foreground">Change</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {chartData.length}
              </div>
              <div className="text-xs text-muted-foreground">Data Points</div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

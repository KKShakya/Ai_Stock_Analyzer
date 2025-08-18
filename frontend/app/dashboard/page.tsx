"use client"
import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, Newspaper, Brain } from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import OISentimentCard from "../components/PCRData";
import NewsFeed from "../components/newsFeed";
import AIStrategyChatCard from "../components/aiStrategyChart";
import MetricCard from "@/components/ui/metricCard";
import MarketChartCard from "../components/marketChart";




export default function DashboardPage() {

  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/market/overview")
      .then(res => res.json())
      .then(data => setMarketData(data));
  }, []);

  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {marketData?.indices.map(ix => (
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side - Main Charts */}
          <div className="lg:col-span-2 space-y-6">
           
              <MarketChartCard indices={1} />
            
            
            <SectionCard 
              title="AI Strategy Assistant" 
              subtitle="AI-powered trading recommendations"
              icon={<Brain className="h-5 w-5" />}
              className="h-80"
            >
              <AIStrategyChatCard />
            </SectionCard>
          </div>

          {/* Right Side - Widgets */}
          <div className="space-y-6">
            <SectionCard 
              title="OI & PCR Analysis" 
              subtitle="Options flow and PCR trends"
              icon={<BarChart3 className="h-5 w-5" />}
              className="h-96"
              contentClassName="overflow-auto"
            >
              <OISentimentCard />
            </SectionCard>
            
            <SectionCard 
              title="Market News" 
              subtitle="Latest market headlines"
              icon={<Newspaper className="h-5 w-5" />}
              className="h-80"
              contentClassName="overflow-auto"
            >
              <NewsFeed />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

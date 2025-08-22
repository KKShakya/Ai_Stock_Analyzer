// app/dashboard/page.tsx - UPDATED VERSION
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, Newspaper, Brain } from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import MarketOverview from "@/components/dashboard/market-overview";
import OISentimentCard from "../components/PCRData";
import NewsFeed from "../components/newsFeed";
import AIStrategyChatCard from "../components/aiStrategyChart";
import MarketChartCard from "../components/marketChart";
import WatchlistCard from "@/components/dashboard/watchlist-card";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="min-h-screen bg-background p-2 space-y-6">
          
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              AI Stock Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your personalized trading command center
            </p>
          </div>

          {/* Top Metrics Row - Using your MarketOverview component */}
          <MarketOverview />

          {/* Main Content Grid - Your existing layout */}
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
              <WatchlistCard />

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
      
    </DashboardShell>
  );
}

"use client";

import {BarChart3, Newspaper } from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import MarketOverview from "@/components/dashboard/market-overview";
import OISentimentCard from "../components/PCRData";
import NewsFeed from "../components/newsFeed";
import MarketChartCard from "../components/marketChart";
import WatchlistCard from "@/components/dashboard/watchlist-card";
import AIChatCard from "@/components/dashboard/ai-chat";
import PriceChart from "@/components/dashboard/price-chart";

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
            <PriceChart />

            
            <SectionCard
              title="OI & PCR Analysis"
              subtitle="Options flow and PCR trends"
              icon={<BarChart3 className="h-5 w-5" />}
              className="h-96"
              contentClassName="overflow-auto"
            >
              <OISentimentCard />
            </SectionCard>
          
          </div>

          {/* Right Side - Widgets */}
          <div className="space-y-6">
            <WatchlistCard />
            <AIChatCard />
            

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

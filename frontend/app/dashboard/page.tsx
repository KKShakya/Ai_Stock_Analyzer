"use client"
import { TrendingUp, Table as TableIcon, Newspaper, Gauge } from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import KpiPill from "@/components/ui/kpi-pill";
import MarketSentiment from "../components/marketSentiments";
import OIAndPCRTrends from "../components/PCRData";
import NewsFeed from "../components/newsFeed";
import LoadingSkeleton from "../components/loadingSkeleton";
import OnboardingBanner from "../components/onBoradingBanner"
import { useState, useEffect } from "react"



export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500) // Simulate loading
    return () => clearTimeout(timer)
  }, [])


  return (
    <div>
      <OnboardingBanner />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div>
          <div className="grid gap-6 xl:grid-cols-5 xl:grid-rows-2">
      {/* Left side: 2×2 layout */}
      <div className="xl:col-span-4 xl:row-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 xl:grid-rows-2 gap-6">
        <SectionCard
          title="Market Sentiment"
          description="Aggregated signal from news, social and options flow"
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <div className="h-[280px]">
            <MarketSentiment />
          </div>
        </SectionCard>

        <SectionCard
          title="OI & PCR Trends"
          description="Strike-wise Open Interest and intraday change"
          icon={<TableIcon className="h-4 w-4" />}
        >
          <div className="h-[280px] overflow-auto rounded-lg border border-border">
            <OIAndPCRTrends />
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Stats"
          description="Key metrics at a glance"
          icon={<Gauge className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KpiPill label="Revenue" value="13.2%" trend="up" />
            <KpiPill label="Gross Margin" value="25.03%" trend="up" />
            <KpiPill label="ROE" value="31.03%" trend="up" />
            <KpiPill label="VIX" value="12.3" trend="down" />
          </div>
        </SectionCard>

        <SectionCard
          title="News Feed"
          description="Relevant headlines for tracked tickers"
          icon={<Newspaper className="h-4 w-4" />}
        >
          <NewsFeed />
        </SectionCard>
      </div>

      {/* Right side: extra widgets */}
      <div className="xl:col-span-1 space-y-3">
        <SectionCard title="Additional Widget 1">
          <p className="text-sm text-muted-foreground">Details or charts go here</p>
        </SectionCard>

        <SectionCard title="Additional Widget 2">
          <p className="text-sm text-muted-foreground">More info, stats, or news feed</p>
        </SectionCard>
      </div>
    </div>
        </div>
      )}
    </div>
      
  );
}

import MarketSentiment from "../components/marketSentiments"
import NewsFeed from "../components/newsFeed";
import OIAndPCRTrends from "../components/PCRData";
import QuickStats from "../components/QuickStats";

// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="max-w-full flex gap-6">

  {/* Left side: 2x2 grid */}
  <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-1">
    <MarketSentiment />
    <OIAndPCRTrends />
    <NewsFeed />
    <QuickStats />
  </div>

  {/* Right side: single column, full height, fixed width */}
  <div className="w-72 flex flex-col gap-6">
    {/* Add multiple stacked cards/widgets here */}
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg">
      <h3 className="text-lg font-medium mb-2">Additional Widget 1</h3>
      <p>Details or charts go here</p>
    </div>

    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg">
      <h3 className="text-lg font-medium mb-2">Additional Widget 2</h3>
      <p>More info, stats, or news feed</p>
    </div>

    {/* Add more widgets as needed */}
  </div>

</div>

    
  );
}

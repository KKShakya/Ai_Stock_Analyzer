import { dummyStockData } from "@/data/dummyStockData";

export default function QuickStats() {
  const { stats } = dummyStockData;

  return (
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg">
      <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-center font-semibold capitalize"
          >
            {key}: {value}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-center font-semibold">
          Nifty 1D: +0.9%
        </div>
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-center font-semibold">
          VIX: 12.3
        </div>
      </div>
    </div>
  );
}

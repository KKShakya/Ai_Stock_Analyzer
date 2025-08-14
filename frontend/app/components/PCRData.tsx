// app/dashboard/components/OIAndPCRTrends.tsx
import { dummyStockData } from "@/data/dummyStockData";

export default function OIAndPCRTrends() {
  const { options } = dummyStockData;

  return (
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg overflow-x-auto">
      <h3 className="text-lg font-medium mb-4">OI & PCR Trends</h3>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-200 dark:bg-background">
          <tr>
            <th className="py-2 px-3 text-left">Strike Price</th>
            <th className="py-2 px-3 text-left">Type</th>
            <th className="py-2 px-3 text-right">Open Interest</th>
            <th className="py-2 px-3 text-right">Change in OI</th>
            <th className="py-2 px-3 text-right">Volume</th>
            <th className="py-2 px-3 text-right">Last Price</th>
            <th className="py-2 px-3 text-right">Delta</th>
            <th className="py-2 px-3 text-right">Gamma</th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-gray-50 dark:bg-background" : "bg-white dark:bg-gray-600"}
            >
              <td className="py-1 px-3">{opt.strikePrice}</td>
              <td
                className={`py-1 px-3 font-semibold ${
                  opt.type === "CE" ? "text-green-600" : "text-red-600"
                }`}
              >
                {opt.type}
              </td>
              <td className="py-1 px-3 text-right">{opt.openInterest.toLocaleString()}</td>
              <td
                className={`py-1 px-3 text-right ${
                  opt.changeInOI >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {opt.changeInOI.toLocaleString()}
              </td>
              <td className="py-1 px-3 text-right">{opt.volume.toLocaleString()}</td>
              <td className="py-1 px-3 text-right">${opt.lastPrice.toFixed(2)}</td>
              <td className="py-1 px-3 text-right">{opt.delta.toFixed(2)}</td>
              <td className="py-1 px-3 text-right">{opt.gamma.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
